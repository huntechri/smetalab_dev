"use client";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/shared/ui/sheet";
import { WorkCatalogPicker } from "@/features/catalog/components/WorkCatalogPicker.client";
import { MaterialCatalogDialog } from "@/features/catalog/components/MaterialCatalogDialog.client";
import {
  ESTIMATE_COEF_MAX,
  ESTIMATE_COEF_MIN,
} from "@/lib/utils/estimate-coefficient";
import type { EstimateTableController } from "../../hooks/use-estimate-table-controller";

interface EstimateTableDialogsProps {
  model: EstimateTableController;
  estimateName: string;
  isDeleteDialogOpen: boolean;
  isDeleting: boolean;
  onDeleteDialogChange: (open: boolean) => void;
  onDeleteConfirm: () => Promise<void> | void;
}

export function EstimateTableDialogs({
  model,
  estimateName,
  isDeleteDialogOpen,
  isDeleting,
  onDeleteDialogChange,
  onDeleteConfirm,
}: EstimateTableDialogsProps) {
  return (
    <>
      <Sheet
        open={model.isCalculationModeOpen || Boolean(model.activeWorkForReplace)}
        onOpenChange={model.handleWorkCatalogOpenChange}
      >
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
          <div className="p-6 border-b">
            <SheetTitle className="text-xl md:text-2xl">
              {model.activeWorkForReplace ? "Замена работы" : "Справочник работ"}
            </SheetTitle>
            <SheetDescription className="text-sm space-y-1">
              {model.activeWorkForReplace ? (
                <>
                  <span>Выберите новую работу для замены текущей.</span>
                  <span className="block text-primary font-medium">
                    Заменяемая позиция: {model.activeWorkForReplace.name}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Выберите необходимые позиции для автоматического добавления в смету.
                  </span>
                  {model.pendingInsertAfterWork ? (
                    <span className="block text-primary font-medium">
                      Режим вставки: ниже работы «{model.pendingInsertAfterWork.name}»
                    </span>
                  ) : null}
                </>
              )}
            </SheetDescription>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <WorkCatalogPicker
              onAddWork={
                model.activeWorkForReplace
                  ? model.replaceWorkFromCatalog
                  : model.addWorkFromCatalog
              }
              addedWorkNames={model.activeWorkForReplace ? new Set() : model.addedWorkNames}
            />
          </div>
        </SheetContent>
      </Sheet>

      <MaterialCatalogDialog
        isOpen={Boolean(model.activeWorkForMaterial)}
        onClose={() => model.setActiveWorkForMaterial(null)}
        onSelect={model.addMaterialFromCatalog}
        parentWorkName={model.activeWorkForMaterial?.name ?? ""}
        addedMaterialNames={model.addedMaterialNamesForActiveWork}
        closeOnSelect={false}
      />

      <MaterialCatalogDialog
        isOpen={Boolean(model.activeMaterialForReplace)}
        onClose={() => model.setActiveMaterialForReplace(null)}
        onSelect={model.replaceMaterialFromCatalog}
        parentWorkName={model.activeMaterialForReplace?.name ?? ""}
        mode="replace"
      />

      <Dialog open={model.isSectionDialogOpen} onOpenChange={model.setIsSectionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить раздел</DialogTitle>
            <DialogDescription>
              {model.sectionInsertBeforeRowId
                ? "Раздел будет вставлен перед выбранной строкой."
                : model.sectionInsertAfterRowId
                  ? "Раздел будет вставлен после выбранной строки."
                  : "Раздел будет добавлен в конец сметы."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="section-code">№ раздела</Label>
            <Input
              id="section-code"
              value={model.sectionCodeInput}
              onChange={(event) => model.setSectionCodeInput(event.target.value)}
              placeholder="Например: 1.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="section-name">Название раздела</Label>
            <Input
              id="section-name"
              value={model.sectionNameInput}
              onChange={(event) => model.setSectionNameInput(event.target.value)}
              placeholder="Например: Демонтажные работы"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => model.setIsSectionDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="brand" onClick={() => void model.createSection()}>
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={model.isCoefficientDialogOpen}
        onOpenChange={model.setIsCoefficientDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Коэффициент сметы</DialogTitle>
            <DialogDescription>
              Введите процент для пересчета единичных расценок работ. Материалы не
              изменяются.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="estimate-coef">Коэффициент, %</Label>
            <Input
              id="estimate-coef"
              value={model.coefInputValue}
              onChange={(event) => model.setCoefInputValue(event.target.value)}
              placeholder="Например: 20"
            />
            <p className="text-xs text-muted-foreground">
              Допустимый диапазон: от {ESTIMATE_COEF_MIN}% до {ESTIMATE_COEF_MAX}%.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => model.setIsCoefficientDialogOpen(false)}
              disabled={model.isApplyingCoefficient}
            >
              Отмена
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => void model.resetCoefficient()}
                disabled={model.isApplyingCoefficient || model.coefPercent === 0}
              >
                Сбросить
              </Button>
              <Button
                variant="brand"
                onClick={() => void model.applyCoefficient()}
                disabled={model.isApplyingCoefficient}
              >
                {model.isApplyingCoefficient ? "Сохранение..." : "Применить"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={model.isSavePatternOpen} onOpenChange={model.setIsSavePatternOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Сохранить как шаблон</DialogTitle>
            <DialogDescription>
              Шаблон сохранится в разделе «Шаблоны» и будет доступен для быстрого
              применения в других сметах.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="pattern-name">Название</Label>
            <Input
              id="pattern-name"
              value={model.patternName}
              onChange={(event) => model.setPatternName(event.target.value)}
              placeholder="Например: Квартира 60м² — базовый ремонт"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pattern-description">Описание (опционально)</Label>
            <Input
              id="pattern-description"
              value={model.patternDescription}
              onChange={(event) => model.setPatternDescription(event.target.value)}
              placeholder="Краткое описание состава работ"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => model.setIsSavePatternOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="brand"
              onClick={() => void model.savePattern()}
              disabled={model.isPatternSaving}
            >
              {model.isPatternSaving ? "Сохранение..." : "Сохранить шаблон"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={model.isApplyPatternOpen} onOpenChange={model.setIsApplyPatternOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Применить шаблон</DialogTitle>
            <DialogDescription>
              Выберите сохраненный шаблон, просмотрите состав и примените его к
              текущей смете.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-[280px_1fr]">
            <div className="space-y-2 border rounded-md p-2 max-h-80 overflow-y-auto">
              {model.isPatternsLoading ? (
                <p className="text-sm text-muted-foreground">Загрузка шаблонов...</p>
              ) : null}
              {!model.isPatternsLoading && model.patterns.length === 0 ? (
                <p className="text-sm text-muted-foreground">Шаблоны еще не созданы.</p>
              ) : null}
              {model.patterns.map((pattern) => (
                <Button
                  key={pattern.id}
                  variant={model.selectedPatternId === pattern.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => void model.previewPattern(pattern.id)}
                >
                  <div className="text-left">
                    <div className="font-medium text-sm">{pattern.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {pattern.worksCount} работ / {pattern.materialsCount} материалов
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            <div className="border rounded-md p-3 max-h-80 overflow-y-auto">
              {model.previewRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Выберите шаблон слева, чтобы посмотреть превью.
                </p>
              ) : (
                <div className="space-y-1 text-sm">
                  {model.previewRows.map((row) => (
                    <div
                      key={row.tempKey}
                      className="flex items-center justify-between gap-3 py-1 border-b last:border-b-0"
                    >
                      <div
                        className={
                          row.kind === "material"
                            ? "pl-4 text-muted-foreground"
                            : "font-medium"
                        }
                      >
                        {row.code} {row.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {row.qty} {row.unit} × {row.price.toLocaleString("ru-RU")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => model.setIsApplyPatternOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="brand"
              onClick={() => void model.applyPattern()}
              disabled={model.isPatternApplying || !model.selectedPatternId}
            >
              {model.isPatternApplying ? "Применение..." : "Применить шаблон"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={onDeleteDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить смету</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите полностью удалить смету &quot;{estimateName}&quot;?
              Это действие необратимо и приведет к удалению всех строк и материалов.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onDeleteDialogChange(false)} disabled={isDeleting}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={() => void onDeleteConfirm()} disabled={isDeleting}>
              {isDeleting ? "Удаление..." : "Удалить смету"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
