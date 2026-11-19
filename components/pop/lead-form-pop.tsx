"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import FlagBR from "@/components/ui/flag-br";
import type PhoneFieldType from "@/components/lp01/phone-field-01lp";
import { submitLeadPop } from "@/app/actions/submit-lead-pop";
import { readFirstTouchPizzaria } from "@/components/pizzaria/lead-storage";
import { Ic } from "@/components/pop/icons";
import { FATURAMENTOS_POP, SEGMENTOS_POP, popForm as f, type IscaSlug } from "@/lib/content-pop";
import { TZ_LEAD_KEY } from "@/lib/lead-webhook-constants";
import { FATURAMENTO_EXIGE_EXTRAS_PIZZARIA, type LeadTrackingPizzaria } from "@/lib/lead-pizzaria-constants";
import { maskCNPJ } from "@/lib/mask-cnpj";

// Form das 3 LPs de POP, visível no hero (no WP ficava num modal em 3 passos).
// Mesmos campos do WP numa tela só; CNPJ e "investiria" aparecem em "Até 30 mil".
// Envia ao CRM comercial pela server action (mesmo payload da home) e só segue para
// o obrigado se o CRM respondeu ok.

// Seletor de DDI (o da /01-lp: bandeiras em SVG) e zod fora do JS inicial:
// carregam na primeira interação com o form.
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
  segmento: string;
  faturamento: string;
  cnpj: string;
  investiria: string;
  nome: string;
  telefone: string | undefined;
  email: string;
};
type FieldName = keyof FormValues;

const initial: FormValues = {
  segmento: "",
  faturamento: "",
  cnpj: "",
  investiria: "",
  nome: "",
  telefone: undefined,
  email: "",
};

function Msg({ name, message }: { name: FieldName; message?: string }) {
  return (
    <span id={`erro-${name}`} className="msg" role={message ? "alert" : undefined}>
      {message}
    </span>
  );
}

export default function LeadFormPop({ slug, submit, nota }: { slug: IscaSlug; submit: string; nota: string }) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [globalError, setGlobalError] = useState("");
  const [sending, setSending] = useState(false);
  const trackingRef = useRef<LeadTrackingPizzaria>({});
  const [PhoneField, setPhoneField] = useState<ComponentType<Parameters<PhoneFieldComponent>[0]> | null>(null);
  const [rawPhone, setRawPhone] = useState("");
  const rawPhoneRef = useRef("");
  const [phoneFocused, setPhoneFocused] = useState(false);

  useEffect(() => {
    trackingRef.current = readFirstTouchPizzaria();
  }, []);

  function warmUp() {
    if (PhoneField) return;
    loadPhoneField().then((Component) => {
      setValues((prev) => (prev.telefone ? prev : { ...prev, telefone: fallbackToE164(rawPhoneRef.current) }));
      setPhoneField(() => Component);
    });
  }

  const needsExtras = values.faturamento === FATURAMENTO_EXIGE_EXTRAS_PIZZARIA;

  function set(field: FieldName, value: string | undefined) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  // Como nas outras LPs: em "Até 30 mil" aparecem CNPJ e "investiria", com "Sim" já marcado.
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
    // Honeypot preenchido = bot: não envia nada.
    if ((e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value) return;

    const lead = {
      nome: values.nome.trim(),
      email: values.email.trim(),
      telefone: (PhoneField ? values.telefone : fallbackToE164(rawPhone)) ?? "",
      segmento: values.segmento,
      faturamento: values.faturamento,
      ...(needsExtras && { cnpj: values.cnpj, investiria: values.investiria || undefined }),
    };

    const { leadSchemaPop } = await import("@/lib/validation-pop");
    const parsed = leadSchemaPop.safeParse(lead);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<FieldName, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as FieldName;
        fieldErrors[field] ??= issue.message;
      }
      setErrors(fieldErrors);
      // Foco no primeiro campo com erro, na ordem do form.
      const first = (Object.keys(initial) as FieldName[]).find((k) => fieldErrors[k]);
      if (first) document.getElementById(first)?.focus();
      return;
    }

    setSending(true);
    setGlobalError("");
    try {
      const res = await submitLeadPop(slug, lead, trackingRef.current, window.location.href.split("#")[0]);
      if (res.success) {
        // Como no WP: o lead fica no navegador para o aceite do Raio-X no obrigado.
        try {
          localStorage.setItem(TZ_LEAD_KEY, JSON.stringify(res.tzLead));
        } catch {}
        router.push(res.redirectTo);
        return;
      }
      setGlobalError(res.error);
    } catch {
      setGlobalError(f.errors.crm);
    }
    setSending(false);
  }

  const fieldClass = (name: FieldName) => (errors[name] ? "tz-f err" : "tz-f");

  return (
    <form
      className="tz-form"
      onSubmit={handleSubmit}
      onFocusCapture={warmUp}
      onPointerDownCapture={warmUp}
      noValidate
      aria-label="Formulário para receber o POP"
    >
      <input type="text" name="website" tabIndex={-1} aria-hidden="true" autoComplete="off" className="tz-hp" />

      <div className={fieldClass("segmento")}>
        <label htmlFor="segmento">{f.segmento.label}</label>
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
            {f.segmento.placeholder}
          </option>
          {SEGMENTOS_POP.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Msg name="segmento" message={errors.segmento} />
      </div>

      <div className={fieldClass("faturamento")}>
        <label htmlFor="faturamento">{f.faturamento.label}</label>
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
            {f.faturamento.placeholder}
          </option>
          {FATURAMENTOS_POP.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Msg name="faturamento" message={errors.faturamento} />
      </div>

      {/* Abre com altura animada, como o .cond-fields das outras LPs. */}
      <div className="tz-cond" data-open={needsExtras} inert={!needsExtras}>
        <div>
          <div className={fieldClass("cnpj")}>
            <label htmlFor="cnpj">{f.cnpj.label}</label>
            <input
              id="cnpj"
              name="cnpj"
              type="text"
              inputMode="numeric"
              required={needsExtras}
              placeholder={f.cnpj.placeholder}
              value={values.cnpj}
              onChange={(e) => set("cnpj", maskCNPJ(e.target.value))}
              aria-invalid={!!errors.cnpj}
              aria-describedby="erro-cnpj"
            />
            <Msg name="cnpj" message={errors.cnpj} />
          </div>
          <div className={fieldClass("investiria")}>
            <label htmlFor="investiria">{f.investiria.label}</label>
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
                {f.investiria.placeholder}
              </option>
              {f.investiria.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <Msg name="investiria" message={errors.investiria} />
          </div>
        </div>
      </div>

      <p className="tz-q">{f.contato}</p>

      <div className={fieldClass("nome")}>
        <label htmlFor="nome">{f.nome.label}</label>
        <input
          id="nome"
          name="nome"
          type="text"
          autoComplete="name"
          required
          placeholder={f.nome.placeholder}
          value={values.nome}
          onChange={(e) => set("nome", e.target.value)}
          aria-invalid={!!errors.nome}
          aria-describedby="erro-nome"
        />
        <Msg name="nome" message={errors.nome} />
      </div>

      <div className={`${fieldClass("telefone")} tz-phone-f`}>
        <label htmlFor="telefone">{f.telefone.label}</label>
        {PhoneField ? (
          <PhoneField
            value={values.telefone}
            onChange={(v) => set("telefone", v)}
            placeholder={f.telefone.placeholder}
            invalid={!!errors.telefone}
            describedBy="erro-telefone"
            autoFocus={phoneFocused}
          />
        ) : (
          <div className="phone-input-wrapper">
            <span className="tz-ddi" aria-hidden="true">
              <FlagBR className="tz-flag" />
              <span>+55</span>
              <span className="tz-ddi-caret">▾</span>
            </span>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder={f.telefone.placeholder}
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
        <Msg name="telefone" message={errors.telefone} />
      </div>

      <div className={fieldClass("email")}>
        <label htmlFor="email">{f.email.label}</label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder={f.email.placeholder}
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby="erro-email"
        />
        <Msg name="email" message={errors.email} />
      </div>

      {globalError && (
        <p className="tz-err" role="alert">
          {globalError}
        </p>
      )}

      <button type="submit" className="tz-btn" disabled={sending}>
        <span>{sending ? f.sending : submit}</span>
        <span className="tz-arr">
          <Ic name="arrow" />
        </span>
      </button>
      <p className="tz-nota">{nota}</p>
      <p className="tz-seg">
        <Ic name="lock" />
        {f.seguro}
      </p>
    </form>
  );
}
