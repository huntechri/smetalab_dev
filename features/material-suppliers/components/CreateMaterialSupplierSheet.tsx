'use client';

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/shared/ui/form';
import { FormLayout } from '@/shared/ui/form-layout';
import { Input } from '@/shared/ui/input';
import {
  DEFAULT_DIRECTORY_ENTITY_COLOR,
  DirectoryColorInputFrame,
  DirectoryEntitySheetShell,
  DirectoryFormLabel,
  DirectoryInlineRadioGroup,
  DirectorySheetForm,
  DirectorySheetGrid,
} from '@/features/_shared/directories';
import { useAppToast } from '@/components/providers/use-app-toast';
import { createMaterialSupplier, updateMaterialSupplier } from '@/app/actions/material-suppliers';
import { materialSupplierFormSchema, type MaterialSupplierFormValues } from '../schemas/material-supplier-form.schema';
import { Loader2 } from 'lucide-react';
import { MaterialSupplierRow } from '@/shared/types/domain/material-supplier-row';

interface CreateMaterialSupplierSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialSupplier?: MaterialSupplierRow | null;
  onSaved?: (supplier: MaterialSupplierRow) => void;
}

export function CreateMaterialSupplierSheet({
  open,
  onOpenChange,
  materialSupplier,
  onSaved,
}: CreateMaterialSupplierSheetProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useAppToast();

  const form = useForm<MaterialSupplierFormValues>({
    resolver: zodResolver(materialSupplierFormSchema),
    defaultValues: {
      name: '',
      color: DEFAULT_DIRECTORY_ENTITY_COLOR,
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
    <DirectoryEntitySheetShell
      open={open}
      onOpenChange={onOpenChange}
      title={materialSupplier ? 'Редактировать поставщика' : 'Создать поставщика'}
      description="Укажите данные поставщика и сохраните карточку."
      footer={
        <>
          <Button type="button" variant="outline" size="default" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button type="submit" size="default" form="material-supplier-sheet-form" disabled={isPending}>
            {isPending && <Loader2 />}
            {materialSupplier ? 'Сохранить' : 'Создать'}
          </Button>
        </>
      }
    >
      <Form {...form}>
        <FormLayout id="material-supplier-sheet-form" onSubmit={form.handleSubmit(onSubmit)}>
          <DirectorySheetForm>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <DirectoryFormLabel>Наименование</DirectoryFormLabel>
                  <FormControl><Input size="default" placeholder="Наименование..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DirectorySheetGrid>
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <DirectoryFormLabel>Цвет метки</DirectoryFormLabel>
                    <FormControl>
                      <DirectoryColorInputFrame><Input size="default" type="color" value={field.value} onChange={field.onChange} /></DirectoryColorInputFrame>
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
                    <DirectoryFormLabel>Правовой статус</DirectoryFormLabel>
                    <FormControl>
                      <DirectoryInlineRadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        options={[
                          { value: 'company', label: 'Юр. лицо' },
                          { value: 'individual', label: 'Физ. лицо' },
                        ]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DirectorySheetGrid>

            {legalStatus === 'company' ? (
              <>
                <DirectorySheetGrid>
                  <FormField control={form.control} name="inn" render={({ field }) => <FormItem><DirectoryFormLabel>ИНН</DirectoryFormLabel><FormControl><Input size="default" placeholder="ИНН..." {...field} /></FormControl><FormMessage /></FormItem>} />
                  <FormField control={form.control} name="kpp" render={({ field }) => <FormItem><DirectoryFormLabel>КПП</DirectoryFormLabel><FormControl><Input size="default" placeholder="КПП..." {...field} /></FormControl><FormMessage /></FormItem>} />
                </DirectorySheetGrid>
                <DirectorySheetGrid>
                  <FormField control={form.control} name="ogrn" render={({ field }) => <FormItem><DirectoryFormLabel>ОГРН</DirectoryFormLabel><FormControl><Input size="default" placeholder="ОГРН..." {...field} /></FormControl><FormMessage /></FormItem>} />
                  <FormField control={form.control} name="phone" render={({ field }) => <FormItem><DirectoryFormLabel>Телефон</DirectoryFormLabel><FormControl><Input size="default" placeholder="+7..." {...field} /></FormControl><FormMessage /></FormItem>} />
                </DirectorySheetGrid>
              </>
            ) : (
              <DirectorySheetGrid>
                <FormField control={form.control} name="passportSeriesNumber" render={({ field }) => <FormItem><DirectoryFormLabel>Паспорт</DirectoryFormLabel><FormControl><Input size="default" placeholder="0000 000000" {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="phone" render={({ field }) => <FormItem><DirectoryFormLabel>Телефон</DirectoryFormLabel><FormControl><Input size="default" placeholder="+7..." {...field} /></FormControl><FormMessage /></FormItem>} />
              </DirectorySheetGrid>
            )}

            <DirectorySheetGrid>
              <FormField control={form.control} name="email" render={({ field }) => <FormItem><DirectoryFormLabel>Email</DirectoryFormLabel><FormControl><Input size="default" placeholder="example@mail.ru" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="address" render={({ field }) => <FormItem><DirectoryFormLabel>Адрес</DirectoryFormLabel><FormControl><Input size="default" placeholder="Город, улица, дом..." {...field} /></FormControl><FormMessage /></FormItem>} />
            </DirectorySheetGrid>
          </DirectorySheetForm>
        </FormLayout>
      </Form>
    </DirectoryEntitySheetShell>
  );
}
