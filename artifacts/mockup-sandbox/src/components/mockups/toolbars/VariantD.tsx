import { Search, FileDown, Plus, FolderTree, MoreHorizontal } from "lucide-react";

export function VariantD() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-8">
      <div className="w-full max-w-3xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Вариант D — Единое правило: 1 primary + «...» если нужно, для всех страниц
        </p>

        {/* Example 1: Смета */}
        <div className="bg-background border rounded-lg p-3 space-y-1">
          <p className="text-[10px] text-muted-foreground">Смета</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border rounded-md px-2 h-7 text-xs text-muted-foreground flex-1 max-w-[200px] bg-background">
              <Search className="h-3 w-3" />
              <span>Поиск...</span>
            </div>
            <div className="flex-1" />
            <button className="h-7 w-7 rounded-md border bg-background flex items-center justify-center text-muted-foreground hover:bg-muted">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            <button className="h-7 px-3 text-xs rounded-md bg-[#FF6A3D] text-black font-medium flex items-center gap-1.5">
              <FolderTree className="h-3 w-3" />
              Раздел
            </button>
          </div>
        </div>

        {/* Example 2: Материалы */}
        <div className="bg-background border rounded-lg p-3 space-y-1">
          <p className="text-[10px] text-muted-foreground">Материалы</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border rounded-md px-2 h-7 text-xs text-muted-foreground flex-1 max-w-[200px] bg-background">
              <Search className="h-3 w-3" />
              <span>Поиск...</span>
            </div>
            <div className="flex-1" />
            <button className="h-7 w-7 rounded-md border bg-background flex items-center justify-center text-muted-foreground hover:bg-muted">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            <button className="h-7 px-3 text-xs rounded-md bg-[#FF6A3D] text-black font-medium flex items-center gap-1.5">
              <Plus className="h-3 w-3" />
              Добавить
            </button>
          </div>
        </div>

        {/* Example 3: Закупки */}
        <div className="bg-background border rounded-lg p-3 space-y-1">
          <p className="text-[10px] text-muted-foreground">Закупки (одно действие — нет «...»)</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border rounded-md px-2 h-7 text-xs text-muted-foreground flex-1 max-w-[200px] bg-background">
              <Search className="h-3 w-3" />
              <span>Поиск...</span>
            </div>
            <div className="flex-1" />
            <button className="h-7 px-3 text-xs rounded-md border bg-background flex items-center gap-1.5">
              <FileDown className="h-3 w-3" />
              Экспорт Excel
            </button>
          </div>
        </div>

        {/* Example 4: Выполнение */}
        <div className="bg-background border rounded-lg p-3 space-y-1">
          <p className="text-[10px] text-muted-foreground">Выполнение (2 действия — нет «...»)</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border rounded-md px-2 h-7 text-xs text-muted-foreground flex-1 max-w-[200px] bg-background">
              <Search className="h-3 w-3" />
              <span>Поиск...</span>
            </div>
            <div className="flex-1" />
            <button className="h-7 px-3 text-xs rounded-md border bg-background flex items-center gap-1.5">
              <FileDown className="h-3 w-3" />
              Экспорт
            </button>
            <button className="h-7 px-3 text-xs rounded-md bg-[#FF6A3D] text-black font-medium flex items-center gap-1.5">
              <Plus className="h-3 w-3" />
              Доп. работа
            </button>
          </div>
        </div>

        <div className="pt-2 text-xs text-muted-foreground">
          ✓ Самый предсказуемый: поиск слева, максимум 2 кнопки справа. Одно правило для всех страниц.
        </div>
      </div>
    </div>
  );
}
