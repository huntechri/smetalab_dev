'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, XCircle } from 'lucide-react';

import { useAppToast } from '@/components/providers/use-app-toast';
import { ActionMenu } from '@/shared/ui/action-menu';
import { Button } from '@/shared/ui/button';
import { CardShell, CardShellBody, CardShellHeader } from '@/shared/ui/card-shell';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { EmptyState } from '@/shared/ui/states';
import { StatusBadge, StatusBadgeValue, type StatusTone } from '@/shared/ui/status-badge';
import { Table, TableBody, TableHeader } from '@/shared/ui/table';
import {
  CompactTableCell,
  CompactTableHead,
  CompactTableHeaderRow,
  CompactTableRow,
} from '@/shared/ui/table-density';
import { Textarea } from '@/shared/ui/textarea';
import type { ProjectReceiptAggregates, ProjectReceiptRow } from '@/shared/types/project-receipts';
import { projectReceiptsActionRepo } from '../repository/project-receipts.actions';

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

const receiptStatusTone: Record<ProjectReceiptRow['status'], StatusTone> = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'neutral',
};

const dispatchProjectReceiptsMutated = (projectId: string) => {
  window.dispatchEvent(new CustomEvent('project-receipts:mutated', { detail: { projectId } }));
};

export function ProjectReceiptsSection({ projectId, initialRows, initialAggregates }: ProjectReceiptsSectionProps) {
  const { toast } = useAppToast();
  const router = useRouter();
  const [rows, setRows] = useState<ProjectReceiptRow[]>(initialRows);
  const [aggregates, setAggregates] = useState<ProjectReceiptAggregates>(initialAggregates);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<ProjectReceiptRow | null>(null);
  const [form, setForm] = useState<ReceiptFormState>(createDefaultFormState());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isSaving) return;
    setRows(initialRows);
  }, [initialRows, isSaving]);

  useEffect(() => {
    if (isSaving) return;
    setAggregates(initialAggregates);
  }, [initialAggregates, isSaving]);

  const confirmedRows = useMemo(
    () => rows.filter((row) => row.status === 'confirmed'),
    [rows],
  );

  const refreshAggregates = async () => {
    const nextAggregates = await projectReceiptsActionRepo.getAggregates(projectId);
    setAggregates(nextAggregates);
  };

  const notifyReceiptsMutation = () => {
    dispatchProjectReceiptsMutated(projectId);
    router.refresh();
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
      notifyReceiptsMutation();
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
      notifyReceiptsMutation();
      toast({ title: 'Поступление отменено' });
    } catch {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось отменить поступление.' });
    }
  };

  return (
    <CardShell>
      <CardShellHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <h2 className="font-semibold leading-none tracking-tight">Фактические поступления</h2>
        <div className="flex items-center gap-2">
          <StatusBadge tone="neutral">Платежей: {aggregates.confirmedCount}</StatusBadge>
          <StatusBadge tone="neutral">
            <span>Подтверждено:</span>
            <StatusBadgeValue>{formatCurrency(aggregates.totalConfirmedReceipts)}</StatusBadgeValue>
          </StatusBadge>
          <Button size="default" onClick={onAddClick}>
            <Plus className="mr-1 size-4" /> Добавить
          </Button>
        </div>
      </CardShellHeader>
      <CardShellBody className="space-y-3">
        {confirmedRows.length === 0 ? (
          <EmptyState
            title="Нет подтвержденных поступлений. Добавьте первую запись."
            density="compact"
          />
        ) : null}
        <Table>
          <TableHeader>
            <CompactTableHeaderRow>
              <CompactTableHead>Дата</CompactTableHead>
              <CompactTableHead>Тип</CompactTableHead>
              <CompactTableHead>Сумма</CompactTableHead>
              <CompactTableHead>Статус</CompactTableHead>
              <CompactTableHead>Комментарий</CompactTableHead>
              <CompactTableHead className="w-10" />
            </CompactTableHeaderRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <CompactTableRow key={row.id}>
                <CompactTableCell>{new Date(row.date).toLocaleDateString('ru-RU')}</CompactTableCell>
                <CompactTableCell>{receiptTypeOptions.find((option) => option.value === row.type)?.label ?? row.type}</CompactTableCell>
                <CompactTableCell tone={row.amount < 0 ? 'danger' : 'success'} weight="semibold" tabular>
                  {formatCurrency(row.amount)}
                </CompactTableCell>
                <CompactTableCell>
                  <StatusBadge tone={receiptStatusTone[row.status]}>
                    {receiptStatusOptions.find((option) => option.value === row.status)?.label ?? row.status}
                  </StatusBadge>
                </CompactTableCell>
                <CompactTableCell className="max-w-80" tone="muted" truncate>{row.comment || '—'}</CompactTableCell>
                <CompactTableCell>
                  <ActionMenu
                    ariaLabel="Действия поступления"
                    items={[
                      {
                        label: 'Редактировать',
                        icon: <Pencil />,
                        onClick: () => onEditClick(row),
                      },
                      ...(row.status !== 'cancelled'
                        ? [{
                            label: 'Отменить',
                            icon: <XCircle />,
                            variant: 'destructive' as const,
                            onClick: () => void onCancelReceipt(row.id),
                          }]
                        : []),
                    ]}
                  />
                </CompactTableCell>
              </CompactTableRow>
            ))}
          </TableBody>
        </Table>
      </CardShellBody>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRow ? 'Редактировать поступление' : 'Новое поступление'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label htmlFor="receipt-date">Дата</Label>
              <Input size="default" id="receipt-date" type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="receipt-amount">Сумма</Label>
              <Input size="default" id="receipt-amount" type="number" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
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
              <Input size="default" id="receipt-source" value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="receipt-comment">Комментарий</Label>
              <Textarea id="receipt-comment" value={form.comment} onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="default" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
            <Button size="default" onClick={() => void onSubmit()} disabled={isSaving}>{editingRow ? 'Сохранить' : 'Создать'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardShell>
  );
}
