import { Search, MoreHorizontal, Plus, FileDown, FileUp, Trash2 } from "lucide-react";

export function VariantA() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-8">
      <div className="w-full max-w-3xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Вариант A — Primary + «...» для всего лишнего
        </p>

        {/* Example 1: Смета — много действий */}
        <div className="bg-background border rounded-lg p-3 space-y-1">
          <p className="text-[10px] text-muted-foreground">Смета (много действий)</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border rounded-md px-2 h-7 text-xs text-muted-foreground flex-1 max-w-[200px] bg-background">
              <Search className="h-3 w-3" />
              <span>Поиск...</span>
            </div>
            <div className="flex-1" />
            <button className="h-7 px-3 text-xs rounded-md border bg-background text-foreground flex items-center gap-1.5 hover:bg-muted">
              <MoreHorizontal className="h-3 w-3" />
              <span>Ещё</span>
            </button>
            <button className="h-7 px-3 text-xs rounded-md bg-[#FF6A3D] text-black font-medium flex items-center gap-1.5">
              <Plus className="h-3 w-3" />
              Раздел
            </button>
          </div>
        </div>

        {/* Example 2: Закупки — одно действие */}
        <div className="bg-background border rounded-lg p-3 space-y-1">
          <p className="text-[10px] text-muted-foreground">Закупки (одно действие)</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border rounded-md px-2 h-7 text-xs text-muted-foreground flex-1 max-w-[200px] bg-background">
              <Search className="h-3 w-3" />
              <span>Поиск...</span>
            </div>
            <div className="flex-1" />
            <button className="h-7 px-3 text-xs rounded-md border bg-background text-foreground flex items-center gap-1.5 hover:bg-muted">
              <FileDown className="h-3 w-3" />
              Экспорт Excel
            </button>
          </div>
        </div>

        {/* Example 3: Материалы — 2 действия */}
        <div className="bg-background border rounded-lg p-3 space-y-1">
          <p className="text-[10px] text-muted-foreground">Материалы (2 действия)</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border rounded-md px-2 h-7 text-xs text-muted-foreground flex-1 max-w-[200px] bg-background">
              <Search className="h-3 w-3" />
              <span>Поиск...</span>
            </div>
            <div className="flex-1" />
            <button className="h-7 px-3 text-xs rounded-md border bg-background text-foreground flex items-center gap-1.5 hover:bg-muted">
              <MoreHorizontal className="h-3 w-3" />
              <span>Ещё</span>
            </button>
            <button className="h-7 px-3 text-xs rounded-md bg-[#FF6A3D] text-black font-medium flex items-center gap-1.5">
              <Plus className="h-3 w-3" />
              Добавить
            </button>
          </div>
        </div>

        <div className="pt-2 text-xs text-muted-foreground">
          ✓ Всегда максимум 2 кнопки справа. Глаз знает куда смотреть.
        </div>
      </div>
    </div>
  );
}
