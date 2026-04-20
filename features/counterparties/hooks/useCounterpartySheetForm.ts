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
  legalStatus: "individual",
  birthDate: "",
  passportSeriesNumber: "",
  passportIssuedBy: "",
  passportIssuedDate: "",
  departmentCode: "",
  ogrn: "",
  inn: "",
  kpp: "",
  address: "",
  phone: "",
  email: "",
  bankName: "",
  bankAccount: "",
  corrAccount: "",
  bankInn: "",
  bankKpp: "",
};

function getInitialValues(counterparty?: CounterpartyRow | null): CounterpartyFormValues {
  if (!counterparty) {
    return { ...DEFAULT_VALUES };
  }

  return {
    name: counterparty.name,
    type: counterparty.type,
    legalStatus: counterparty.legalStatus,
    birthDate: counterparty.birthDate || "",
    passportSeriesNumber: counterparty.passportSeriesNumber || "",
    passportIssuedBy: counterparty.passportIssuedBy || "",
    passportIssuedDate: counterparty.passportIssuedDate || "",
    departmentCode: counterparty.departmentCode || "",
    ogrn: counterparty.ogrn || "",
    inn: counterparty.inn || "",
    kpp: counterparty.kpp || "",
    address: counterparty.address || "",
    phone: counterparty.phone || "",
    email: counterparty.email || "",
    bankName: counterparty.bankName || "",
    bankAccount: counterparty.bankAccount || "",
    corrAccount: counterparty.corrAccount || "",
    bankInn: counterparty.bankInn || "",
    bankKpp: counterparty.bankKpp || "",
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
