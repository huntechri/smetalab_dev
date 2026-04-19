'use client';

import { useEffect, useState } from 'react';

import { Skeleton } from '@repo/ui';
import { useAppToast } from '@/components/providers/use-app-toast';
import { ProjectReceiptsSection } from '@/features/projects/dashboard/components/ProjectReceiptsSection';
import { projectReceiptsActionRepo } from '@/features/projects/dashboard/repository/project-receipts.actions';
import type { ProjectReceiptAggregates, ProjectReceiptRow } from '@/shared/types/project-receipts';

const emptyAggregates: ProjectReceiptAggregates = {
  totalConfirmedReceipts: 0,
  confirmedCount: 0,
  lastConfirmedReceiptDate: null,
  lastConfirmedReceiptAmount: null,
  hasCorrections: false,
};

export function EstimateFinance({ projectId }: { projectId: string }) {
  const { toast } = useAppToast();
  const [rows, setRows] = useState<ProjectReceiptRow[] | null>(null);
  const [aggregates, setAggregates] = useState<ProjectReceiptAggregates>(emptyAggregates);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [nextRows, nextAggregates] = await Promise.all([
          projectReceiptsActionRepo.list(projectId),
          projectReceiptsActionRepo.getAggregates(projectId),
        ]);

        if (!active) return;
        setRows(nextRows);
        setAggregates(nextAggregates);
      } catch {
        if (!active) return;
        setRows([]);
        setAggregates(emptyAggregates);
        toast({
          variant: 'destructive',
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить финансовые поступления проекта.',
        });
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [projectId, toast]);

  if (!rows) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  return (
    <ProjectReceiptsSection
      projectId={projectId}
      initialRows={rows}
      initialAggregates={aggregates}
    />
  );
}
