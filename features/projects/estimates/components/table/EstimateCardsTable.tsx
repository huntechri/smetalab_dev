"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FolderTree,
  FolderUp,
  Pencil,
  RefreshCw,
  Settings,
  Trash2,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import { ActionMenu, type ActionMenuItem } from "@/shared/ui/action-menu";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { MoneyCell } from "@/shared/ui/cells/money-cell";
import { Input } from "@/shared/ui/input";
import type { SectionTotals } from "../../lib/section-totals";
import type { EstimateRow } from "../../types/dto";

interface EstimateCardsTableProps {
  rows: EstimateRow[];
  expandedWorkIds: Set<string>;
  sectionTotalsById: Map<string, SectionTotals>;
  searchValue: string;
  onToggleExpand: (workId: string) => void;
  onPatch: (
    rowId: string,
    field: "name" | "qty" | "price" | "expense",
    rawValue: string,
  ) => Promise<void>;
  onOpenMaterialCatalog: (workId: string, workName: string) => void;
  onInsertWorkAfter: (workId: string, workName: string) => void;
  onRequestCreateSection: (insertAfterRowId?: string) => void;
  onRequestCreateSectionBefore: (insertBeforeRowId: string) => void;
  onReplaceMaterial: (materialId: string, materialName: string) => void;
  onReplaceWork: (workId: string, workName: string) => void;
  onRemoveRow: (rowId: string) => Promise<void>;
}

type WorkNode = {
  work: EstimateRow;
  materials: EstimateRow[];
};

type SectionNode = {
  section: EstimateRow;
  works: WorkNode[];
};

interface InlineNumberCellProps {
  value: number;
  ariaLabel: string;
  className: string;
  onCommit: (value: string) => Promise<void>;
}

interface InlineTextCellProps {
  value: string;
  ariaLabel: string;
  title?: string;
  className: string;
  onCommit: (value: string) => Promise<void>;
}

const DEFAULT_SECTION_ID = "__estimate-default-section__";

const DEFAULT_SECTION_ROW: EstimateRow = {
  id: DEFAULT_SECTION_ID,
  kind: "section",
  code: "Без раздела",
  name: "Общие работы",
  unit: "",
  qty: 0,
  price: 0,
  sum: 0,
  expense: 0,
  order: -1,
};

const INTEGER_FORMATTER = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0,
});

const INLINE_NUMBER_BASE_CLASS =
  "h-4 min-w-0 flex-none rounded-sm border-0 bg-transparent px-1 py-0 text-right font-semibold leading-none text-slate-800 !border-0 !shadow-none outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0";
const WORK_NUMBER_CLASS = `${INLINE_NUMBER_BASE_CLASS} w-10 text-[11px] sm:w-14 sm:text-[10px]`;
const MATERIAL_QTY_CLASS = `${INLINE_NUMBER_BASE_CLASS} w-8 text-[10px] sm:w-10 sm:text-[10px]`;
const MATERIAL_EXPENSE_CLASS = `${INLINE_NUMBER_BASE_CLASS} w-8 text-[10px] sm:w-9 sm:text-[10px]`;
const INLINE_TEXT_BASE_CLASS =
  "min-w-0 rounded-sm border-0 bg-transparent !border-0 !shadow-none outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0";
const WORK_NAME_CLASS = `${INLINE_TEXT_BASE_CLASS} min-h-9 max-w-[48rem] flex-1 !whitespace-normal !justify-start break-words px-1 text-left text-[10px] font-semibold leading-tight text-slate-800 sm:min-h-10 sm:min-w-[8rem] sm:text-[11px] xl:min-w-[18rem]`;
const MATERIAL_NAME_CLASS = `${INLINE_TEXT_BASE_CLASS} min-h-9 w-full !whitespace-normal !justify-start break-words px-0 text-left text-[10px] font-semibold leading-tight text-slate-800 sm:min-h-10 sm:text-[11px]`;

function formatSectionCode(code: string) {
  const normalized = code.trim();
  if (!normalized) {
    return "РАЗДЕЛ";
  }

  if (/^раздел\b/i.test(normalized)) {
    return normalized.toUpperCase();
  }

  return `РАЗДЕЛ ${normalized}`;
}

function formatWorkCode(code: string) {
  const normalized = code.trim();
  if (!normalized) {
    return "РАБОТА";
  }

  if (/^работа\b/i.test(normalized)) {
    return normalized.toUpperCase();
  }

  return `РАБОТА · ${normalized}`;
}

function InlineNumberCell({
  value,
  ariaLabel,
  className,
  onCommit,
}: InlineNumberCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const wasClearedOnFocus = useRef(false);

  const cancel = () => {
    setDraft(String(value));
    setEditing(false);
  };

  const submit = async () => {
    if (draft === "") {
      cancel();
      return;
    }

    await onCommit(draft);
    setEditing(false);
  };

  if (!editing) {
    return (
      <Button
        variant="ghost"
        aria-label={ariaLabel}
        className={className}
        onClick={() => {
          wasClearedOnFocus.current = false;
          setDraft(String(value));
          setEditing(true);
        }}
      >
        {String(value)}
      </Button>
    );
  }

  return (
    <Input
      aria-label={ariaLabel}
      autoFocus
      numeric
      type="number"
      size="xs"
      textAlign="right"
      value={draft}
      className={className}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={() => {
        if (wasClearedOnFocus.current) {
          return;
        }

        wasClearedOnFocus.current = true;
        setDraft("");
      }}
      onBlur={() => void submit()}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          void submit();
        }
        if (event.key === "Escape") {
          cancel();
        }
      }}
    />
  );
}

function InlineTextCell({
  value,
  ariaLabel,
  title,
  className,
  onCommit,
}: InlineTextCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const submit = async () => {
    if (draft.trim() === "") {
      cancel();
      return;
    }

    await onCommit(draft);
    setEditing(false);
  };

  if (!editing) {
    return (
      <Button
        variant="ghost"
        aria-label={ariaLabel}
        title={title}
        className={className}
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
      >
        {value}
      </Button>
    );
  }

  return (
    <Input
      aria-label={ariaLabel}
      autoFocus
      size="xs"
      value={draft}
      className={className}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => void submit()}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          void submit();
        }
        if (event.key === "Escape") {
          cancel();
        }
      }}
    />
  );
}

function buildSectionNodes(rows: EstimateRow[]): SectionNode[] {
  const sortedRows = rows.slice().sort((a, b) => a.order - b.order);
  const sections: SectionNode[] = [];
  const workById = new Map<string, WorkNode>();
  let currentSection: SectionNode | null = null;

  for (const row of sortedRows) {
    if (row.kind === "section") {
      currentSection = { section: row, works: [] };
      sections.push(currentSection);
      continue;
    }

    if (row.kind === "work") {
      if (!currentSection) {
        currentSection = {
          section: { ...DEFAULT_SECTION_ROW },
          works: [],
        };
        sections.push(currentSection);
      }

      const workNode: WorkNode = { work: row, materials: [] };
      currentSection.works.push(workNode);
      workById.set(row.id, workNode);
    }
  }

  for (const row of sortedRows) {
    if (row.kind !== "material" || !row.parentWorkId) {
      continue;
    }

    const parentWork = workById.get(row.parentWorkId);
    if (parentWork) {
      parentWork.materials.push(row);
    }
  }

  return sections;
}

function matchesQuery(row: EstimateRow, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return (
    row.name.toLowerCase().includes(normalizedQuery) ||
    row.code.toLowerCase().includes(normalizedQuery) ||
    row.unit.toLowerCase().includes(normalizedQuery)
  );
}

function buildSectionActions(
  section: EstimateRow,
  props: Pick<
    EstimateCardsTableProps,
    "onRequestCreateSection" | "onRequestCreateSectionBefore" | "onRemoveRow"
  >,
): ActionMenuItem[] {
  if (section.id === DEFAULT_SECTION_ID) {
    return [];
  }

  return [
    {
      label: "Добавить раздел выше",
      icon: <FolderUp className="size-4" />,
      onClick: () => props.onRequestCreateSectionBefore(section.id),
    },
    {
      label: "Добавить раздел ниже",
      icon: <FolderTree className="size-4" />,
      onClick: () => props.onRequestCreateSection(section.id),
    },
    {
      label: "Удалить раздел",
      icon: <Trash2 className="size-4" />,
      variant: "destructive",
      onClick: () => void props.onRemoveRow(section.id),
    },
  ];
}

function buildWorkActions(
  work: EstimateRow,
  props: Pick<
    EstimateCardsTableProps,
    | "onRequestCreateSection"
    | "onRequestCreateSectionBefore"
    | "onReplaceWork"
    | "onRemoveRow"
  >,
): ActionMenuItem[] {
  return [
    {
      label: "Добавить раздел выше",
      icon: <FolderUp className="size-4" />,
      onClick: () => props.onRequestCreateSectionBefore(work.id),
    },
    {
      label: "Добавить раздел ниже",
      icon: <FolderTree className="size-4" />,
      onClick: () => props.onRequestCreateSection(work.id),
    },
    {
      label: "Изменить / заменить",
      icon: <RefreshCw className="size-4" />,
      onClick: () => props.onReplaceWork(work.id, work.name),
    },
    {
      label: "Удалить",
      icon: <Trash2 className="size-4" />,
      variant: "destructive",
      onClick: () => void props.onRemoveRow(work.id),
    },
  ];
}

function buildMaterialActions(
  material: EstimateRow,
  props: Pick<EstimateCardsTableProps, "onReplaceMaterial" | "onRemoveRow">,
): ActionMenuItem[] {
  return [
    {
      label: "Изменить / заменить",
      icon: <RefreshCw className="size-4" />,
      onClick: () => props.onReplaceMaterial(material.id, material.name),
    },
    {
      label: "Удалить",
      icon: <Trash2 className="size-4" />,
      variant: "destructive",
      onClick: () => void props.onRemoveRow(material.id),
    },
  ];
}

export function EstimateCardsTable(props: EstimateCardsTableProps) {
  const sectionNodes = useMemo(() => buildSectionNodes(props.rows), [props.rows]);
  const knownSectionIdsRef = useRef<Set<string>>(
    new Set(sectionNodes.map((node) => node.section.id)),
  );
  const [expandedSectionIds, setExpandedSectionIds] = useState<Set<string>>(
    () => new Set(sectionNodes.map((node) => node.section.id)),
  );

  useEffect(() => {
    const sectionIds = new Set(sectionNodes.map((node) => node.section.id));
    const knownSectionIds = knownSectionIdsRef.current;

    setExpandedSectionIds((previous) => {
      const next = new Set<string>();

      for (const sectionId of sectionIds) {
        if (previous.has(sectionId) || !knownSectionIds.has(sectionId)) {
          next.add(sectionId);
        }
      }

      if (
        next.size === previous.size &&
        [...next].every((sectionId) => previous.has(sectionId))
      ) {
        return previous;
      }

      return next;
    });

    knownSectionIdsRef.current = sectionIds;
  }, [sectionNodes]);

  const filteredSections = useMemo(() => {
    const query = props.searchValue.trim();
    if (!query) {
      return sectionNodes;
    }

    return sectionNodes
      .map((sectionNode) => {
        const sectionMatches = matchesQuery(sectionNode.section, query);

        const works = sectionNode.works
          .map((workNode) => {
            const workMatches = matchesQuery(workNode.work, query);
            const matchingMaterials = workNode.materials.filter((material) =>
              matchesQuery(material, query),
            );

            if (sectionMatches || workMatches) {
              return workNode;
            }

            if (matchingMaterials.length > 0) {
              return {
                ...workNode,
                materials: matchingMaterials,
              };
            }

            return null;
          })
          .filter((workNode): workNode is WorkNode => Boolean(workNode));

        if (sectionMatches || works.length > 0) {
          return {
            section: sectionNode.section,
            works,
          };
        }

        return null;
      })
      .filter((sectionNode): sectionNode is SectionNode => Boolean(sectionNode));
  }, [props.searchValue, sectionNodes]);

  if (filteredSections.length === 0) {
    return (
      <div className="flex min-h-52 items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        По вашему запросу ничего не найдено.
      </div>
    );
  }

  const forceExpandForSearch = props.searchValue.trim().length > 0;

  return (
    <div className="max-h-[var(--table-height)] overflow-y-auto bg-slate-100 px-1.5 pb-20 pt-1.5 sm:px-4 sm:pt-2">
      <div className="space-y-2">
        {filteredSections.map((sectionNode) => {
          const section = sectionNode.section;
          const sectionTotals = props.sectionTotalsById.get(section.id) ?? {
            works: 0,
            materials: 0,
            total: 0,
          };
          const isSectionOpen =
            forceExpandForSearch || expandedSectionIds.has(section.id);
          const isSyntheticSection = section.id === DEFAULT_SECTION_ID;
          const sectionActions = buildSectionActions(section, props);

          return (
            <div
              key={section.id}
              className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm"
            >
              <div className="border-b border-slate-200 bg-white">
                <div className="flex min-w-0 items-center gap-1.5 px-2 py-2.5 sm:gap-2 sm:px-3.5 sm:py-3">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="mt-0.5 size-5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:size-6"
                    aria-label={
                      isSectionOpen ? "Свернуть раздел" : "Развернуть раздел"
                    }
                    onClick={() =>
                      setExpandedSectionIds((previous) => {
                        const next = new Set(previous);
                        if (next.has(section.id)) {
                          next.delete(section.id);
                        } else {
                          next.add(section.id);
                        }
                        return next;
                      })
                    }
                  >
                    {isSectionOpen ? (
                      <ChevronDown className="size-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="size-4 text-slate-500" />
                    )}
                  </Button>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <Badge
                        variant="outline"
                        size="xs"
                        className="h-4 shrink-0 border-slate-200 bg-slate-100 px-1.5 py-0 text-[9px] leading-none text-slate-600 tracking-[0.08em] sm:h-5 sm:px-2 sm:text-[10px]"
                      >{section.code}</Badge>
                      <p
                        className="min-w-0 truncate text-[10px] font-semibold leading-snug text-slate-800 sm:text-[11px]"
                        title={section.name}
                      >
                        {section.name}
                      </p>
                    </div>
                  </div>

                  <div className="ml-auto flex items-center gap-3 sm:gap-6">
                    <div className="text-right min-w-[60px] sm:min-w-[80px]">
                      <p className="text-[10px] font-medium text-slate-400 sm:text-[11px]">Работы</p>
                      <p className="text-[12px] font-bold tabular-nums text-slate-800 sm:text-sm">
                        <MoneyCell value={sectionTotals.works} />
                      </p>
                    </div>
                    <div className="text-right min-w-[60px] sm:min-w-[80px]">
                      <p className="text-[10px] font-medium text-slate-400 sm:text-[11px]">Материалы</p>
                      <p className="text-[12px] font-bold tabular-nums text-green-600 sm:text-sm">
                        <MoneyCell value={sectionTotals.materials} />
                      </p>
                    </div>
                  </div>

                  {sectionActions.length > 0 ? (
                    <ActionMenu
                      ariaLabel="Действия с разделом"
                      trigger={
                        <Button
                          size="icon-xs"
                          variant="outline"
                          className="size-6 rounded-lg border-slate-200 bg-white text-slate-500 hover:bg-slate-50 sm:size-7"
                          aria-label="Действия с разделом"
                        >
                          <Settings className="size-3.5" />
                        </Button>
                      }
                      items={sectionActions}
                    />
                  ) : null}
                </div>
              </div>

              {isSectionOpen ? (
                <div className="divide-y divide-slate-200">
                  {sectionNode.works.map((workNode) => {
                    const work = workNode.work;
                    const isWorkOpen =
                      forceExpandForSearch || props.expandedWorkIds.has(work.id);

                    return (
                      <div key={work.id} className="bg-white">
                        <div className="flex items-start gap-1.5 px-2 py-2.5 sm:gap-2 sm:px-3.5 sm:py-3">
                          <Button
                            variant="outline"
                            size="icon-xs"
                            className="mt-0.5 size-5 rounded-lg border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 sm:size-6"
                            aria-label={
                              isWorkOpen ? "Свернуть работу" : "Развернуть работу"
                            }
                            onClick={() => props.onToggleExpand(work.id)}
                          >
                            {isWorkOpen ? (
                              <ChevronDown className="size-4 text-slate-500" />
                            ) : (
                              <ChevronRight className="size-4 text-slate-500" />
                            )}
                          </Button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 sm:gap-1.5 xl:flex-row xl:items-baseline xl:gap-2">
                              <div className="flex items-baseline gap-1.5 min-w-0">
                                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:text-[10px]">
                                  {work.code}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <InlineTextCell
                                    value={work.name}
                                    onCommit={(value) => props.onPatch(work.id, "name", value)}
                                    ariaLabel={`Наименование: ${work.name}`}
                                    title={work.name}
                                    className={WORK_NAME_CLASS}
                                  />
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                                <Badge
                                  variant="outline"
                                  className="h-4 border-slate-200 bg-white px-2 py-0 text-[10px] leading-none text-slate-700 sm:h-5 sm:px-2.5 sm:text-[10px]"
                                >
                                  {work.unit}
                                </Badge>
                                <div className="inline-flex h-4 items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-1.5 py-0 text-[10px] text-slate-600 sm:h-5 sm:px-2 sm:text-[10px]">
                                  <span>Кол-во</span>
                                  <InlineNumberCell
                                    value={work.qty}
                                    onCommit={(value) => props.onPatch(work.id, "qty", value)}
                                    ariaLabel={`Количество: ${work.name}`}
                                    className={WORK_NUMBER_CLASS}
                                  />
                                </div>
                                <div className="inline-flex h-4 items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-1.5 py-0 text-[10px] text-slate-600 sm:h-5 sm:px-2 sm:text-[10px]">
                                  <span>Цена</span>
                                  <InlineNumberCell
                                    value={work.price}
                                    onCommit={(value) => props.onPatch(work.id, "price", value)}
                                    ariaLabel={`Цена: ${work.name}`}
                                    className={WORK_NUMBER_CLASS}
                                  />
                                  <span>₽</span>
                                </div>
                                <Badge
                                  variant="success"
                                  className="h-4 border border-green-200 bg-green-100 px-2 py-0 text-[11px] font-bold leading-none text-green-600 sm:h-5 sm:px-2.5 sm:text-[10px]"
                                >
                                  <MoneyCell value={work.sum} />
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                            <Button
                              size="icon-xs"
                              variant="outline"
                              className="size-6 rounded-lg border-slate-200 bg-white text-slate-500 hover:bg-slate-50 sm:size-7"
                              onClick={() => props.onOpenMaterialCatalog(work.id, work.name)}
                              title="Добавить материал"
                              aria-label="Добавить материал"
                            >
                              <Pencil className="size-3 sm:size-3.5" />
                            </Button>
                            <Button
                              size="icon-xs"
                              variant="outline"
                              className="size-6 rounded-lg border-slate-200 bg-white text-slate-500 hover:bg-slate-50 sm:size-7"
                              onClick={() => props.onInsertWorkAfter(work.id, work.name)}
                              title="Добавить работу ниже"
                              aria-label="Добавить работу ниже"
                            >
                              <Wrench className="size-3 sm:size-3.5" />
                            </Button>
                            <ActionMenu
                              ariaLabel="Действия с работой"
                              trigger={
                                <Button
                                  size="icon-xs"
                                  variant="outline"
                                  className="size-6 rounded-lg border-slate-200 bg-white text-slate-500 hover:bg-slate-50 sm:size-7"
                                  aria-label="Действия с работой"
                                >
                                  <Settings className="size-3 sm:size-3.5" />
                                </Button>
                              }
                              items={buildWorkActions(work, props)}
                            />
                          </div>
                        </div>

                        {isWorkOpen ? (
                          <div className="border-t border-slate-100 bg-slate-50 px-2 py-2.5 sm:px-3.5 sm:py-3">
                            {workNode.materials.length > 0 ? (
                              <>
                                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 sm:mb-2 sm:text-[11px]">
                                  Материалы
                                </p>

                                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                                  {workNode.materials.map((material) => (
                                    <div
                                      key={material.id}
                                      className="rounded-lg border border-slate-200 bg-white p-1 sm:p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                                    >
                                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-1.5 sm:gap-2">
                                        <div className="min-w-0 overflow-hidden">
                                          <div className="flex min-w-0 items-start gap-1.5">
                                            <span className="mt-1 shrink-0 text-[10px] font-semibold text-slate-500 sm:text-[11px]">
                                              {material.code}
                                            </span>
                                            <InlineTextCell
                                              value={material.name}
                                              onCommit={(value) =>
                                                props.onPatch(material.id, "name", value)
                                              }
                                              ariaLabel={`Наименование: ${material.name}`}
                                              title={material.name}
                                              className={MATERIAL_NAME_CLASS}
                                            />
                                          </div>

                                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500 sm:mt-0.5 sm:text-[10px]">
                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 sm:h-7 sm:w-7">
                                              {material.imageUrl ? (
                                                <Image
                                                  src={material.imageUrl}
                                                  alt={material.name}
                                                  width={28}
                                                  height={28}
                                                  className="h-full w-full object-cover"
                                                  unoptimized
                                                />
                                              ) : (
                                                <span className="text-[11px] font-medium text-slate-400 sm:text-[12px]">
                                                  —
                                                </span>
                                              )}
                                            </div>
                                            <Badge
                                              variant="outline"
                                              className="h-3.5 border-slate-200 bg-white px-1.5 py-0 text-[9px] leading-none text-slate-600 sm:h-4 sm:text-[10px]"
                                            >
                                              {material.unit}
                                            </Badge>
                                            <div className="inline-flex h-4 items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-1.5 py-0 text-[10px] text-slate-600 sm:h-5 sm:px-2 sm:text-[10px]">
                                              <span>Кол-во</span>
                                              <InlineNumberCell
                                                value={material.qty}
                                                onCommit={(value) =>
                                                  props.onPatch(material.id, "qty", value)
                                                }
                                                ariaLabel={`Количество: ${material.name}`}
                                                className={MATERIAL_QTY_CLASS}
                                              />
                                            </div>
                                            <span className="tabular-nums">
                                              {INTEGER_FORMATTER.format(material.price)} руб/ед
                                            </span>
                                            <Badge
                                              variant="success"
                                              className="h-4 border border-green-200 bg-green-100 px-2 py-0 text-[11px] font-bold leading-none text-green-600 sm:h-5 sm:px-2.5 sm:text-[10px]"
                                            >
                                              <MoneyCell value={material.sum} />
                                            </Badge>
                                            <div className="inline-flex h-4 items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0 text-[10px] text-blue-600 sm:h-5 sm:px-2 sm:text-[10px]">
                                              <span>Расход</span>
                                              <InlineNumberCell
                                                value={material.expense}
                                                onCommit={(value) =>
                                                  props.onPatch(material.id, "expense", value)
                                                }
                                                ariaLabel={`Расход: ${material.name}`}
                                                className={MATERIAL_EXPENSE_CLASS}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex shrink-0 items-start pt-0.5">
                                          <ActionMenu
                                            ariaLabel="Действия с материалом"
                                            trigger={
                                              <Button
                                                size="icon-xs"
                                                variant="outline"
                                                className="size-6 rounded-lg border-slate-200 bg-white text-slate-500 hover:bg-slate-50 sm:size-7"
                                                aria-label="Действия с материалом"
                                              >
                                                <Settings className="size-3 sm:size-3.5" />
                                              </Button>
                                            }
                                            items={buildMaterialActions(material, props)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <div className="rounded-md border border-dashed border-slate-200 bg-white p-3 text-center text-xs text-slate-500">
                                У работы пока нет материалов.
                              </div>
                            )}

                            <div className="mt-3 grid grid-cols-3 gap-1.5 sm:mt-4 sm:max-w-[400px] sm:gap-2">
                              <Button
                                variant="outline"
                                size="xs"
                                className="sm:h-8 sm:px-3 sm:text-xs"
                                onClick={() => props.onOpenMaterialCatalog(work.id, work.name)}
                              >
                                + Материал
                              </Button>
                              <Button
                                variant="outline"
                                size="xs"
                                className="sm:h-8 sm:px-3 sm:text-xs"
                                onClick={() => props.onInsertWorkAfter(work.id, work.name)}
                              >
                                + Работа
                              </Button>
                              <Button
                                variant="destructive"
                                size="xs"
                                className="sm:h-8 sm:px-3 sm:text-xs"
                                onClick={() => void props.onRemoveRow(work.id)}
                              >
                                Удалить
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
