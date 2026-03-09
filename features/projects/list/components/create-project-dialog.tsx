'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/shared/ui/command';
import { DatePicker } from '@/shared/ui/date-picker';

import { createProjectSchema, type CreateProjectInput } from '../../shared/schemas/create-project.schema';
import { createProjectAction } from '@/app/actions/projects/create';
import { updateProjectAction } from '@/app/actions/projects/update';
import { useRouter } from 'next/navigation';
import { ProjectListItem } from '../../shared/types';

interface CreateProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    counterparties: { id: string; name: string }[];
    project?: ProjectListItem;
}

export function CreateProjectDialog({
    open,
    onOpenChange,
    counterparties,
    project,
}: CreateProjectDialogProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<CreateProjectInput>({
        resolver: zodResolver(createProjectSchema),
        defaultValues: {
            name: '',
            counterpartyId: undefined,
            startDate: undefined,
            endDate: undefined,
        },
    });

    React.useEffect(() => {
        if (project && open) {
            form.reset({
                name: project.name,
                counterpartyId: project.counterpartyId || undefined,
                startDate: project.startDate ? new Date(project.startDate) : undefined,
                endDate: project.endDate ? new Date(project.endDate) : undefined,
            });
        } else if (!project && open) {
            form.reset({
                name: '',
                counterpartyId: undefined,
                startDate: undefined,
                endDate: undefined,
            });
        }
    }, [project, open, form]);

    // Watch for counterparty selection is not needed anymore for mode switching
    // const customerMode = form.watch('customerMode');

    async function onSubmit(data: CreateProjectInput) {
        setIsSubmitting(true);
        try {
            const result = project
                ? await updateProjectAction(project.id, data)
                : await createProjectAction(data);

            if (result.success) {
                toast.success(project ? 'Проект успешно обновлен' : 'Проект успешно создан');
                onOpenChange(false);
                form.reset();
                router.refresh();

                // Extra safety: trigger window event to notify parent if needed, 
                // but since we updated ProjectsScreen to use local state + router.refresh,
                // we should ensure the parent actually updates.
            } else {
                toast.error(result.error?.message || 'Произошла ошибка');
            }
        } catch {
            toast.error('Произошла непредвиденная ошибка');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{project ? 'Редактировать проект' : 'Создать новый проект'}</DialogTitle>
                    <DialogDescription>
                        {project ? 'Измените параметры проекта и нажмите сохранить.' : 'Введите название проекта и выберите заказчика для начала работы.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Название проекта</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Введите название проекта" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <FormLabel>Заказчик</FormLabel>

                            <FormField
                                control={form.control}
                                name="counterpartyId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            'w-full justify-between font-normal',
                                                            !field.value && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {field.value
                                                            ? counterparties.find((c) => c.id === field.value)?.name
                                                            : 'Выберите контрагента'}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-(--radix-popover-trigger-width) min-w-[300px] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Поиск контрагента..." />
                                                    <CommandList>
                                                        <CommandEmpty>Контрагент не найден.</CommandEmpty>
                                                        <CommandGroup>
                                                            {counterparties.map((counterparty) => (
                                                                <CommandItem
                                                                    value={counterparty.name}
                                                                    key={counterparty.id}
                                                                    onSelect={() => {
                                                                        form.setValue('counterpartyId', counterparty.id);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            'mr-2 h-4 w-4',
                                                                            counterparty.id === field.value
                                                                                ? 'opacity-100'
                                                                                : 'opacity-0'
                                                                        )}
                                                                    />
                                                                    {counterparty.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Дата начала</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    date={field.value}
                                                    setDate={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Дата окончания</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    date={field.value}
                                                    setDate={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Отменить
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {project ? 'Сохранить изменения' : 'Создать проект'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
