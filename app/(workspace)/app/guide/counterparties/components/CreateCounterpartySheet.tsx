"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CounterpartyRow } from "@/types/counterparty-row";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createCounterparty, updateCounterparty } from "@/app/actions/counterparties";
import {
    Loader2,
    User,
    FileText,
    Landmark,
    Mail,
    Phone,
    MapPin,
    Briefcase,
} from "lucide-react";

interface CreateCounterpartySheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    counterparty?: CounterpartyRow | null;
    tenantId: number;
    onSaved?: () => void;
}

const formSchema = z.object({
    name: z.string().min(1, "Обязательное поле"),
    type: z.enum(["customer", "contractor", "supplier"]),
    legalStatus: z.enum(["individual", "company"]),

    // Individual
    birthDate: z.string().optional(),
    passportSeriesNumber: z.string().optional(),
    passportIssuedBy: z.string().optional(),
    passportIssuedDate: z.string().optional(),
    departmentCode: z.string().optional(),

    // Company
    ogrn: z.string().optional(),
    inn: z.string().optional(),
    kpp: z.string().optional(),

    // Contact
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Некорректный email").optional().or(z.literal("")),

    // Bank
    bankName: z.string().optional(),
    bankAccount: z.string().optional(),
    corrAccount: z.string().optional(),
    bankInn: z.string().optional(),
    bankKpp: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateCounterpartySheet({
    open,
    onOpenChange,
    counterparty,
    tenantId,
    onSaved,
}: CreateCounterpartySheetProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
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

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            try {
                if (counterparty) {
                    const result = await updateCounterparty({ id: counterparty.id, data: values });
                    if (result.success) {
                        toast.success("Контрагент обновлен");
                        onOpenChange(false);
                        onSaved?.();
                        router.refresh();
                    } else {
                        toast.error(result.message || "Произошла ошибка при сохранении");
                    }
                } else {
                    const result = await createCounterparty(values);
                    if (result.success) {
                        toast.success("Контрагент создан");
                        onOpenChange(false);
                        onSaved?.();
                        router.refresh();
                    } else {
                        toast.error(result.message || "Произошла ошибка при сохранении");
                    }
                }
            } catch (_error) {
                toast.error("Произошла ошибка при сохранении");
            }
        });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[540px] flex flex-col p-0">
                <SheetHeader className="p-6 pb-4">
                    <SheetTitle>
                        {counterparty ? "Редактировать контрагента" : "Создать контрагента"}
                    </SheetTitle>
                    <SheetDescription>
                        Заполните информацию о контрагенте для справочника.
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                        <ScrollArea className="flex-1">
                            <div className="p-6 pt-0 space-y-6">
                                <Tabs defaultValue="general" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-6">
                                        <TabsTrigger value="general">Общее</TabsTrigger>
                                        <TabsTrigger value="details">Детали</TabsTrigger>
                                        <TabsTrigger value="bank">Банк</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="general" className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Наименование / ФИО</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Введите название..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                                                <SelectItem value="customer">Заказчик</SelectItem>
                                                                <SelectItem value="contractor">Подрядчик</SelectItem>
                                                                <SelectItem value="supplier">Поставщик</SelectItem>
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
                                                    <FormItem className="space-y-3">
                                                        <FormLabel>Правовой статус</FormLabel>
                                                        <FormControl>
                                                            <RadioGroup
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                                className="flex flex-col space-y-1"
                                                            >
                                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem value="individual" />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">
                                                                        Физ. лицо
                                                                    </FormLabel>
                                                                </FormItem>
                                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem value="company" />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">
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

                                        <Separator />

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 font-medium">
                                                <Phone className="w-4 h-4 text-muted-foreground" />
                                                Контактная информация
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Телефон</FormLabel>
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
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="example@mail.ru" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="address"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Адрес</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Город, улица, дом..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="details" className="space-y-4">
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
                                                                <FormLabel>Дата рождения</FormLabel>
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
                                                                <FormLabel>Серия и номер</FormLabel>
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
                                                            <FormLabel>Кем выдан</FormLabel>
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
                                                                <FormLabel>Дата выдачи</FormLabel>
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
                                                                <FormLabel>Код подразделения</FormLabel>
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
                                                            <FormLabel>ИНН</FormLabel>
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
                                                                <FormLabel>КПП</FormLabel>
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
                                                                <FormLabel>ОГРН</FormLabel>
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

                                    <TabsContent value="bank" className="space-y-4">
                                        <div className="flex items-center gap-2 font-medium">
                                            <Landmark className="w-4 h-4 text-muted-foreground" />
                                            Банковские реквизиты
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="bankName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Название банка</FormLabel>
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
                                                    <FormLabel>Расчетный счет</FormLabel>
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
                                                        <FormLabel>Корр. счет</FormLabel>
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
                                                        <FormLabel>ИНН Банка</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="ИНН банка" {...field} />
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

                        <div className="p-6 border-t bg-muted/20">
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
