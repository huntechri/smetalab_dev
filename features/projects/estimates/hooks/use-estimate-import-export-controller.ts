"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";
import { useAppToast } from "@/components/providers/use-app-toast";

const DIRECT_IMPORT_FILE_SIZE_BYTES = 4 * 1024 * 1024;
const MAX_IMPORT_FILE_SIZE_BYTES = 25 * 1024 * 1024;

interface UseEstimateImportExportControllerParams {
  estimateId: string;
  reloadRows: () => Promise<void>;
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

export function useEstimateImportExportController({
  estimateId,
  reloadRows,
}: UseEstimateImportExportControllerParams) {
  const { toast } = useAppToast();

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const importEstimate = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept =
      ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    fileInput.onchange = async () => {
      const file = fileInput.files?.[0];

      if (!file) {
        return;
      }

      if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
        toast({
          variant: "destructive",
          title: "Файл слишком большой",
          description: `Размер файла ${formatFileSize(file.size)}. Максимальный размер импорта — ${formatFileSize(MAX_IMPORT_FILE_SIZE_BYTES)}.`,
        });
        return;
      }

      try {
        setIsImporting(true);
        let response: Response;

        if (file.size <= DIRECT_IMPORT_FILE_SIZE_BYTES) {
          const formData = new FormData();
          formData.append("file", file);

          response = await fetch(`/api/estimates/${estimateId}/import`, {
            method: "POST",
            body: formData,
          });
        } else {
          const blob = await upload(`estimate-imports/${estimateId}/${file.name}`, file, {
            access: "private",
            handleUploadUrl: `/api/estimates/${estimateId}/import/upload`,
          });

          response = await fetch(`/api/estimates/${estimateId}/import`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ pathname: blob.pathname }),
          });
        }

        if (!response.ok) {
          let message = "Не удалось импортировать смету.";
          try {
            const payload = (await response.json()) as { message?: string };
            if (payload?.message) {
              message = payload.message;
            }
          } catch {
            void 0;
          }

          throw new Error(message);
        }

        await reloadRows();
        toast({
          title: "Импорт завершен",
          description: "Смета успешно обновлена из файла.",
        });
      } catch (importError) {
        toast({
          variant: "destructive",
          title: "Ошибка импорта",
          description:
            importError instanceof Error
              ? importError.message
              : "Не удалось импортировать смету.",
        });
      } finally {
        setIsImporting(false);
      }
    };

    fileInput.click();
  };

  const exportEstimate = async (format: "xlsx" | "pdf") => {
    try {
      setIsExporting(true);
      const response = await fetch(
        `/api/estimates/${estimateId}/export?format=${format}`,
      );

      if (!response.ok) {
        let message = "Не удалось выгрузить смету.";
        try {
          const payload = (await response.json()) as { message?: string };
          if (payload?.message) {
            message = payload.message;
          }
        } catch {
          void 0;
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition");
      const fallbackName = `estimate.${format}`;
      const fileNameMatch = disposition?.match(/filename="?([^"]+)"?/i);
      const fileName = fileNameMatch?.[1] ?? fallbackName;
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);

      toast({
        title: "Экспорт завершен",
        description:
          format === "xlsx"
            ? "Excel-файл успешно сформирован."
            : "PDF-файл успешно сформирован.",
      });
    } catch (exportError) {
      toast({
        variant: "destructive",
        title: "Ошибка экспорта",
        description:
          exportError instanceof Error
            ? exportError.message
            : "Не удалось выгрузить смету.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    isImporting,
    importEstimate,
    exportEstimate,
  };
}
