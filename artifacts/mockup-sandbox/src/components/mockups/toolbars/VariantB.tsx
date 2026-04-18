import { Search, FileDown, FileUp, Trash2, Plus, SlidersHorizontal } from "lucide-react";

export function VariantB() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-8">
      <div className="w-full max-w-3xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Вариант B — Группировка по смыслу (левее = просмотр, правее = создание)
        </p>

        {/* Example 1: Смета */}
        <div className="bg-background border rounded-lg p-3 space-y-1">
          <p className="text-[10px] text-muted-foreground">Смета</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border rounded-md px-2 h-7 text-xs text-muted-foreground flex-1 max-w-[180px] bg-background">
              <Search className="h-3 w-3" />
              <span>Поиск...</span>
            </div>
            {/* Data ops group */}
            <div className="flex items-center gap-1 border rounded-md px-1.5 h-7">
              <button className="h-5 px-1.5 text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
                <FileUp className="h-3 w-3" />
                <span>Импорт</span>
              </button>
              <div className="w-px h-3.5 bg-border" />
              <button className="h-5 px-1.5 text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
                <FileDown className="h-3 w-3" />
                <span>Экспорт</span>
              </button>
              <div className="w-px h-3.5 bg-border" />
              <button className="h-5 px-1.5 text-xs text-destructive flex items-center gap-1 hover:text-destructive/80">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            <div className="flex-1" />
            {/* Create group */}
            <button className="h-7 px-3 text-xs rounded-md bg-[#FF6A3D] text-black font-medium flex items-center gap-1.5">
              <Plus className="h-3 w-3" />
              Раздел
            </button>
          </div>
        </div>

        {/* Example 2: Материалы */}
        <div className="bg-background border rounded-lg p-3 space-y-1">
          <p className="text-[10px] text-muted-foreground">Материалы</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border rounded-md px-2 h-7 text-xs text-muted-foreground flex-1 max-w-[180px] bg-background">
              <Search className="h-3 w-3" />
              <span>Поиск...</span>
            </div>
            <div className="flex items-center gap-1 border rounded-md px-1.5 h-7">
              <button className="h-5 px-1.5 text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
                <SlidersHorizontal className="h-3 w-3" />
                <span>Фильтры</span>
              </button>
              <div className="w-px h-3.5 bg-border" />
              <button className="h-5 px-1.5 text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
                <FileDown className="h-3 w-3" />
                <span>Экспорт</span>
              </button>
            </div>
            <div className="flex-1" />
            <button className="h-7 px-3 text-xs rounded-md bg-[#FF6A3D] text-black font-medium flex items-center gap-1.5">
              <Plus className="h-3 w-3" />
              Добавить
            </button>
          </div>
        </div>

        {/* Example 3: Закупки */}
        <div className="bg-background border rounded-lg p-3 space-y-1">
          <p className="text-[10px] text-muted-foreground">Закупки (одно действие — нет группы)</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border rounded-md px-2 h-7 text-xs text-muted-foreground flex-1 max-w-[180px] bg-background">
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

        <div className="pt-2 text-xs text-muted-foreground">
          ✓ Логика позиции: слева — что смотреть/фильтровать, справа — что создавать. Деструктивное скрыто в группе.
        </div>
      </div>
    </div>
  );
}
