"use client";

import { cn } from "@/lib/utils";
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
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  primitiveCardHeaderPaddingClassName,
  primitiveSurfaceBorderClassNames,
  primitiveCardShellInsetDensityClassNames,
  primitiveCardShellBodyDensityClassNames,
  primitiveVisualTypographyClassNames,
} from "@/shared/ui/primitive-surface";

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
        {/* p-0 resets SheetContent default padding; header handles padding via primitiveCardHeaderPaddingClassName */}
        <SheetContent side="right">
          {/* border-b triggers parent-conditional padding in primitiveCardHeaderPaddingClassName */}
          <div className={cn("border-b", primitiveSurfaceBorderClassNames.hairline)}>
            <div className={cn(primitiveCardHeaderPaddingClassName, "pt-6")}>
              <SheetTitle className={primitiveVisualTypographyClassNames.dialogTitle}>
                {model.activeWorkForReplace ? "Замена работы" : "Справочник работ"}
              </SheetTitle>
              <SheetDescription className="flex flex-col gap-1">
                {model.activeWorkForReplace ? (
                  <>
                    <span>Выберите новую работу для замены текущей.</span>
                    <div className="text-primary font-medium">
                      Заменяемая позиция: {model.activeWorkForReplace.name}
                    </div>  {/* TODO(#visual-cleanup): font-medium — заменить на примитив из primitiveVisualTypographyClassNames */}
                  </>
                ) : (
                  <>
                    <span>
                      Выберите необходимые позиции для автоматического добавления в смету.
                    </span>
                    {model.pendingInsertAfterWork ? (
                      <div className="text-primary font-medium">
                        Режим вставки: ниже работы «{model.pendingInsertAfterWork.name}»
                      </div>
                    ) : null}  {/* TODO(#visual-cleanup): font-medium — заменить на примитив из primitiveVisualTypographyClassNames */}
                  </>
                )}
              </SheetDescription>
            </div>
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="section-code">№ раздела</Label>
            <Input
              id="section-code"
              size="default"
              value={model.sectionCodeInput}
              onChange={(event) => model.setSectionCodeInput(event.target.value)}
              placeholder="Например: 1.1"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="section-name">Название раздела</Label>
            <Input
              id="section-name"
              size="default"
              value={model.sectionNameInput}
              onChange={(event) => model.setSectionNameInput(event.target.value)}
              placeholder="Например: Демонтажные работы"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="default" onClick={() => model.setIsSectionDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="brand" size="default" onClick={() => void model.createSection()}>
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="estimate-coef">Коэффициент, %</Label>
            <Input
              id="estimate-coef"
              size="default"
              value={model.coefInputValue}
              onChange={(event) => model.setCoefInputValue(event.target.value)}
              placeholder="Например: 20"
            />
            <p className={primitiveVisualTypographyClassNames.mutedMeta}>
              Допустимый диапазон: от {ESTIMATE_COEF_MIN}% до {ESTIMATE_COEF_MAX}%.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="default"
              onClick={() => model.setIsCoefficientDialogOpen(false)}
              disabled={model.isApplyingCoefficient}
            >
              Отмена
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="default"
                onClick={() => void model.resetCoefficient()}
                disabled={model.isApplyingCoefficient || model.coefPercent === 0}
              >
                Сбросить
              </Button>
              <Button
                variant="brand"
                size="default"
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="pattern-name">Название</Label>
            <Input
              id="pattern-name"
              size="default"
              value={model.patternName}
              onChange={(event) => model.setPatternName(event.target.value)}
              placeholder="Например: Квартира 60м² — базовый ремонт"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="pattern-description">Описание (опционально)</Label>
            <Input
              id="pattern-description"
              size="default"
              value={model.patternDescription}
              onChange={(event) => model.setPatternDescription(event.target.value)}
              placeholder="Краткое описание состава работ"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="default" onClick={() => model.setIsSavePatternOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="brand"
              size="default"
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
          <div className="grid gap-4 md:grid-cols-[theme(spacing.72)_1fr]">
            <ScrollArea className={cn("flex flex-col gap-2", primitiveSurfaceBorderClassNames.thin, primitiveCardShellInsetDensityClassNames.compact)}>
              {model.isPatternsLoading ? (
                <p className={primitiveVisualTypographyClassNames.mutedMeta}>Загрузка шаблонов...</p>
              ) : null}
              {!model.isPatternsLoading && model.patterns.length === 0 ? (
                <p className={primitiveVisualTypographyClassNames.mutedMeta}>Шаблоны еще не созданы.</p>
              ) : null}
              {model.patterns.map((pattern) => (
                <Button
                  key={pattern.id}
                  variant={model.selectedPatternId === pattern.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => void model.previewPattern(pattern.id)}
                >
                  <div className="text-left">  {/* TODO(#visual-cleanup): text-left is layout align */}
                    <div className={primitiveVisualTypographyClassNames.sectionTitle}>{pattern.name}</div>
                    <div className={primitiveVisualTypographyClassNames.mutedMeta}>
                      {pattern.worksCount} работ / {pattern.materialsCount} материалов
                    </div>
                  </div>
                </Button>
              ))}
            </ScrollArea>
            <ScrollArea className={cn(primitiveSurfaceBorderClassNames.thin, primitiveCardShellBodyDensityClassNames.compact)}>
              {model.previewRows.length === 0 ? (
                <p className={primitiveVisualTypographyClassNames.mutedMeta}>
                  Выберите шаблон слева, чтобы посмотреть превью.
                </p>
              ) : (
                <ul className="divide-y divide-border *:py-1">
                  {model.previewRows.map((row) => (
                    <li
                      key={row.tempKey}
                      className="flex items-center justify-between gap-3"
                    >
                      <div
                        className={
                          row.kind === "material"
                            ? "pl-4 text-muted-foreground"  /* TODO(#visual-cleanup): pl-4 — заменить на semantic padding primitive */
                            : "font-medium"  /* TODO(#visual-cleanup): font-medium — заменить на примитив из primitiveVisualTypographyClassNames */
                        }
                      >
                        {row.code} {row.name}
                      </div>
                      <div className={primitiveVisualTypographyClassNames.mutedMeta}>
                        {row.qty} {row.unit} × {row.price.toLocaleString("ru-RU")}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" size="default" onClick={() => model.setIsApplyPatternOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="brand"
              size="default"
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
            <Button variant="outline" size="default" onClick={() => onDeleteDialogChange(false)} disabled={isDeleting}>
              Отмена
            </Button>
            <Button variant="destructive" size="default" onClick={() => void onDeleteConfirm()} disabled={isDeleting}>
              {isDeleting ? "Удаление..." : "Удалить смету"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
