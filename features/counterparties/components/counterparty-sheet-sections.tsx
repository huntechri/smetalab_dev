import type { UseFormReturn } from "react-hook-form";
import { FileText, Landmark, Phone, User } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import { TabsContent } from "@/shared/ui/tabs";
import { FormSectionHeader, RadioGroupRow } from "@/shared/ui/form-layout";
import { FormSection } from "@/shared/ui/form-layout";

import type { CounterpartyFormValues } from "@/features/counterparties/schemas/counterparty-form.schema";

type CounterpartySectionProps = {
  form: UseFormReturn<CounterpartyFormValues>;
};

type CounterpartyDetailsSectionProps = CounterpartySectionProps & {
  legalStatus: CounterpartyFormValues["legalStatus"];
};

export function CounterpartyGeneralSection({ form }: CounterpartySectionProps) {
  return (
    <TabsContent value="general">
      <FormSection gap="compact" padding="dialog">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Наименование / ФИО</FormLabel>
              <FormControl>
                <Input size="default" placeholder="Введите название..." {...field} />
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
                <FormItem>
                  <FormLabel>Правовой статус</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <RadioGroupRow>
                        <FormItem variant="inline">
                          <RadioGroupItem value="individual" className="size-3.5" />
                          <FormLabel>
                            Физ. лицо
                          </FormLabel>
                        </FormItem>
                        <FormItem variant="inline">
                          <RadioGroupItem value="company" className="size-3.5" />
                          <FormLabel>
                            Юр. лицо
                          </FormLabel>
                        </FormItem>
                      </RadioGroupRow>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-28 sm:w-48 shrink-0">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Тип" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="customer">
                        Заказчик
                      </SelectItem>
                      <SelectItem value="contractor">
                        Подрядчик
                      </SelectItem>
                      <SelectItem value="supplier">
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
      </FormSection>

      <FormSection gap="compact" padding="dialog">
        <FormSectionHeader icon={<Phone className="size-4" />} title="Контактная информация" />

        <FormSection columns="two" gap="compact">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Телефон</FormLabel>
                <FormControl>
                  <Input size="default" placeholder="+7..." {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input size="default" placeholder="example@mail.ru" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Адрес</FormLabel>
              <FormControl>
                <Input size="default" placeholder="Город, улица, дом..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
    </TabsContent>
  );
}

export function CounterpartyDetailsSection({
  form,
  legalStatus,
}: CounterpartyDetailsSectionProps) {
  return (
    <TabsContent value="details">
      {legalStatus === "individual" ? (
        <FormSection gap="compact" padding="dialog">
          <FormSectionHeader icon={<User className="size-4" />} title="Паспортные данные" />

          <FormSection columns="two" gap="compact">
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дата рождения</FormLabel>
                  <FormControl>
                    <Input size="default" type="date" {...field} />
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
                  <FormLabel>Серия и номер</FormLabel>
                  <FormControl>
                    <Input size="default" placeholder="0000 000000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormField
            control={form.control}
            name="passportIssuedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Кем выдан</FormLabel>
                <FormControl>
                  <Input size="default" placeholder="УФМС..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSection columns="two" gap="compact">
            <FormField
              control={form.control}
              name="passportIssuedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дата выдачи</FormLabel>
                  <FormControl>
                    <Input size="default" type="date" {...field} />
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
                  <FormLabel>Код подразделения</FormLabel>
                  <FormControl>
                    <Input size="default" placeholder="000-000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>
        </FormSection>
      ) : (
        <FormSection gap="compact" padding="dialog">
          <FormSectionHeader icon={<FileText className="size-4" />} title="Реквизиты организации" />

          <FormField
            control={form.control}
            name="inn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ИНН</FormLabel>
                <FormControl>
                  <Input size="default" placeholder="ИНН" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSection columns="two" gap="compact">
            <FormField
              control={form.control}
              name="kpp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>КПП</FormLabel>
                  <FormControl>
                    <Input size="default" placeholder="КПП" {...field} />
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
                  <FormLabel>ОГРН</FormLabel>
                  <FormControl>
                    <Input size="default" placeholder="ОГРН" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>
        </FormSection>
      )}
    </TabsContent>
  );
}

export function CounterpartyBankSection({ form }: CounterpartySectionProps) {
  return (
    <TabsContent value="bank">
      <FormSection gap="compact" padding="dialog">
        <FormSectionHeader icon={<Landmark className="size-4" />} title="Банковские реквизиты" />

        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название банка</FormLabel>
              <FormControl>
                <Input size="default" placeholder="ПАО Сбербанк..." {...field} />
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
              <FormLabel>Расчетный счет</FormLabel>
              <FormControl>
                <Input size="default" placeholder="407..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormSection columns="two" gap="compact">
          <FormField
            control={form.control}
            name="corrAccount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Корр. счет</FormLabel>
                <FormControl>
                  <Input size="default" placeholder="301..." {...field} />
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
                <FormLabel>ИНН Банка</FormLabel>
                <FormControl>
                  <Input size="default" placeholder="ИНН банка" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>
      </FormSection>
    </TabsContent>
  );
}
