import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import { FATURAMENTOS_POP, SEGMENTOS_POP, popForm } from "@/lib/content-pop";
import { FATURAMENTO_EXIGE_EXTRAS_PIZZARIA } from "@/lib/lead-pizzaria-constants";
import { isValidCNPJ } from "@/lib/validation-pizzaria";

// Form das LPs de POP: os campos das etapas do WP (segmento, faturamento, nome,
// WhatsApp e e-mail), numa tela só, mais CNPJ e "investiria" em "Até 30 mil" como nas
// outras LPs. Usado no navegador (antes de enviar) e de novo na server action.
// O WP não pede empresa: o lead sai com empresa vazia (o CRM recebe sem "company").

const { errors } = popForm;
const SEGMENTOS = SEGMENTOS_POP.map((o) => o.value) as [string, ...string[]];
const FATURAMENTOS = FATURAMENTOS_POP.map((o) => o.value) as [string, ...string[]];

export const leadSchemaPop = z
  .object({
    nome: z.string().trim().min(2, errors.nome).max(120),
    email: z.string().trim().email(errors.email).max(200),
    // E.164 ("+5511999999999"), como sai do seletor de DDI.
    telefone: z
      .string()
      .min(1, errors.telefone)
      .max(20)
      .refine((v) => isValidPhoneNumber(v), errors.telefone),
    segmento: z.enum(SEGMENTOS, { message: errors.segmento }),
    faturamento: z.enum(FATURAMENTOS, { message: errors.faturamento }),
    cnpj: z.string().max(20).optional(),
    investiria: z.enum(["Sim", "Não"], { message: errors.investiria }).optional(),
  })
  // CNPJ e "investiria" só aparecem (e só são exigidos) em "Até 30 mil".
  .superRefine((data, ctx) => {
    if (data.faturamento !== FATURAMENTO_EXIGE_EXTRAS_PIZZARIA) return;
    if (!data.cnpj || !isValidCNPJ(data.cnpj)) {
      ctx.addIssue({ code: "custom", message: errors.cnpj, path: ["cnpj"] });
    }
    if (!data.investiria) {
      ctx.addIssue({ code: "custom", message: errors.investiria, path: ["investiria"] });
    }
  })
  .transform((data) => ({ ...data, empresa: "" }));

export type LeadFormDataPop = z.infer<typeof leadSchemaPop>;
