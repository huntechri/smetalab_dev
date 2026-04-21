"use client";

import { Loader2 } from "lucide-react";
import {
  Button,
  Form,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@repo/ui";

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
  tenantId: number;
  onSaved?: (saved: CounterpartyRow, mode: "create" | "update") => void;
}

export function CreateCounterpartySheet({
  open,
  onOpenChange,
  counterparty,
  tenantId: _tenantId,
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[540px] max-h-dvh flex flex-col p-0">
        <SheetHeader className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
          <SheetTitle className="text-base sm:text-lg">{modeTitle}</SheetTitle>
          <SheetDescription className="text-xs sm:text-sm">
            Заполните данные контрагента и сохраните изменения.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4 sm:space-y-4">
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
              </div>
            </ScrollArea>

            <div className="px-4 py-3 sm:p-6 border-t bg-muted/20">
              <SheetFooter className="flex-row gap-2 sm:space-x-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {submitLabel}
                </Button>
              </SheetFooter>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
