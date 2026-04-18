"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/shared/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Separator } from "@/shared/ui/separator";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { CounterpartyRow } from "@/shared/types/domain/counterparty-row";
import { useAppToast } from "@/components/providers/use-app-toast";
import { createCounterparty, updateCounterparty } from "@/app/actions/counterparties";
import { counterpartyFormSchema, type CounterpartyFormValues } from "../schemas/counterparty-form.schema";
import {
    Loader2,
    User,
    FileText,
    Landmark,
    Phone,
} from "lucide-react";

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
    const [isPending, startTransition] = useTransition();
    const { toast } = useAppToast();

    const form = useForm<CounterpartyFormValues>({
        resolver: zodResolver(counterpartyFormSchema),
        defaultValues: {
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
        },
    });

    const legalStatus = form.watch("legalStatus");

    useEffect(() => {
        if (counterparty) {
            form.reset({
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
            });
        } else {
            form.reset({
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
            });
        }
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
                    } else {
                        toast({ variant: "destructive", title: result.message || "Произошла ошибка при сохранении" });
                    }
                } else {
                    const result = await createCounterparty(values);
                    if (result.success) {
                        toast({ title: "Контрагент создан" });
                        onOpenChange(false);
                        onSaved?.(result.data, "create");
                    } else {
                        toast({ variant: "destructive", title: result.message || "Произошла ошибка при сохранении" });
                    }
                }
            } catch (_error) {
                toast({ variant: "destructive", title: "Произошла ошибка при сохранении" });
            }
        });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[540px] max-h-dvh flex flex-col p-0">
                <SheetHeader className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
                    <SheetTitle className="text-base sm:text-lg">
                        {counterparty ? "Редактировать контрагента" : "Создать контрагента"}
                    </SheetTitle>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                        <ScrollArea className="flex-1 min-h-0">
                            <div className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4 sm:space-y-4">
                                <Tabs defaultValue="general" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
                                        <TabsTrigger value="general" className="text-xs">Общее</TabsTrigger>
                                        <TabsTrigger value="details" className="text-xs">Детали</TabsTrigger>
                                        <TabsTrigger value="bank" className="text-xs">Банк</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="general" className="space-y-3 sm:space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Наименование / ФИО</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Введите название..." className="h-8 text-xs placeholder:text-xs" {...field} />
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
                                                                    <SelectTrigger className="h-8 text-xs px-2">
                                                                        <SelectValue placeholder="Тип" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="customer" className="text-xs">Заказчик</SelectItem>
                                                                    <SelectItem value="contractor" className="text-xs">Подрядчик</SelectItem>
                                                                    <SelectItem value="supplier" className="text-xs">Поставщик</SelectItem>
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
                                                                <Input placeholder="+7..." className="h-8 text-xs placeholder:text-xs px-2" {...field} />
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
                                                                <Input placeholder="example@mail.ru" className="h-8 text-xs placeholder:text-xs px-2" {...field} />
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
                                                            <Input placeholder="Город, улица, дом..." className="h-8 text-xs placeholder:text-xs" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </TabsContent>

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
                                                                    <Input type="date" className="h-8 text-xs" {...field} />
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
                                                                    <Input placeholder="0000 000000" className="h-8 text-xs placeholder:text-xs" {...field} />
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
                                                                <Input placeholder="УФМС..." className="h-8 text-xs placeholder:text-xs" {...field} />
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
                                                                    <Input type="date" className="h-8 text-xs" {...field} />
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
                                                                    <Input placeholder="000-000" className="h-8 text-xs placeholder:text-xs" {...field} />
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
                                                                <Input placeholder="ИНН" className="h-8 text-xs placeholder:text-xs" {...field} />
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
                                                                    <Input placeholder="КПП" className="h-8 text-xs placeholder:text-xs" {...field} />
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
                                                                    <Input placeholder="ОГРН" className="h-8 text-xs placeholder:text-xs" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>

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
                                                        <Input placeholder="ПАО Сбербанк..." className="h-8 text-xs placeholder:text-xs" {...field} />
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
                                                        <Input placeholder="407..." className="h-8 text-xs placeholder:text-xs" {...field} />
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
                                                            <Input placeholder="301..." className="h-8 text-xs placeholder:text-xs" {...field} />
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
                                                            <Input placeholder="ИНН банка" className="h-8 text-xs placeholder:text-xs" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </ScrollArea>

                        <div className="px-4 py-3 sm:p-6 border-t bg-muted/20">
                            <SheetFooter className="flex-row gap-2 sm:space-x-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Отмена
                                </Button>
                                <Button type="submit" className="flex-1" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {counterparty ? "Сохранить" : "Создать"}
                                </Button>
                            </SheetFooter>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
