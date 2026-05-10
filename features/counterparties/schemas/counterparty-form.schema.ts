import { z } from "zod";

export const counterpartyFormSchema = z.object({
  name: z.string().min(1, "Обязательное поле"),
  type: z.enum(["customer", "contractor"]),
  legalStatus: z.enum(["juridical", "individual"]),
  inn: z.string().optional(),
  phone: z.string().optional(),

  // Juridical
  legalAddress: z.string().optional(),
  bankName: z.string().optional(),
  bik: z.string().optional(),
  corrAccount: z.string().optional(),
  accountNumber: z.string().optional(),

  // Individual (passport)
  passportSeries: z.string().optional(),
  passportNumber: z.string().optional(),
  passportIssuedBy: z.string().optional(),
  passportIssueDate: z.string().optional(),
  passportDepartmentCode: z.string().optional(),
  passportRegistrationAddress: z.string().optional(),
});

export type CounterpartyFormValues = z.infer<typeof counterpartyFormSchema>;
