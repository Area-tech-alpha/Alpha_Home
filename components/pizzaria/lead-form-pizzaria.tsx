"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock } from "lucide-react";
import FlagBR from "@/components/ui/flag-br";
import type PhoneFieldType from "@/components/lp01/phone-field-01lp";
import { submitLeadBastidoresPizzaria } from "@/app/actions/submit-lead-bastidores-pizzaria";
import { submitLeadPizzaria } from "@/app/actions/submit-lead-pizzaria";
import { submitLeadResultadoPizzaria } from "@/app/actions/submit-lead-resultado-pizzaria";
import { submitLeadMagneticVsl } from "@/app/actions/submit-lead-magnetic-vsl";
import { readFirstTouchPizzaria } from "@/components/pizzaria/lead-storage";
import { BASTIDORES_STORAGE_KEY, contentBastidores } from "@/lib/content-bastidores-pizzaria";
import { contentPizzaria } from "@/lib/content-pizzaria";
import { contentResultado } from "@/lib/content-resultado-pizzaria";
import { FATURAMENTO_EXIGE_EXTRAS_PIZZARIA, type LeadTrackingPizzaria } from "@/lib/lead-pizzaria-constants";
import { maskCNPJ } from "@/lib/mask-cnpj";
import {
  FATURAMENTOS_LMVSL,
  SEGMENTOS_LMVSL,
  contentLeadMagneticVsl,
} from "@/lib/content-lead-magnetic-vsl";

const { form } = contentPizzaria;
const { fields } = form;

type Variant = "vsl" | "resultado" | "bastidores" | "lead-magnetic-vsl";

// Todas as LPs enviam o lead ao CRM comercial no submit (server action, mesmo código
// da home) e só seguem para o redirectTo se o CRM respondeu ok. O que muda por
// variante: a action (escopo do rate limit e destino), o texto e o estilo do botão.
const VARIANTS = {
  vsl: {
    submit: submitLeadPizzaria,
    label: form.submitLabel,
    buttonClass: "pz-btn pz-btn-primary pz-btn-block",
    note: true,
    empresaPlaceholder: fields.empresa.placeholder,
  },
  resultado: {
    submit: submitLeadResultadoPizzaria,
    label: contentResultado.form.submitLabel,
    buttonClass: "pz-btn pz-btn-primary pz-btn-block",
    note: false,
    empresaPlaceholder: fields.empresa.placeholder,
  },
  bastidores: {
    submit: submitLeadBastidoresPizzaria,
    label: contentBastidores.form.submitLabel,
    buttonClass: "bs-btn bs-btn-primary",
    note: false,
    empresaPlaceholder: contentBastidores.form.empresaPlaceholder,
  },
  "lead-magnetic-vsl": {
    submit: submitLeadMagneticVsl,
    label: contentLeadMagneticVsl.form.submitLabel,
    buttonClass: "lmvsl-form-btn",
    note: false,
    empresaPlaceholder: contentLeadMagneticVsl.form.fields.empresa.placeholder,
  },
} as const;

// Seletor de DDI (o da /01-lp: mesmos 10 DDIs do WP, bandeiras em SVG) e zod
// fora do JS inicial: carregam na primeira interação com o form.
type PhoneFieldComponent = typeof PhoneFieldType;
let phoneFieldPromise: Promise<PhoneFieldComponent> | null = null;
function loadPhoneField() {
  phoneFieldPromise ??= import("@/components/lp01/phone-field-01lp").then((m) => m.default);
  return phoneFieldPromise;
}

function fallbackToE164(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits ? `+55${digits}` : undefined;
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

function FieldError({ name, message }: { name: FieldName; message?: string }) {
  return (
    <span id={`erro-${name}`} className="field-error" role={message ? "alert" : undefined}>
      {message}
    </span>
  );
}

export default function LeadFormPizzaria({ variant = "vsl" }: { variant?: Variant }) {
  const router = useRouter();
  const cfg = VARIANTS[variant];
  const lmFields = variant === "lead-magnetic-vsl" ? contentLeadMagneticVsl.form.fields : null;
  const [globalError, setGlobalError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [sending, setSending] = useState(false);
  const trackingRef = useRef<LeadTrackingPizzaria>({});
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
    trackingRef.current = readFirstTouchPizzaria();
  }, []);

  const needsExtras =
    variant !== "lead-magnetic-vsl" &&
    values.faturamento === FATURAMENTO_EXIGE_EXTRAS_PIZZARIA;

  function set(field: FieldName, value: string | undefined) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  // Como no WP: em "Até 30 mil" aparecem CNPJ e "investiria", com "Sim" já marcado.
  function setFaturamento(value: string) {
    const extras = value === FATURAMENTO_EXIGE_EXTRAS_PIZZARIA;
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
    const website = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    // Honeypot preenchido = bot: não envia nada.
    if (website) return;

    const lead = {
      nome: values.nome.trim(),
      email: values.email.trim(),
      telefone: (PhoneField ? values.telefone : fallbackToE164(rawPhone)) ?? "",
      empresa: values.empresa.trim(),
      segmento: values.segmento,
      faturamento: values.faturamento,
      ...(needsExtras && { cnpj: values.cnpj, investiria: values.investiria || undefined }),
    };

    const validation = await import("@/lib/validation-pizzaria");
    const parsed =
      variant === "lead-magnetic-vsl"
        ? validation.leadSchemaLeadMagneticVsl.safeParse(lead)
        : validation.leadSchemaPizzaria.safeParse(lead);
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
      const res = await cfg.submit(parsed.data, trackingRef.current);
      if (res.success) {
        // Bastidores: o obrigado personaliza o aviso do e-mail com o primeiro nome
        // (como no WP, via sessionStorage; o envio do lead já foi feito ao CRM).
        if (variant === "bastidores") {
          try {
            sessionStorage.setItem(BASTIDORES_STORAGE_KEY, JSON.stringify({ nome: parsed.data.nome }));
          } catch {}
          setRedirecting(true);
        }
        router.push(res.redirectTo);
        return;
      }
      setGlobalError(res.error);
    } catch {
      setGlobalError(form.errors.crm);
    }
    setSending(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      onFocusCapture={warmUp}
      onPointerDownCapture={warmUp}
      noValidate
      aria-label="Formulário para liberar a estrutura"
    >
      <input type="text" name="website" tabIndex={-1} aria-hidden="true" autoComplete="off" className="hidden" />

      <div className="foot-field">
        <label htmlFor="nome" className={lmFields ? "sr-only" : undefined}>{lmFields?.nome.label ?? fields.nome.label}</label>
        <input
          id="nome"
          name="nome"
          type="text"
          autoComplete="name"
          required
          placeholder={lmFields?.nome.placeholder ?? fields.nome.placeholder}
          value={values.nome}
          onChange={(e) => set("nome", e.target.value)}
          aria-invalid={!!errors.nome}
          aria-describedby="erro-nome"
        />
        {errors.nome && <FieldError name="nome" message={errors.nome} />}
      </div>

      <div className="foot-field">
        <label htmlFor="email" className={lmFields ? "sr-only" : undefined}>{lmFields?.email.label ?? fields.email.label}</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={lmFields?.email.placeholder ?? fields.email.placeholder}
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby="erro-email"
        />
        {errors.email && <FieldError name="email" message={errors.email} />}
      </div>

      <div className="foot-field pizzaria-phone">
        <label htmlFor="telefone" className={lmFields ? "sr-only" : undefined}>{lmFields?.telefone.label ?? fields.telefone.label}</label>
        {PhoneField ? (
          <PhoneField
            value={values.telefone}
            onChange={(v) => set("telefone", v)}
            placeholder={lmFields?.telefone.placeholder ?? fields.telefone.placeholder}
            invalid={!!errors.telefone}
            describedBy="erro-telefone"
            autoFocus={phoneFocused}
          />
        ) : (
          <div className="phone-input-wrapper">
            <span
              className="flex shrink-0 items-center gap-1.5 rounded-[10px] border border-border bg-white/[0.04] px-3 py-3 text-sm text-white"
              aria-hidden="true"
            >
              <FlagBR className="h-[14px] w-[21px] shrink-0 rounded-[2px]" />
              <span>+55</span>
              <span className="text-[10px] text-text-dim">▾</span>
            </span>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder={lmFields?.telefone.placeholder ?? fields.telefone.placeholder}
              value={rawPhone}
              onChange={(e) => {
                rawPhoneRef.current = e.target.value;
                setRawPhone(e.target.value);
              }}
              onFocus={() => setPhoneFocused(true)}
              aria-invalid={!!errors.telefone}
              aria-describedby="erro-telefone"
              className="PhoneInputInput"
            />
          </div>
        )}
        <FieldError name="telefone" message={errors.telefone} />
      </div>

      <div className="foot-field">
        <label htmlFor="empresa" className={lmFields ? "sr-only" : undefined}>{lmFields?.empresa.label ?? fields.empresa.label}</label>
        <input
          id="empresa"
          name="empresa"
          type="text"
          autoComplete="organization"
          required
          placeholder={cfg.empresaPlaceholder}
          value={values.empresa}
          onChange={(e) => set("empresa", e.target.value)}
          aria-invalid={!!errors.empresa}
          aria-describedby="erro-empresa"
        />
        {errors.empresa && <FieldError name="empresa" message={errors.empresa} />}
      </div>

      <div className="foot-field">
        <label htmlFor="segmento" className={lmFields ? "sr-only" : undefined}>{lmFields?.segmento.label ?? fields.segmento.label}</label>
        <select
          id="segmento"
          name="segmento"
          required
          value={values.segmento}
          onChange={(e) => set("segmento", e.target.value)}
          aria-invalid={!!errors.segmento}
          aria-describedby="erro-segmento"
          data-empty={!values.segmento}
        >
          <option value="" disabled>
            {lmFields?.segmento.placeholder ?? fields.segmento.placeholder}
          </option>
          {(variant === "lead-magnetic-vsl" ? SEGMENTOS_LMVSL : fields.segmento.options).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {errors.segmento && <FieldError name="segmento" message={errors.segmento} />}
      </div>

      <div className="foot-field">
        <label htmlFor="faturamento" className={lmFields ? "sr-only" : undefined}>{lmFields?.faturamento.label ?? fields.faturamento.label}</label>
        <select
          id="faturamento"
          name="faturamento"
          required
          value={values.faturamento}
          onChange={(e) => setFaturamento(e.target.value)}
          aria-invalid={!!errors.faturamento}
          aria-describedby="erro-faturamento"
          data-empty={!values.faturamento}
        >
          <option value="" disabled>
            {lmFields?.faturamento.placeholder ?? fields.faturamento.placeholder}
          </option>
          {(variant === "lead-magnetic-vsl" ? FATURAMENTOS_LMVSL : fields.faturamento.options).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {errors.faturamento && <FieldError name="faturamento" message={errors.faturamento} />}
      </div>

      {/* Abre com altura animada, como o .cond-fields do WP. */}
      {variant !== "lead-magnetic-vsl" && (
      <div className="cond-fields" data-open={needsExtras} inert={!needsExtras}>
        <div className="foot-field">
          <label htmlFor="cnpj">{fields.cnpj.label}</label>
          <input
            id="cnpj"
            name="cnpj"
            type="text"
            inputMode="numeric"
            required={needsExtras}
            placeholder={fields.cnpj.placeholder}
            value={values.cnpj}
            onChange={(e) => set("cnpj", maskCNPJ(e.target.value))}
            aria-invalid={!!errors.cnpj}
            aria-describedby="erro-cnpj"
          />
          <FieldError name="cnpj" message={errors.cnpj} />
        </div>
        <div className="foot-field">
          <label htmlFor="investiria">{fields.investiria.label}</label>
          <select
            id="investiria"
            name="investiria"
            required={needsExtras}
            value={values.investiria}
            onChange={(e) => set("investiria", e.target.value)}
            aria-invalid={!!errors.investiria}
            aria-describedby="erro-investiria"
            data-empty={!values.investiria}
          >
            <option value="" disabled>
              {fields.investiria.placeholder}
            </option>
            {fields.investiria.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {errors.investiria && <FieldError name="investiria" message={errors.investiria} />}
        </div>
      </div>
      )}

      {globalError && (
        <p className="field-error form-error" role="alert">
          {globalError}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className={cfg.buttonClass}
      >
        {sending ? form.sending : cfg.label}
      </button>
      {/* Só o form da VSL tem a nota de privacidade no WP. */}
      {cfg.note && (
        <p className="form-note">
          <Lock aria-hidden="true" />
          <span>{form.note}</span>
        </p>
      )}
      {/* Bastidores: aviso do WP entre o envio ok e o redirect. */}
      {redirecting && (
        <div className="footer-success show" role="status">
          <CheckCircle2 aria-hidden="true" />
          <span>{contentBastidores.form.success}</span>
        </div>
      )}
    </form>
  );
}
