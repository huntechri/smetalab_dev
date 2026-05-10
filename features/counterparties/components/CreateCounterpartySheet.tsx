"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

import { DirectoryEntitySheetShell } from "@/features/_shared/directories";
import { type CounterpartyRow } from "@/shared/types/domain/counterparty-row";
import { useCounterpartySheetForm } from "@/features/counterparties/hooks/useCounterpartySheetForm";

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
          className="space-y-4"
        >
          {/* --- Всегда видимые поля --- */}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Наименование</FormLabel>
                <FormControl>
                  <Input placeholder="Введите название..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Тип</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Тип" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="customer" className="text-xs">
                        Заказчик
                      </SelectItem>
                      <SelectItem value="contractor" className="text-xs">
                        Подрядчик
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="legalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Статус</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Статус" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="juridical" className="text-xs">
                        Юр. лицо
                      </SelectItem>
                      <SelectItem value="individual" className="text-xs">
                        Физ. лицо
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="inn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">ИНН</FormLabel>
                  <FormControl>
                    <Input placeholder="ИНН" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Телефон</FormLabel>
                  <FormControl>
                    <Input placeholder="+7..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* --- Условные поля: Юр. лицо --- */}
          {legalStatus === "juridical" && (
            <div className="space-y-4 rounded-lg border border-border p-4">
              <p className="text-xs font-medium text-muted-foreground">Реквизиты юрлица</p>

              <FormField
                control={form.control}
                name="legalAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Юридический адрес</FormLabel>
                    <FormControl>
                      <Input placeholder="Город, улица, дом..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Наименование банка</FormLabel>
                    <FormControl>
                      <Input placeholder="ПАО Сбербанк..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bik"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">БИК</FormLabel>
                    <FormControl>
                      <Input placeholder="9 цифр" maxLength={9} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="corrAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">К/С</FormLabel>
                    <FormControl>
                      <Input placeholder="20 цифр" maxLength={20} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Р/С</FormLabel>
                    <FormControl>
                      <Input placeholder="20 цифр" maxLength={20} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* --- Условные поля: Физ. лицо --- */}
          {legalStatus === "individual" && (
            <div className="space-y-4 rounded-lg border border-border p-4">
              <p className="text-xs font-medium text-muted-foreground">Паспортные данные</p>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="passportSeries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Серия паспорта</FormLabel>
                      <FormControl>
                        <Input placeholder="4 цифры" maxLength={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passportNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Номер паспорта</FormLabel>
                      <FormControl>
                        <Input placeholder="6 цифр" maxLength={6} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="passportIssuedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Кем выдан</FormLabel>
                    <FormControl>
                      <Input placeholder="УФМС..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passportIssueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Дата выдачи</FormLabel>
                    <FormControl>
                      <Input placeholder="ДД.ММ.ГГГГ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passportDepartmentCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Код подразделения</FormLabel>
                    <FormControl>
                      <Input placeholder="000-000" maxLength={7} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passportRegistrationAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Адрес регистрации</FormLabel>
                    <FormControl>
                      <Input placeholder="Город, улица, дом, кв..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </form>
      </Form>
    </DirectoryEntitySheetShell>
  );
}
