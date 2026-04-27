"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";

import { DirectoryEntitySheetShell } from "@/features/directories";
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
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button type="submit" form="counterparty-sheet-form" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {submitLabel}
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form
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
        </form>
      </Form>
    </DirectoryEntitySheetShell>
  );
}
