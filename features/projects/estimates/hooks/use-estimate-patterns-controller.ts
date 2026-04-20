"use client";

import { useEffect, useState } from "react";
import { useAppToast } from "@/components/providers/use-app-toast";
import {
  estimatePatternsActionRepo,
  EstimatePatternListItem,
  EstimatePatternPreviewRow,
} from "../repository/patterns.actions";

interface UseEstimatePatternsControllerParams {
  estimateId: string;
  reloadRows: () => Promise<void>;
}

export function useEstimatePatternsController({
  estimateId,
  reloadRows,
}: UseEstimatePatternsControllerParams) {
  const { toast } = useAppToast();

  const [isSavePatternOpen, setIsSavePatternOpen] = useState(false);
  const [isApplyPatternOpen, setIsApplyPatternOpen] = useState(false);
  const [patternName, setPatternName] = useState("");
  const [patternDescription, setPatternDescription] = useState("");
  const [isPatternSaving, setIsPatternSaving] = useState(false);
  const [isPatternApplying, setIsPatternApplying] = useState(false);
  const [isPatternsLoading, setIsPatternsLoading] = useState(false);
  const [patterns, setPatterns] = useState<EstimatePatternListItem[]>([]);
  const [previewRows, setPreviewRows] = useState<EstimatePatternPreviewRow[]>([]);
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);

  const fetchPatterns = async () => {
    try {
      setIsPatternsLoading(true);
      const nextPatterns = await estimatePatternsActionRepo.list();
      setPatterns(nextPatterns);
    } catch (patternsError) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          patternsError instanceof Error
            ? patternsError.message
            : "Не удалось загрузить шаблоны.",
      });
    } finally {
      setIsPatternsLoading(false);
    }
  };

  const previewPattern = async (patternId: string) => {
    try {
      setSelectedPatternId(patternId);
      const preview = await estimatePatternsActionRepo.preview(patternId);
      const sortedRows = [...preview.rows].sort((a, b) => a.order - b.order);
      setPreviewRows(sortedRows);
    } catch (previewError) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          previewError instanceof Error
            ? previewError.message
            : "Не удалось показать превью шаблона.",
      });
    }
  };

  useEffect(() => {
    void fetchPatterns();
  }, []);

  useEffect(() => {
    if (isApplyPatternOpen && patterns.length > 0 && !selectedPatternId) {
      void previewPattern(patterns[0].id);
    }
  }, [isApplyPatternOpen, patterns]);

  const savePattern = async () => {
    if (!patternName.trim()) {
      toast({
        variant: "destructive",
        title: "Укажите название",
        description: "Для сохранения шаблона нужно заполнить название.",
      });
      return;
    }

    try {
      setIsPatternSaving(true);
      await estimatePatternsActionRepo.create({
        estimateId,
        name: patternName,
        description: patternDescription || undefined,
      });
      await fetchPatterns();
      setIsSavePatternOpen(false);
      setPatternName("");
      setPatternDescription("");
      toast({ title: "Шаблон сохранен" });
    } catch (saveError) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          saveError instanceof Error
            ? saveError.message
            : "Не удалось сохранить шаблон.",
      });
    } finally {
      setIsPatternSaving(false);
    }
  };

  const applyPattern = async () => {
    if (!selectedPatternId) {
      toast({
        variant: "destructive",
        title: "Выберите шаблон",
        description: "Сначала выберите шаблон для применения.",
      });
      return;
    }

    try {
      setIsPatternApplying(true);
      await estimatePatternsActionRepo.apply({
        estimateId,
        patternId: selectedPatternId,
      });
      await reloadRows();
      setIsApplyPatternOpen(false);
      setSelectedPatternId(null);
      setPreviewRows([]);
      toast({ title: "Шаблон применен" });
    } catch (applyError) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          applyError instanceof Error
            ? applyError.message
            : "Не удалось применить шаблон.",
      });
    } finally {
      setIsPatternApplying(false);
    }
  };

  return {
    isSavePatternOpen,
    setIsSavePatternOpen,
    isApplyPatternOpen,
    setIsApplyPatternOpen,
    patternName,
    setPatternName,
    patternDescription,
    setPatternDescription,
    isPatternSaving,
    isPatternApplying,
    isPatternsLoading,
    patterns,
    previewRows,
    selectedPatternId,
    savePattern,
    previewPattern,
    applyPattern,
  };
}
