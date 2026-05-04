'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { notify } from '@/lib/infrastructure/notifications/notify';
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
import { FormLayout } from '@/shared/ui/form-layout';
import { Input } from '@/shared/ui/input';

import {
    createEstimateSchema,
    type CreateEstimateInput,
} from '../schemas/create-estimate.schema';
import { createEstimateAction } from '@/app/actions/estimates/create';

interface CreateEstimateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    onSuccess?: () => void;
}

export function CreateEstimateDialog({
    open,
    onOpenChange,
    projectId,
    onSuccess,
}: CreateEstimateDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<CreateEstimateInput>({
        resolver: zodResolver(createEstimateSchema),
        defaultValues: {
            name: '',
            projectId,
        },
    });

    React.useEffect(() => {
        if (open) {
            form.reset({
                name: '',
                projectId,
            });
        }
    }, [open, projectId, form]);

    async function onSubmit(data: CreateEstimateInput) {
        setIsSubmitting(true);
        try {
            const result = await createEstimateAction(data);

            if (result.success) {
                notify({ title: 'Смета успешно создана', intent: 'success' });
                onOpenChange(false);
                form.reset();
                onSuccess?.();
            } else {
                notify({ title: result.error || 'Произошла ошибка', intent: 'error' });
            }
        } catch {
            notify({ title: 'Произошла непредвиденная ошибка', intent: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="estimate">
                <DialogHeader>
                    <DialogTitle>Создать новую смету</DialogTitle>
                    <DialogDescription>
                        Укажите название сметы для начала работы.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <FormLayout onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Название сметы</FormLabel>
                                    <FormControl>
                                        <Input size="default"
                                            placeholder="Например: Смета на черновые работы"
                                            autoFocus
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                size="default"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Отменить
                            </Button>
                            <Button type="submit" size="default" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Сохранить
                            </Button>
                        </DialogFooter>
                    </FormLayout>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
