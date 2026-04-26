'use client';

import { Card, CardContent } from '@/shared/ui/card';
import { EstimateMeta } from '../types/dto';
import { EstimateStatusBadge } from '@/entities/estimate/ui/EstimateStatusBadge';
import { Button } from '@/shared/ui/button';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEstimateMutations } from '../hooks/use-estimate-mutations';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";

export function EstimateHeader({ meta }: { meta: EstimateMeta }) {
    const router = useRouter();
    const { deleteEstimate } = useEstimateMutations();

    const onDelete = async () => {
        const isDeleted = await deleteEstimate({
            estimateId: meta.id,
            estimateName: meta.name,
        });

        if (isDeleted) {
            router.push(`/app/projects/${meta.projectId}`);
        }
    };

    return (
        <Card className="border-border/40 shadow-sm overflow-hidden">
            <CardContent className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <h1 className="sr-only">{meta.name}</h1>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="icon-sm"
                                    title="Удалить смету"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Вы уверены, что хотите удалить смету?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Смета "{meta.name}" будет удалена. Это действие нельзя отменить.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={onDelete}
                                    >
                                        Удалить
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">
                        Обновлено: {new Date(meta.updatedAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                    <EstimateStatusBadge status={meta.status} />
                    <div className="h-8 w-px bg-border/40 hidden sm:block mx-1" />
                    <div className="flex flex-col sm:items-end">
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold leading-none mb-1 sm:text-[11px]">Итого</span>
                        <span className="text-lg md:text-xl font-bold text-primary">
                            {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(meta.total)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
