"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FormLayout } from "@/shared/ui/form-layout";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";

import { DirectoryEntitySheetShell } from "@/features/_shared/directories";
import { type CounterpartyRow } from "@/shared/types/domain/counterparty-row";
import { useCounterpartySheetForm } from "@/features/counterparties/hooks/useCounterpartySheetForm";
import {
  CounterpartyBankSection,
  CounterpartyDetailsSection,
  CounterpartyGeneralSection,
} from "@/features/counterparties/components/counterparty-sheet-sections";

interface CreateCounterpartySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  counterparty?: CounterpartyRow | null;
  onSaved?: (saved: CounterpartyRow, mode: "create" | "update") => void;
}

export function CreateCounterpartySheet({
  open,
  onOpenChange,
  counterparty,
  onSaved,
}: CreateCounterpartySheetProps) {
  const { form, legalStatus, isPending, modeTitle, submitLabel, onSubmit } =
    useCounterpartySheetForm({
      counterparty,
      open,
      onOpenChange,
      onSaved,
    });

  return (
    <DirectoryEntitySheetShell
      open={open}
      onOpenChange={onOpenChange}
      title={modeTitle}
      description="Заполните данные контрагента и сохраните изменения."
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button type="submit" size="default" form="counterparty-sheet-form" disabled={isPending}>
            {isPending ? <Loader2 /> : null}
            {submitLabel}
          </Button>
        </>
      }
    >
      <Form {...form}>
        <FormLayout
          id="counterparty-sheet-form"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
              <TabsTrigger value="general" className="text-xs">
                Общее
              </TabsTrigger>
              <TabsTrigger value="details" className="text-xs">
                Детали
              </TabsTrigger>
              <TabsTrigger value="bank" className="text-xs">
                Банк
              </TabsTrigger>
            </TabsList>

            <CounterpartyGeneralSection form={form} />
            <CounterpartyDetailsSection
              form={form}
              legalStatus={legalStatus}
            />
            <CounterpartyBankSection form={form} />
          </Tabs>
        </FormLayout>
      </Form>
    </DirectoryEntitySheetShell>
  );
}
