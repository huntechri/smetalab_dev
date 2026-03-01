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
} from '@/shared/ui/sheet';
import { Button } from '@/shared/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { Separator } from '@/shared/ui/separator';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { useToast } from '@/shared/ui/use-toast';
import { createMaterialSupplier, updateMaterialSupplier } from '@/app/actions/material-suppliers';
import { materialSupplierFormSchema, type MaterialSupplierFormValues } from '../schemas/material-supplier-form.schema';
import { Loader2 } from 'lucide-react';
import { MaterialSupplierRow } from '@/types/material-supplier-row';

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
  const { toast } = useToast();

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
      <SheetContent className="w-full sm:max-w-2xl p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
            <SheetHeader className="p-6 pb-4">
              <SheetTitle>{materialSupplier ? 'Редактировать поставщика материалов' : 'Создать поставщика материалов'}</SheetTitle>
              <SheetDescription>Справочник поставщиков материалов не связан с другими компонентами.</SheetDescription>
            </SheetHeader>

            <Separator />

            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Наименование</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Цвет метки</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input type="color" value={field.value} onChange={field.onChange} className="h-10 w-14 p-1" />
                          <Input value={field.value} onChange={field.onChange} className="font-mono" />
                        </div>
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
                      <FormLabel>Правовой статус</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-6">
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl><RadioGroupItem value="company" /></FormControl>
                            <FormLabel className="font-normal">Юр. лицо</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl><RadioGroupItem value="individual" /></FormControl>
                            <FormLabel className="font-normal">Физ. лицо</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {legalStatus === 'company' ? (
                  <>
                    <FormField control={form.control} name="inn" render={({ field }) => <FormItem><FormLabel>ИНН</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="kpp" render={({ field }) => <FormItem><FormLabel>КПП</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="ogrn" render={({ field }) => <FormItem><FormLabel>ОГРН</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                  </>
                ) : (
                  <FormField control={form.control} name="passportSeriesNumber" render={({ field }) => <FormItem><FormLabel>Паспорт</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                )}

                <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>Телефон</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="address" render={({ field }) => <FormItem><FormLabel>Адрес</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              </div>
            </ScrollArea>

            <Separator />
            <SheetFooter className="p-6 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {materialSupplier ? 'Сохранить' : 'Создать'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
