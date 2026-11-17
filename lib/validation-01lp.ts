import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import { FATURAMENTO_EXIGE_EXTRAS_01LP } from "@/lib/lead-01lp-constants";

// Schema do form da /01-lp (mesmos campos e regras do form da 00-lp do WP).
// Separado do lib/validation.ts, que é o form da home.

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

export const leadSchema01lp = z
  .object({
    nome: z.string().trim().min(2, "Nome obrigatório").max(120),
    email: z.string().trim().email("E-mail inválido").max(200),
    telefone: z
      .string()
      .min(1, "Telefone obrigatório")
      .refine((v) => isValidPhoneNumber(v), "Telefone inválido"),
    empresa: z.string().trim().min(2, "Nome da empresa obrigatório").max(160),
    segmento: z.string().min(1, "Selecione um segmento").max(80),
    faturamento: z.string().min(1, "Selecione uma faixa de faturamento").max(80),
    cnpj: z.string().max(20).optional(),
    investiria: z.enum(["Sim", "Não"], { message: "Selecione uma opção" }).optional(),
  })
  // CNPJ e "investiria" só aparecem (e só são exigidos) em "Até 30 mil".
  .superRefine((data, ctx) => {
    if (data.faturamento !== FATURAMENTO_EXIGE_EXTRAS_01LP) return;
    if (!data.cnpj || !isValidCNPJ(data.cnpj)) {
      ctx.addIssue({ code: "custom", message: "CNPJ inválido", path: ["cnpj"] });
    }
    if (!data.investiria) {
      ctx.addIssue({ code: "custom", message: "Selecione uma opção", path: ["investiria"] });
    }
  });

export type LeadFormData01lp = z.infer<typeof leadSchema01lp>;
