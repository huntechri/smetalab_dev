'use client';

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@repo/ui';
import { Button } from '@repo/ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/ui';
import { Input } from '@repo/ui';
import { RadioGroup, RadioGroupItem } from '@repo/ui';
import { ScrollArea } from '@repo/ui';
import { useAppToast } from '@/components/providers/use-app-toast';
import { createMaterialSupplier, updateMaterialSupplier } from '@/app/actions/material-suppliers';
import { materialSupplierFormSchema, type MaterialSupplierFormValues } from '../schemas/material-supplier-form.schema';
import { Loader2 } from 'lucide-react';
import { MaterialSupplierRow } from '@/shared/types/domain/material-supplier-row';

interface CreateMaterialSupplierSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialSupplier?: MaterialSupplierRow | null;
  tenantId: number;
  onSaved?: (supplier: MaterialSupplierRow) => void;
}

export function CreateMaterialSupplierSheet({
  open,
  onOpenChange,
  materialSupplier,
  tenantId: _tenantId,
  onSaved,
}: CreateMaterialSupplierSheetProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useAppToast();

  const form = useForm<MaterialSupplierFormValues>({
    resolver: zodResolver(materialSupplierFormSchema),
    defaultValues: {
      name: '',
      color: '#3B82F6',
      legalStatus: 'company',
      birthDate: '',
      passportSeriesNumber: '',
      passportIssuedBy: '',
      passportIssuedDate: '',
      departmentCode: '',
      ogrn: '',
      inn: '',
      kpp: '',
      address: '',
      phone: '',
      email: '',
      bankName: '',
      bankAccount: '',
      corrAccount: '',
      bankInn: '',
      bankKpp: '',
    },
  });

  useEffect(() => {
    if (!open) return;

    if (materialSupplier) {
      form.reset({
        name: materialSupplier.name,
        color: materialSupplier.color,
        legalStatus: materialSupplier.legalStatus,
        birthDate: materialSupplier.birthDate || '',
        passportSeriesNumber: materialSupplier.passportSeriesNumber || '',
        passportIssuedBy: materialSupplier.passportIssuedBy || '',
        passportIssuedDate: materialSupplier.passportIssuedDate || '',
        departmentCode: materialSupplier.departmentCode || '',
        ogrn: materialSupplier.ogrn || '',
        inn: materialSupplier.inn || '',
        kpp: materialSupplier.kpp || '',
        address: materialSupplier.address || '',
        phone: materialSupplier.phone || '',
        email: materialSupplier.email || '',
        bankName: materialSupplier.bankName || '',
        bankAccount: materialSupplier.bankAccount || '',
        corrAccount: materialSupplier.corrAccount || '',
        bankInn: materialSupplier.bankInn || '',
        bankKpp: materialSupplier.bankKpp || '',
      });
      return;
    }

    form.reset();
  }, [open, materialSupplier, form]);

  const onSubmit = (values: MaterialSupplierFormValues) => {
    startTransition(async () => {
      try {
        const result = materialSupplier
          ? await updateMaterialSupplier({ id: materialSupplier.id, data: values })
          : await createMaterialSupplier(values);

        if (result.success) {
          toast({ title: materialSupplier ? 'Поставщик обновлен' : 'Поставщик создан' });
          onSaved?.(result.data);
          return;
        }

        toast({ variant: 'destructive', title: result.message || 'Не удалось сохранить поставщика' });
      } catch {
        toast({ variant: 'destructive', title: 'Не удалось сохранить поставщика' });
      }
    });
  };

  const legalStatus = form.watch('legalStatus');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[540px] max-h-dvh flex flex-col p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <SheetHeader className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
              <SheetTitle className="text-base sm:text-lg">{materialSupplier ? 'Редактировать поставщика' : 'Создать поставщика'}</SheetTitle>
              <SheetDescription className="text-xs sm:text-sm">
                Укажите данные поставщика и сохраните карточку.
              </SheetDescription>
            </SheetHeader>

            <ScrollArea className="flex-1 min-h-0">
              <div className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4 sm:space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Наименование</FormLabel>
                      <FormControl><Input placeholder="Наименование..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
               />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Цвет метки</FormLabel>
                        <FormControl>
                          <div className="w-14"><Input type="color" value={field.value} onChange={field.onChange} /></div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                 />

                  <FormField
                    control={form.control}
                    name="legalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Правовой статус</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-row items-center gap-2 sm:gap-4 h-8">
                            <FormItem className="flex items-center space-x-1 sm:space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="company" className="h-3.5 w-3.5" /></FormControl>
                              <FormLabel className="font-normal text-[10px] sm:text-xs whitespace-nowrap">Юр. лицо</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-1 sm:space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="individual" className="h-3.5 w-3.5" /></FormControl>
                              <FormLabel className="font-normal text-[10px] sm:text-xs whitespace-nowrap">Физ. лицо</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                 />
                </div>

                {legalStatus === 'company' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="inn" render={({ field }) => <FormItem><FormLabel className="text-xs">ИНН</FormLabel><FormControl><Input placeholder="ИНН..." {...field} /></FormControl><FormMessage /></FormItem>} />
                      <FormField control={form.control} name="kpp" render={({ field }) => <FormItem><FormLabel className="text-xs">КПП</FormLabel><FormControl><Input placeholder="КПП..." {...field} /></FormControl><FormMessage /></FormItem>} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="ogrn" render={({ field }) => <FormItem><FormLabel className="text-xs">ОГРН</FormLabel><FormControl><Input placeholder="ОГРН..." {...field} /></FormControl><FormMessage /></FormItem>} />
                      <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel className="text-xs">Телефон</FormLabel><FormControl><Input placeholder="+7..." {...field} /></FormControl><FormMessage /></FormItem>} />
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="passportSeriesNumber" render={({ field }) => <FormItem><FormLabel className="text-xs">Паспорт</FormLabel><FormControl><Input placeholder="0000 000000" {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel className="text-xs">Телефон</FormLabel><FormControl><Input placeholder="+7..." {...field} /></FormControl><FormMessage /></FormItem>} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel className="text-xs">Email</FormLabel><FormControl><Input placeholder="example@mail.ru" {...field} /></FormControl><FormMessage /></FormItem>} />
                  <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="example@mail.ru" {...field} /></FormControl><FormMessage /></FormItem>} />
                  <FormField control={form.control} name="address" render={({ field }) => <FormItem><FormLabel>Адрес</FormLabel><FormControl><Input placeholder="Город, улица, дом..." {...field} /></FormControl><FormMessage /></FormItem>} />
                </div>
              </div>
            </ScrollArea>
            <div className="px-4 py-3 sm:p-6 border-t bg-muted/20">
              <SheetFooter className="flex-row gap-2 sm:space-x-0">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {materialSupplier ? "Сохранить" : "Создать"}
                </Button>
              </SheetFooter>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
