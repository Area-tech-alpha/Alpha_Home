"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { submitLead01lp } from "@/app/actions/submit-lead-01lp";
import type PhoneFieldType from "@/components/ui/phone-field";
import { content01lp } from "@/lib/content-01-lp";
import {
  TRACKING_KEYS_01LP,
  TRACKING_STORAGE_KEY_01LP,
  TRACKING_TTL_MS_01LP,
  type LeadTracking01lp,
} from "@/lib/lead-01lp-constants";
import { FATURAMENTO_EXIGE_EXTRAS } from "@/lib/lead-constants";

const { form } = content01lp;
const { fields } = form;

// Seletor de DDI e zod fora do JS inicial (mesma estratégia do form da home).
type PhoneFieldComponent = typeof PhoneFieldType;
let phoneFieldPromise: Promise<PhoneFieldComponent> | null = null;
function loadPhoneField() {
  phoneFieldPromise ??= import("@/components/ui/phone-field").then((m) => m.default);
  return phoneFieldPromise;
}

function fallbackToE164(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits ? `+55${digits}` : undefined;
}

function maskCNPJ(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

// First-touch: a primeira visita com parâmetros de campanha fica gravada por 30
// dias e não é sobrescrita por visitas seguintes. fbc/gcl_aw vêm dos cookies
// _fbc/_gcl_aw quando existirem; sem cookie, o fbc segue o formato do Meta
// (fb.1.<timestamp ms>.<fbclid>) a partir do fbclid da URL.
function readFirstTouch(): LeadTracking01lp {
  let stored: { at: number; tracking: LeadTracking01lp } | null = null;
  try {
    stored = JSON.parse(localStorage.getItem(TRACKING_STORAGE_KEY_01LP) ?? "null");
  } catch {
    stored = null;
  }
  const valid = stored && Date.now() - stored.at < TRACKING_TTL_MS_01LP ? stored.tracking : null;

  const fromUrl: LeadTracking01lp = {};
  const params = new URLSearchParams(window.location.search);
  for (const key of TRACKING_KEYS_01LP) {
    const value = params.get(key);
    if (value) fromUrl[key] = value;
  }
  if (fromUrl.fbclid && !fromUrl.fbc) fromUrl.fbc = `fb.1.${Date.now()}.${fromUrl.fbclid}`;

  const tracking = valid ?? fromUrl;
  if (!valid && Object.keys(fromUrl).length > 0) {
    try {
      localStorage.setItem(TRACKING_STORAGE_KEY_01LP, JSON.stringify({ at: Date.now(), tracking: fromUrl }));
    } catch {
      // Sem storage (aba anônima): vale só para esta visita.
    }
  }

  const fbcCookie = readCookie("_fbc");
  const gclCookie = readCookie("_gcl_aw");
  return {
    ...tracking,
    ...(!tracking.fbc && fbcCookie && { fbc: fbcCookie }),
    ...(!tracking.gcl_aw && gclCookie && { gcl_aw: gclCookie }),
  };
}

type FormValues = {
  nome: string;
  email: string;
  telefone: string | undefined;
  empresa: string;
  segmento: string;
  faturamento: string;
  cnpj: string;
  investiria: string;
};
type FieldName = keyof FormValues;

const initial: FormValues = {
  nome: "",
  email: "",
  telefone: undefined,
  empresa: "",
  segmento: "",
  faturamento: "",
  cnpj: "",
  investiria: "",
};

const inputClass = "field-input";

function FieldError({ name, message }: { name: FieldName; message?: string }) {
  if (!message) return null;
  return (
    <span id={`erro-${name}`} className="mt-1 block text-[11.5px] text-error" role="alert">
      {message}
    </span>
  );
}

function Select({
  id,
  value,
  placeholder,
  options,
  error,
  onChange,
}: {
  id: FieldName;
  value: string;
  placeholder?: string;
  options: readonly string[];
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={id}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `erro-${id}` : undefined}
        className={`${inputClass} ${value ? "" : "text-text-dim"}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-white"
        aria-hidden="true"
      >
        <svg viewBox="0 0 320 512" width="10" height="16" fill="currentColor">
          <path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z" />
        </svg>
      </span>
    </div>
  );
}

export default function LeadForm01lp() {
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [sending, setSending] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const trackingRef = useRef<LeadTracking01lp>({});
  const [PhoneField, setPhoneField] = useState<ComponentType<Parameters<PhoneFieldComponent>[0]> | null>(null);
  const [rawPhone, setRawPhone] = useState("");
  const rawPhoneRef = useRef("");
  const [phoneFocused, setPhoneFocused] = useState(false);

  function warmUp() {
    if (PhoneField) return;
    loadPhoneField().then((Component) => {
      setValues((prev) => (prev.telefone ? prev : { ...prev, telefone: fallbackToE164(rawPhoneRef.current) }));
      setPhoneField(() => Component);
    });
  }

  useEffect(() => {
    trackingRef.current = readFirstTouch();
  }, []);

  const needsExtras = values.faturamento === FATURAMENTO_EXIGE_EXTRAS;

  function set(field: FieldName, value: string | undefined) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  // Como no WP: em "Até 30 mil" aparecem CNPJ e "investiria", com "Sim" já marcado.
  function setFaturamento(value: string) {
    const extras = value === FATURAMENTO_EXIGE_EXTRAS;
    setValues((prev) => ({
      ...prev,
      faturamento: value,
      cnpj: extras ? prev.cnpj : "",
      investiria: extras ? prev.investiria || "Sim" : "",
    }));
    setErrors((prev) => ({ ...prev, faturamento: undefined, cnpj: undefined, investiria: undefined }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;

    const honeypot = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value;
    if (honeypot) return;

    const payload = {
      nome: values.nome.trim(),
      email: values.email.trim(),
      telefone: (PhoneField ? values.telefone : fallbackToE164(rawPhone)) ?? "",
      empresa: values.empresa.trim(),
      segmento: values.segmento,
      faturamento: values.faturamento,
      ...(needsExtras && { cnpj: values.cnpj, investiria: values.investiria || undefined }),
    };

    const { leadSchema } = await import("@/lib/validation");
    const parsed = leadSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<FieldName, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as FieldName;
        fieldErrors[field] ??= issue.message;
      }
      setErrors(fieldErrors);
      const first = Object.keys(fieldErrors)[0];
      if (first) document.getElementById(first)?.focus();
      return;
    }

    setSending(true);
    setGlobalError("");
    try {
      const res = await submitLead01lp(parsed.data, {
        ...trackingRef.current,
        debug_full_url: window.location.href,
      });
      if (res.success) {
        window.location.assign(res.redirectTo);
        return;
      }
      setGlobalError(res.error);
    } catch {
      setGlobalError(form.errors.webhook);
    }
    setSending(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      onFocusCapture={warmUp}
      onPointerDownCapture={warmUp}
      noValidate
      aria-label="Formulário de contato"
      className="flex flex-col gap-3"
    >
      <input type="text" name="website" tabIndex={-1} aria-hidden="true" autoComplete="off" className="hidden" />

      <div>
        <label htmlFor="nome" className="sr-only">
          {fields.nome.label}
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          autoComplete="name"
          required
          placeholder={fields.nome.placeholder}
          value={values.nome}
          onChange={(e) => set("nome", e.target.value)}
          aria-invalid={!!errors.nome}
          aria-describedby={errors.nome ? "erro-nome" : undefined}
          className={inputClass}
        />
        <FieldError name="nome" message={errors.nome} />
      </div>

      <div>
        <label htmlFor="email" className="sr-only">
          {fields.email.label}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={fields.email.placeholder}
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "erro-email" : undefined}
          className={inputClass}
        />
        <FieldError name="email" message={errors.email} />
      </div>

      <div className="lp01-phone">
        <label htmlFor="telefone" className="sr-only">
          {fields.telefone.label}
        </label>
        {PhoneField ? (
          <PhoneField
            value={values.telefone}
            onChange={(v) => set("telefone", v)}
            placeholder={fields.telefone.placeholder}
            invalid={!!errors.telefone}
            describedBy={errors.telefone ? "erro-telefone" : undefined}
            autoFocus={phoneFocused}
          />
        ) : (
          <div className="phone-input-wrapper">
            <span
              className="flex shrink-0 items-center gap-1.5 rounded-[10px] border border-border bg-white/[0.04] px-3 py-3 text-sm text-white"
              aria-hidden="true"
            >
              <span>🇧🇷</span>
              <span>+55</span>
              <span className="text-[10px] text-text-dim">▾</span>
            </span>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              autoComplete="tel"
              placeholder={fields.telefone.placeholder}
              value={rawPhone}
              onChange={(e) => {
                rawPhoneRef.current = e.target.value;
                setRawPhone(e.target.value);
              }}
              onFocus={() => setPhoneFocused(true)}
              aria-invalid={!!errors.telefone}
              aria-describedby={errors.telefone ? "erro-telefone" : undefined}
              className="PhoneInputInput"
            />
          </div>
        )}
        <FieldError name="telefone" message={errors.telefone} />
      </div>

      <div>
        <label htmlFor="empresa" className="sr-only">
          {fields.empresa.label}
        </label>
        <input
          id="empresa"
          name="empresa"
          type="text"
          autoComplete="organization"
          required
          placeholder={fields.empresa.placeholder}
          value={values.empresa}
          onChange={(e) => set("empresa", e.target.value)}
          aria-invalid={!!errors.empresa}
          aria-describedby={errors.empresa ? "erro-empresa" : undefined}
          className={inputClass}
        />
        <FieldError name="empresa" message={errors.empresa} />
      </div>

      <div>
        <label htmlFor="segmento" className="field-label mb-3">
          {fields.segmento.label}
        </label>
        <Select
          id="segmento"
          value={values.segmento}
          placeholder={fields.segmento.placeholder}
          options={fields.segmento.options}
          error={errors.segmento}
          onChange={(v) => set("segmento", v)}
        />
        <FieldError name="segmento" message={errors.segmento} />
      </div>

      <div>
        <label htmlFor="faturamento" className="field-label mb-3">
          {fields.faturamento.label}
        </label>
        <Select
          id="faturamento"
          value={values.faturamento}
          placeholder={fields.faturamento.placeholder}
          options={fields.faturamento.options}
          error={errors.faturamento}
          onChange={setFaturamento}
        />
        <FieldError name="faturamento" message={errors.faturamento} />
      </div>

      {needsExtras && (
        <>
          <div>
            <label htmlFor="cnpj" className="sr-only">
              {fields.cnpj.label}
            </label>
            <input
              id="cnpj"
              name="cnpj"
              type="text"
              inputMode="numeric"
              required
              placeholder={fields.cnpj.placeholder}
              value={values.cnpj}
              onChange={(e) => set("cnpj", maskCNPJ(e.target.value))}
              aria-invalid={!!errors.cnpj}
              aria-describedby={errors.cnpj ? "erro-cnpj" : undefined}
              className={inputClass}
            />
            <FieldError name="cnpj" message={errors.cnpj} />
          </div>

          <div>
            <label htmlFor="investiria" className="field-label mb-1.5">
              {fields.investiria.label}
            </label>
            <Select
              id="investiria"
              value={values.investiria}
              options={fields.investiria.options}
              error={errors.investiria}
              onChange={(v) => set("investiria", v)}
            />
            <FieldError name="investiria" message={errors.investiria} />
          </div>
        </>
      )}

      {globalError && (
        <p className="text-center text-sm text-error" role="alert">
          {globalError}
        </p>
      )}

      <button type="submit" disabled={sending} className="lp01-btn lp01-submit">
        {sending ? form.sending : form.submitLabel}
      </button>
    </form>
  );
}
