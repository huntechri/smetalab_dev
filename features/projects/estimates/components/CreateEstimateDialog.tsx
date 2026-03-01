'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
                toast.success('Смета успешно создана');
                onOpenChange(false);
                form.reset();
                onSuccess?.();
            } else {
                toast.error(result.error || 'Произошла ошибка');
            }
        } catch {
            toast.error('Произошла непредвиденная ошибка');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle>Создать новую смету</DialogTitle>
                    <DialogDescription>
                        Укажите название сметы для начала работы.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Название сметы</FormLabel>
                                    <FormControl>
                                        <Input
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
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Отменить
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Сохранить
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
