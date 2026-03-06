'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Badge } from '@/shared/ui/badge';
import { useAppToast } from '@/components/providers/use-app-toast';
import { estimatePatternsActionRepo, EstimatePatternListItem, EstimatePatternPreviewRow } from '@/features/projects/estimates/repository/patterns.actions';

export function PatternsScreen() {
  const { toast } = useAppToast();
  const [items, setItems] = useState<EstimatePatternListItem[]>([]);
  const [selectedName, setSelectedName] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<EstimatePatternPreviewRow[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const loadPatterns = async () => {
    try {
      const data = await estimatePatternsActionRepo.list();
      setItems(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить шаблоны',
      });
    }
  };

  useEffect(() => {
    void loadPatterns();
  }, []);

  const openPreview = async (id: string) => {
    try {
      const preview = await estimatePatternsActionRepo.preview(id);
      setSelectedName(preview.name);
      setPreviewRows(preview.rows);
      setIsPreviewOpen(true);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось открыть превью шаблона',
      });
    }
  };

  const removePattern = async (id: string) => {
    try {
      await estimatePatternsActionRepo.remove(id);
      await loadPatterns();
      toast({ title: 'Шаблон удален' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить шаблон',
      });
    }
  };

  const sortedPreviewRows = previewRows.slice().sort((left, right) => left.order - right.order);

  return (
    <div className="space-y-4">
      <h1 className="sr-only">Шаблоны смет</h1>
      <p className="text-subtitle">Здесь хранятся сохраненные шаблоны для повторного использования в новых сметах.</p>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader className="space-y-2">
              <CardTitle className="text-base">{item.name}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{item.worksCount} работ</Badge>
                <Badge variant="secondary">{item.materialsCount} материалов</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.description ? <p className="text-subtitle">{item.description}</p> : null}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => void openPreview(item.id)}>Превью</Button>
                <Button variant="destructive" size="sm" onClick={() => void removePattern(item.id)}>Удалить</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedName}</DialogTitle>
            <DialogDescription>Превью состава шаблона.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[420px] overflow-y-auto rounded-md border p-3">
            {sortedPreviewRows.map((row) => (
              <div key={row.tempKey} className="flex items-center justify-between border-b py-1 text-sm last:border-b-0">
                <div className={row.kind === 'material' ? 'pl-4 text-muted-foreground' : 'font-medium'}>{row.code} {row.name}</div>
                <div className="text-xs text-muted-foreground">{row.qty} {row.unit} × {row.price.toLocaleString('ru-RU')}</div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
