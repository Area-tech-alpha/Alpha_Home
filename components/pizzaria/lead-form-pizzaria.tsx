"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import FlagBR from "@/components/ui/flag-br";
import type PhoneFieldType from "@/components/lp01/phone-field-01lp";
import { submitLeadResultadoPizzaria } from "@/app/actions/submit-lead-resultado-pizzaria";
import { readFirstTouchPizzaria, saveLeadPizzaria, saveSentMarkPizzaria } from "@/components/pizzaria/lead-storage";
import { contentPizzaria } from "@/lib/content-pizzaria";
import { contentResultado } from "@/lib/content-resultado-pizzaria";
import { FATURAMENTO_EXIGE_EXTRAS_PIZZARIA, type LeadTrackingPizzaria } from "@/lib/lead-pizzaria-constants";

const { form } = contentPizzaria;
const { fields } = form;

export const OBRIGADO_PATH_PIZZARIA = "/alphas-pizzaria/obrigado";

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

function maskCNPJ(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
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

// variant "vsl" (/alphas-pizzaria): valida, guarda o lead e vai para o vídeo; o
// envio é na página 2. variant "resultado" (/resultado-alphas-pizzaria): envia o
// lead no submit (server action) e só então vai para o mesmo obrigado da VSL,
// deixando no navegador a marca de "lead já enviado" para o obrigado não repetir.
export default function LeadFormPizzaria({ variant = "vsl" }: { variant?: "vsl" | "resultado" }) {
  const router = useRouter();
  const resultado = variant === "resultado";
  const [globalError, setGlobalError] = useState("");
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

  const needsExtras = values.faturamento === FATURAMENTO_EXIGE_EXTRAS_PIZZARIA;

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
    // Resultado: honeypot preenchido = bot, não envia nada.
    if (resultado && website) return;

    const lead = {
      nome: values.nome.trim(),
      email: values.email.trim(),
      telefone: (PhoneField ? values.telefone : fallbackToE164(rawPhone)) ?? "",
      empresa: values.empresa.trim(),
      segmento: values.segmento,
      faturamento: values.faturamento,
      ...(needsExtras && { cnpj: values.cnpj, investiria: values.investiria || undefined }),
    };

    const { leadSchemaPizzaria } = await import("@/lib/validation-pizzaria");
    const parsed = leadSchemaPizzaria.safeParse(lead);
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
    // Sem UTM de origem/mídia, a origem sai do referrer (classificarOrigemOrganica do WP).
    const tracking = { ...trackingRef.current };
    if (!tracking.utm_source && !tracking.utm_medium) {
      const { classificarOrigemOrganica } = await import("@/lib/lead-pizzaria");
      Object.assign(tracking, classificarOrigemOrganica(document.referrer, window.location.hostname));
    }

    if (resultado) {
      setGlobalError("");
      try {
        const res = await submitLeadResultadoPizzaria(parsed.data, tracking, {
          pageUrl: window.location.href,
          referrer: document.referrer || "",
        });
        if (res.success) {
          // Só redireciona se o envio deu certo; a marca vai antes, para o obrigado
          // da VSL não mandar o mesmo lead de novo.
          saveSentMarkPizzaria(res.lead);
          router.push(OBRIGADO_PATH_PIZZARIA);
          return;
        }
        setGlobalError(res.error);
      } catch {
        setGlobalError(contentResultado.form.errors.webhook);
      }
      setSending(false);
      return;
    }

    // Como no WP, a página 1 não envia: guarda o lead e vai para o vídeo. O
    // webhook é chamado na página 2, no clique do botão liberado aos 50%.
    saveLeadPizzaria({
      lead: parsed.data,
      tracking,
      page_url: window.location.href,
      referrer: document.referrer || "",
      form_preenchido_em: new Date().toISOString(),
      ...(website && { website }),
    });
    router.push(OBRIGADO_PATH_PIZZARIA);
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
        <label htmlFor="nome">{fields.nome.label}</label>
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
          aria-describedby="erro-nome"
        />
        {errors.nome && <FieldError name="nome" message={errors.nome} />}
      </div>

      <div className="foot-field">
        <label htmlFor="email">{fields.email.label}</label>
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
          aria-describedby="erro-email"
        />
        {errors.email && <FieldError name="email" message={errors.email} />}
      </div>

      <div className="foot-field pizzaria-phone">
        <label htmlFor="telefone">{fields.telefone.label}</label>
        {PhoneField ? (
          <PhoneField
            value={values.telefone}
            onChange={(v) => set("telefone", v)}
            placeholder={fields.telefone.placeholder}
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
              placeholder={fields.telefone.placeholder}
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
        <label htmlFor="empresa">{fields.empresa.label}</label>
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
          aria-describedby="erro-empresa"
        />
        {errors.empresa && <FieldError name="empresa" message={errors.empresa} />}
      </div>

      <div className="foot-field">
        <label htmlFor="segmento">{fields.segmento.label}</label>
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
            {fields.segmento.placeholder}
          </option>
          {fields.segmento.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {errors.segmento && <FieldError name="segmento" message={errors.segmento} />}
      </div>

      <div className="foot-field">
        <label htmlFor="faturamento">{fields.faturamento.label}</label>
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
            {fields.faturamento.placeholder}
          </option>
          {fields.faturamento.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {errors.faturamento && <FieldError name="faturamento" message={errors.faturamento} />}
      </div>

      {/* Abre com altura animada, como o .cond-fields do WP. */}
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

      {globalError && (
        <p className="field-error form-error" role="alert">
          {globalError}
        </p>
      )}

      <button type="submit" disabled={sending} className="pz-btn pz-btn-primary pz-btn-block">
        {sending ? form.sending : resultado ? contentResultado.form.submitLabel : form.submitLabel}
      </button>
      {/* O form do WP da resultado não tem a nota de privacidade. */}
      {!resultado && (
        <p className="form-note">
          <Lock aria-hidden="true" />
          <span>{form.note}</span>
        </p>
      )}
    </form>
  );
}
