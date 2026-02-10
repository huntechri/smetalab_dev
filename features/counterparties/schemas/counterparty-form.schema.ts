import { z } from "zod";

export const counterpartyFormSchema = z.object({
  name: z.string().min(1, "Обязательное поле"),
  type: z.enum(["customer", "contractor", "supplier"]),
  legalStatus: z.enum(["individual", "company"]),
  birthDate: z.string().optional(),
  passportSeriesNumber: z.string().optional(),
  passportIssuedBy: z.string().optional(),
  passportIssuedDate: z.string().optional(),
  departmentCode: z.string().optional(),
  ogrn: z.string().optional(),
  inn: z.string().optional(),
  kpp: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  corrAccount: z.string().optional(),
  bankInn: z.string().optional(),
  bankKpp: z.string().optional(),
});

export type CounterpartyFormValues = z.infer<typeof counterpartyFormSchema>;
