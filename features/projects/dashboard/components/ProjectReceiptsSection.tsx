'use client';

import { useMemo, useState } from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';

import { useAppToast } from '@/components/providers/use-app-toast';
import { Badge } from '@repo/ui';
import { Button } from '@repo/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui';
import { Textarea } from '@repo/ui';
import type { ProjectReceiptAggregates, ProjectReceiptRow } from '@/shared/types/project-receipts';
import { projectReceiptsActionRepo } from '../repository/project-receipts.actions';
import { projectBadgeClassName, projectStatusBadgeToneClassName } from '@/features/projects/shared/ui/project-badge-styles';

const receiptTypeOptions: Array<{ value: ProjectReceiptRow['type']; label: string }> = [
  { value: 'advance', label: 'Аванс' },
  { value: 'stage_payment', label: 'Оплата этапа' },
  { value: 'partial_payment', label: 'Частичная оплата' },
  { value: 'final_payment', label: 'Финальный расчет' },
  { value: 'additional_payment', label: 'Доплата' },
  { value: 'adjustment', label: 'Корректировка' },
  { value: 'refund', label: 'Возврат' },
];

const receiptStatusOptions: Array<{ value: ProjectReceiptRow['status']; label: string }> = [
  { value: 'confirmed', label: 'Подтверждено' },
  { value: 'pending', label: 'Ожидает' },
  { value: 'cancelled', label: 'Отменено' },
];

type ReceiptFormState = {
  date: string;
  amount: string;
  type: ProjectReceiptRow['type'];
  status: ProjectReceiptRow['status'];
  comment: string;
  source: string;
};

const createDefaultFormState = (): ReceiptFormState => ({
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  type: 'partial_payment',
  status: 'confirmed',
  comment: '',
  source: '',
});

const toFormState = (row: ProjectReceiptRow): ReceiptFormState => ({
  date: row.date,
  amount: String(row.amount),
  type: row.type,
  status: row.status,
  comment: row.comment,
  source: row.source ?? '',
});

const formatCurrency = (value: number) => new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
}).format(value);

type ProjectReceiptsSectionProps = {
  projectId: string;
  initialRows: ProjectReceiptRow[];
  initialAggregates: ProjectReceiptAggregates;
};

const receiptStatusBadgeTone: Record<ProjectReceiptRow['status'], string> = {
  confirmed: projectStatusBadgeToneClassName.success,
  pending: projectStatusBadgeToneClassName.warning,
  cancelled: projectStatusBadgeToneClassName.neutral,
};

export function ProjectReceiptsSection({ projectId, initialRows, initialAggregates }: ProjectReceiptsSectionProps) {
  const { toast } = useAppToast();
  const [rows, setRows] = useState<ProjectReceiptRow[]>(initialRows);
  const [aggregates, setAggregates] = useState<ProjectReceiptAggregates>(initialAggregates);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<ProjectReceiptRow | null>(null);
  const [form, setForm] = useState<ReceiptFormState>(createDefaultFormState());
  const [isSaving, setIsSaving] = useState(false);

  const confirmedRows = useMemo(
    () => rows.filter((row) => row.status === 'confirmed'),
    [rows],
  );

  const refreshAggregates = async () => {
    const nextAggregates = await projectReceiptsActionRepo.getAggregates(projectId);
    setAggregates(nextAggregates);
  };

  const onAddClick = () => {
    setEditingRow(null);
    setForm(createDefaultFormState());
    setIsDialogOpen(true);
  };

  const onEditClick = (row: ProjectReceiptRow) => {
    setEditingRow(row);
    setForm(toFormState(row));
    setIsDialogOpen(true);
  };

  const onSubmit = async () => {
    if (isSaving) return;

    const parsedAmount = Number(form.amount.replace(',', '.'));
    if (!Number.isFinite(parsedAmount) || parsedAmount === 0) {
      toast({ variant: 'destructive', title: 'Ошибка валидации', description: 'Введите ненулевую сумму поступления.' });
      return;
    }

    if (!form.date) {
      toast({ variant: 'destructive', title: 'Ошибка валидации', description: 'Укажите дату поступления.' });
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        date: form.date,
        amount: parsedAmount,
        type: form.type,
        status: form.status,
        comment: form.comment,
        source: form.source.length > 0 ? form.source : null,
      };

      if (editingRow) {
        const updated = await projectReceiptsActionRepo.update(editingRow.id, payload);
        setRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      } else {
        const created = await projectReceiptsActionRepo.create({ projectId, ...payload });
        setRows((current) => [created, ...current]);
      }

      await refreshAggregates();
      setIsDialogOpen(false);
    } catch {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось сохранить поступление.' });
    } finally {
      setIsSaving(false);
    }
  };

  const onCancelReceipt = async (receiptId: string) => {
    try {
      const cancelled = await projectReceiptsActionRepo.cancel(receiptId);
      setRows((current) => current.map((row) => (row.id === cancelled.id ? cancelled : row)));
      await refreshAggregates();
      toast({ title: 'Поступление отменено' });
    } catch {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось отменить поступление.' });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>Фактические поступления</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={projectBadgeClassName}>Платежей: {aggregates.confirmedCount}</Badge>
          <Badge variant="outline" className={projectBadgeClassName}>Подтверждено: {formatCurrency(aggregates.totalConfirmedReceipts)}</Badge>
          <Button onClick={onAddClick}>
            <Plus className="mr-1 size-4" /> Добавить
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {confirmedRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Нет подтвержденных поступлений. Добавьте первую запись.</p>
        ) : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Комментарий</TableHead>
              <TableHead className="w-[40px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{new Date(row.date).toLocaleDateString('ru-RU')}</TableCell>
                <TableCell>{receiptTypeOptions.find((option) => option.value === row.type)?.label ?? row.type}</TableCell>
                <TableCell className={row.amount < 0 ? 'text-red-600' : 'text-green-600'}>{formatCurrency(row.amount)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${projectBadgeClassName} ${receiptStatusBadgeTone[row.status]}`}>
                    {receiptStatusOptions.find((option) => option.value === row.status)?.label ?? row.status}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[320px] truncate">{row.comment || '—'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditClick(row)}>Редактировать</DropdownMenuItem>
                      {row.status !== 'cancelled' ? (
                        <DropdownMenuItem onClick={() => void onCancelReceipt(row.id)}>Отменить</DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRow ? 'Редактировать поступление' : 'Новое поступление'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label htmlFor="receipt-date">Дата</Label>
              <Input id="receipt-date" type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="receipt-amount">Сумма</Label>
              <Input id="receipt-amount" type="number" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label>Тип</Label>
                <Select value={form.type} onValueChange={(value) => setForm((current) => ({ ...current, type: value as ProjectReceiptRow['type'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {receiptTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Статус</Label>
                <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value as ProjectReceiptRow['status'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {receiptStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="receipt-source">Основание / источник</Label>
              <Input id="receipt-source" value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="receipt-comment">Комментарий</Label>
              <Textarea id="receipt-comment" value={form.comment} onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
            <Button onClick={() => void onSubmit()} disabled={isSaving}>{editingRow ? 'Сохранить' : 'Создать'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
