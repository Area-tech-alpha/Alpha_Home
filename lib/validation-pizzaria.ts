import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import { contentPizzaria } from "@/lib/content-pizzaria";
import { FATURAMENTO_EXIGE_EXTRAS_PIZZARIA } from "@/lib/lead-pizzaria-constants";

// Form da /alphas-pizzaria: mesmos campos e regras do form do WP (página 1).
// Usado no navegador (antes de ir para o vídeo) e de novo no servidor, na
// confirmação da página 2, porque o lead chega lá vindo do storage do navegador.

const { fields, errors } = contentPizzaria.form;
const SEGMENTOS = fields.segmento.options.map((o) => o.value) as [string, ...string[]];
const FATURAMENTOS = fields.faturamento.options as unknown as [string, ...string[]];

function cnpjDigit(digits: string, length: number): number {
  let sum = 0;
  let pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += parseInt(digits[length - i]) * pos--;
    if (pos < 2) pos = 9;
  }
  const rem = sum % 11;
  return rem < 2 ? 0 : 11 - rem;
}

export function isValidCNPJ(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  return cnpjDigit(digits, 12) === parseInt(digits[12]) && cnpjDigit(digits, 13) === parseInt(digits[13]);
}

export const leadSchemaPizzaria = z
  .object({
    nome: z.string().trim().min(2, "Nome obrigatório").max(120),
    email: z.string().trim().email("E-mail inválido").max(200),
    // E.164 ("+5511999999999"), como sai do seletor de DDI.
    telefone: z
      .string()
      .min(1, errors.telefone)
      .max(20)
      .refine((v) => isValidPhoneNumber(v), errors.telefone),
    empresa: z.string().trim().min(2, "Nome da empresa obrigatório").max(160),
    segmento: z.enum(SEGMENTOS, { message: "Selecione um segmento" }),
    faturamento: z.enum(FATURAMENTOS, { message: "Selecione uma faixa de faturamento" }),
    cnpj: z.string().max(20).optional(),
    investiria: z.enum(["Sim", "Não"], { message: "Selecione uma opção" }).optional(),
  })
  // CNPJ e "investiria" só aparecem (e só são exigidos) em "Até 30 mil".
  .superRefine((data, ctx) => {
    if (data.faturamento !== FATURAMENTO_EXIGE_EXTRAS_PIZZARIA) return;
    if (!data.cnpj || !isValidCNPJ(data.cnpj)) {
      ctx.addIssue({ code: "custom", message: errors.cnpj, path: ["cnpj"] });
    }
    if (!data.investiria) {
      ctx.addIssue({ code: "custom", message: "Selecione uma opção", path: ["investiria"] });
    }
  });

export type LeadFormDataPizzaria = z.infer<typeof leadSchemaPizzaria>;
