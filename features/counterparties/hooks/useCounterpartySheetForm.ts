import { useEffect, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { createCounterparty, updateCounterparty } from "@/app/actions/counterparties";
import { useAppToast } from "@/components/providers/use-app-toast";
import { type CounterpartyRow } from "@/shared/types/domain/counterparty-row";
import {
  counterpartyFormSchema,
  type CounterpartyFormValues,
} from "@/features/counterparties/schemas/counterparty-form.schema";

const DEFAULT_VALUES: CounterpartyFormValues = {
  name: "",
  type: "customer",
  legalStatus: "juridical",
  inn: "",
  phone: "",
  legalAddress: "",
  bankName: "",
  bik: "",
  corrAccount: "",
  accountNumber: "",
  passportSeries: "",
  passportNumber: "",
  passportIssuedBy: "",
  passportIssueDate: "",
  passportDepartmentCode: "",
  passportRegistrationAddress: "",
};

function getInitialValues(counterparty?: CounterpartyRow | null): CounterpartyFormValues {
  if (!counterparty) {
    return { ...DEFAULT_VALUES };
  }

  return {
    name: counterparty.name,
    type: counterparty.type,
    legalStatus: counterparty.legalStatus,
    inn: counterparty.inn || "",
    phone: counterparty.phone || "",
    legalAddress: counterparty.legalAddress || "",
    bankName: counterparty.bankDetails?.bankName || "",
    bik: counterparty.bankDetails?.bik || "",
    corrAccount: counterparty.bankDetails?.corrAccount || "",
    accountNumber: counterparty.bankDetails?.accountNumber || "",
    passportSeries: counterparty.passport?.series || "",
    passportNumber: counterparty.passport?.number || "",
    passportIssuedBy: counterparty.passport?.issuedBy || "",
    passportIssueDate: counterparty.passport?.issueDate || "",
    passportDepartmentCode: counterparty.passport?.departmentCode || "",
    passportRegistrationAddress: counterparty.passport?.registrationAddress || "",
  };
}

type UseCounterpartySheetFormOptions = {
  counterparty?: CounterpartyRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (saved: CounterpartyRow, mode: "create" | "update") => void;
};

export function useCounterpartySheetForm({
  counterparty,
  open,
  onOpenChange,
  onSaved,
}: UseCounterpartySheetFormOptions) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useAppToast();

  const form = useForm<CounterpartyFormValues>({
    resolver: zodResolver(counterpartyFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const legalStatus = form.watch("legalStatus");

  useEffect(() => {
    form.reset(getInitialValues(counterparty));
  }, [counterparty, form, open]);

  const onSubmit = (values: CounterpartyFormValues) => {
    startTransition(async () => {
      try {
        if (counterparty) {
          const result = await updateCounterparty({ id: counterparty.id, data: values });

          if (result.success) {
            toast({ title: "Контрагент обновлен" });
            onOpenChange(false);
            onSaved?.(result.data, "update");
            return;
          }

          toast({
            variant: "destructive",
            title: result.message || "Произошла ошибка при сохранении",
          });
          return;
        }

        const result = await createCounterparty(values);

        if (result.success) {
          toast({ title: "Контрагент создан" });
          onOpenChange(false);
          onSaved?.(result.data, "create");
          return;
        }

        toast({
          variant: "destructive",
          title: result.message || "Произошла ошибка при сохранении",
        });
      } catch (_error) {
        toast({
          variant: "destructive",
          title: "Произошла ошибка при сохранении",
        });
      }
    });
  };

  return {
    form,
    legalStatus,
    isPending,
    onSubmit,
    modeTitle: counterparty ? "Редактировать контрагента" : "Создать контрагента",
    submitLabel: counterparty ? "Сохранить" : "Создать",
  };
}
