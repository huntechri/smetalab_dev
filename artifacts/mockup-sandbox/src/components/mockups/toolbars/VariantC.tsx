import { Search, FileDown, FileUp, Trash2, Plus, Save, FolderTree, Calculator, Percent } from "lucide-react";

export function VariantC() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-8">
      <div className="w-full max-w-3xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Вариант C — Только иконки + tooltip. Текст только у главной кнопки.
        </p>

        {/* Example 1: Смета — много действий */}
        <div className="bg-background border rounded-lg p-3 space-y-1">
          <p className="text-[10px] text-muted-foreground">Смета (все действия видны)</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border rounded-md px-2 h-7 text-xs text-muted-foreground flex-1 max-w-[200px] bg-background">
              <Search className="h-3 w-3" />
              <span>Поиск...</span>
            </div>
            <div className="flex-1" />
            {/* Icon-only secondary actions */}
            <div className="flex items-center gap-0.5">
              {[
                { icon: Calculator, label: "Расчет" },
                { icon: FolderTree, label: "Раздел" },
                { icon: Save, label: "Сохранить" },
                { icon: Percent, label: "Коэфф." },
                { icon: FileUp, label: "Импорт" },
                { icon: FileDown, label: "Экспорт" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  title={label}
                  className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
              <div className="w-px h-4 bg-border mx-1" />
              <button
                title="Удалить"
                className="h-7 w-7 rounded-md flex items-center justify-center text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
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
            <div className="flex items-center gap-1.5 border rounded-md px-2 h-7 text-xs text-muted-foreground flex-1 max-w-[200px] bg-background">
              <Search className="h-3 w-3" />
              <span>Поиск...</span>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-0.5">
              {[
                { icon: FileUp, label: "Импорт" },
                { icon: FileDown, label: "Экспорт" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  title={label}
                  className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
              <div className="w-px h-4 bg-border mx-1" />
              <button
                title="Удалить всё"
                className="h-7 w-7 rounded-md flex items-center justify-center text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <button className="h-7 px-3 text-xs rounded-md bg-[#FF6A3D] text-black font-medium flex items-center gap-1.5">
              <Plus className="h-3 w-3" />
              Добавить
            </button>
          </div>
        </div>

        {/* Example 3: Закупки */}
        <div className="bg-background border rounded-lg p-3 space-y-1">
          <p className="text-[10px] text-muted-foreground">Закупки (одно действие)</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border rounded-md px-2 h-7 text-xs text-muted-foreground flex-1 max-w-[200px] bg-background">
              <Search className="h-3 w-3" />
              <span>Поиск...</span>
            </div>
            <div className="flex-1" />
            <button
              title="Экспорт Excel"
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <FileDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="pt-2 text-xs text-muted-foreground">
          ✓ Максимально компактно. Требует хороших иконок и tooltips. Риск: не очевидно без наведения.
        </div>
      </div>
    </div>
  );
}
