import type { UseFormReturn } from "react-hook-form";
import { FileText, Landmark, Phone, User } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import { TabsContent } from "@/shared/ui/tabs";

import type { CounterpartyFormValues } from "@/features/counterparties/schemas/counterparty-form.schema";

type CounterpartySectionProps = {
  form: UseFormReturn<CounterpartyFormValues>;
};

type CounterpartyDetailsSectionProps = CounterpartySectionProps & {
  legalStatus: CounterpartyFormValues["legalStatus"];
};

export function CounterpartyGeneralSection({ form }: CounterpartySectionProps) {
  return (
    <TabsContent value="general" className="space-y-3 sm:space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Наименование / ФИО</FormLabel>
            <FormControl>
              <Input placeholder="Введите название..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex flex-row gap-3 sm:gap-6 items-start">
        <div className="flex-1 min-w-0">
          <FormField
            control={form.control}
            name="legalStatus"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs">Правовой статус</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-row items-center gap-2 sm:gap-4 h-8"
                  >
                    <FormItem className="flex items-center space-x-1 sm:space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="individual" className="h-3.5 w-3.5" />
                      </FormControl>
                      <FormLabel className="font-normal text-[10px] sm:text-xs whitespace-nowrap">
                        Физ. лицо
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-1 sm:space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="company" className="h-3.5 w-3.5" />
                      </FormControl>
                      <FormLabel className="font-normal text-[10px] sm:text-xs whitespace-nowrap">
                        Юр. лицо
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="w-[120px] sm:w-48 shrink-0">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs">Тип</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <SelectItem value="supplier" className="text-xs">
                      Поставщик
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2 font-medium">
          <Phone className="w-4 h-4 text-muted-foreground" />
          Контактная информация
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
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

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Email</FormLabel>
                <FormControl>
                  <Input placeholder="example@mail.ru" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Адрес</FormLabel>
              <FormControl>
                <Input placeholder="Город, улица, дом..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </TabsContent>
  );
}

export function CounterpartyDetailsSection({
  form,
  legalStatus,
}: CounterpartyDetailsSectionProps) {
  return (
    <TabsContent value="details" className="space-y-3 sm:space-y-4">
      {legalStatus === "individual" ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-medium">
            <User className="w-4 h-4 text-muted-foreground" />
            Паспортные данные
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Дата рождения</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passportSeriesNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Серия и номер</FormLabel>
                  <FormControl>
                    <Input placeholder="0000 000000" {...field} />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="passportIssuedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Дата выдачи</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departmentCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Код подразделения</FormLabel>
                  <FormControl>
                    <Input placeholder="000-000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-medium">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Реквизиты организации
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="kpp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">КПП</FormLabel>
                  <FormControl>
                    <Input placeholder="КПП" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ogrn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">ОГРН</FormLabel>
                  <FormControl>
                    <Input placeholder="ОГРН" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </TabsContent>
  );
}

export function CounterpartyBankSection({ form }: CounterpartySectionProps) {
  return (
    <TabsContent value="bank" className="space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2 font-medium">
        <Landmark className="w-4 h-4 text-muted-foreground" />
        Банковские реквизиты
      </div>

      <FormField
        control={form.control}
        name="bankName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Название банка</FormLabel>
            <FormControl>
              <Input placeholder="ПАО Сбербанк..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bankAccount"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Расчетный счет</FormLabel>
            <FormControl>
              <Input placeholder="407..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="corrAccount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Корр. счет</FormLabel>
              <FormControl>
                <Input placeholder="301..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bankInn"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">ИНН Банка</FormLabel>
              <FormControl>
                <Input placeholder="ИНН банка" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </TabsContent>
  );
}
