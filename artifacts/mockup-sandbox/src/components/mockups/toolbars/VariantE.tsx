import { useState } from "react";
import {
  Search, Plus, FolderTree, FileUp, FileDown,
  Calculator, Percent, Trash2, ClipboardList, Wrench
} from "lucide-react";

type Tab = "estimate" | "materials" | "works" | "procurement" | "execution";

interface TabConfig {
  label: string;
  enabled: {
    addSection: boolean;
    addItem: boolean;
    importExcel: boolean;
    exportExcel: boolean;
    recalc: boolean;
    coefficients: boolean;
    delete: boolean;
  };
}

const TABS: Record<Tab, TabConfig> = {
  estimate: {
    label: "Смета",
    enabled: {
      addSection: true,
      addItem: true,
      importExcel: true,
      exportExcel: true,
      recalc: true,
      coefficients: true,
      delete: true,
    },
  },
  materials: {
    label: "Материалы",
    enabled: {
      addSection: false,
      addItem: true,
      importExcel: true,
      exportExcel: true,
      recalc: false,
      coefficients: false,
      delete: true,
    },
  },
  works: {
    label: "Работы",
    enabled: {
      addSection: false,
      addItem: true,
      importExcel: true,
      exportExcel: true,
      recalc: false,
      coefficients: false,
      delete: true,
    },
  },
  procurement: {
    label: "Закупки",
    enabled: {
      addSection: false,
      addItem: false,
      importExcel: false,
      exportExcel: true,
      recalc: false,
      coefficients: false,
      delete: false,
    },
  },
  execution: {
    label: "Выполнение",
    enabled: {
      addSection: false,
      addItem: true,
      importExcel: false,
      exportExcel: true,
      recalc: false,
      coefficients: false,
      delete: false,
    },
  },
};

function Divider() {
  return <div className="w-px h-4 bg-border flex-shrink-0" />;
}

interface ToolbarBtnProps {
  icon: React.ElementType;
  label: string;
  enabled: boolean;
  danger?: boolean;
  primary?: boolean;
}

function ToolbarBtn({ icon: Icon, label, enabled, danger, primary }: ToolbarBtnProps) {
  const base = "h-7 flex items-center gap-1.5 px-2.5 text-xs rounded-md transition-all duration-150 font-medium flex-shrink-0";

  if (!enabled) {
    return (
      <button
        disabled
        className={`${base} text-muted-foreground/35 cursor-not-allowed bg-transparent`}
        title={label}
      >
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  if (primary) {
    return (
      <button className={`${base} bg-[#FF6A3D] text-black`} title={label}>
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  if (danger) {
    return (
      <button className={`${base} border border-transparent text-destructive hover:bg-destructive/10`} title={label}>
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button className={`${base} border bg-background text-foreground hover:bg-muted`} title={label}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </button>
  );
}

export function VariantE() {
  const [activeTab, setActiveTab] = useState<Tab>("estimate");
  const cfg = TABS[activeTab];

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-6 gap-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Вариант E — Единый тулбар, кнопки гаснут при смене вкладки
      </p>

      <div className="w-full max-w-4xl bg-background border rounded-xl overflow-hidden shadow-sm">
        {/* Tab bar */}
        <div className="flex border-b bg-muted/40">
          {(Object.keys(TABS) as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-medium transition-colors relative ${
                activeTab === tab
                  ? "text-foreground bg-background border-b-2 border-[#FF6A3D] -mb-px"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              {TABS[tab].label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-background">
          {/* Search */}
          <div className="flex items-center gap-1.5 border rounded-md px-2 h-7 text-xs text-muted-foreground w-44 bg-background flex-shrink-0">
            <Search className="h-3 w-3" />
            <span>Поиск...</span>
          </div>

          <div className="flex-1" />

          {/* Group: data exchange */}
          <ToolbarBtn icon={FileUp} label="Импорт" enabled={cfg.enabled.importExcel} />
          <ToolbarBtn icon={FileDown} label="Экспорт" enabled={cfg.enabled.exportExcel} />

          <Divider />

          {/* Group: calculations */}
          <ToolbarBtn icon={Calculator} label="Расчёт" enabled={cfg.enabled.recalc} />
          <ToolbarBtn icon={Percent} label="Коэфф." enabled={cfg.enabled.coefficients} />

          <Divider />

          {/* Group: destructive */}
          <ToolbarBtn icon={Trash2} label="Удалить" enabled={cfg.enabled.delete} danger />

          <Divider />

          {/* Group: create */}
          <ToolbarBtn icon={FolderTree} label="Раздел" enabled={cfg.enabled.addSection} primary />
          <ToolbarBtn icon={Plus} label="Добавить" enabled={cfg.enabled.addItem} primary />
        </div>

        {/* Content area placeholder */}
        <div className="h-36 flex items-center justify-center text-sm text-muted-foreground bg-muted/20">
          Контент вкладки «{cfg.label}»
        </div>
      </div>

      <p className="text-xs text-muted-foreground max-w-xl text-center">
        Кнопки всегда на одном месте — пользователь запоминает раскладку. Неактивные не исчезают, а гаснут, показывая что функция просто недоступна в этом контексте.
      </p>
    </div>
  );
}
