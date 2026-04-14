import * as React from "react";
import { Loader2 } from "lucide-react";

interface CatalogScreenShellProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputLabel: string;
  fileInputTitle: string;
  fileInputAccept?: string;
  header: React.ReactNode;
  sidebar?: React.ReactNode;
  showSidebar?: boolean;
  isOverlayVisible: boolean;
  overlayTitle: string;
  overlayDescription?: string;
  children: React.ReactNode;
}

export function CatalogScreenShell({
  fileInputRef,
  onFileChange,
  fileInputLabel,
  fileInputTitle,
  fileInputAccept = ".csv, .xlsx, .xls",
  header,
  sidebar,
  showSidebar = false,
  isOverlayVisible,
  overlayTitle,
  overlayDescription,
  children,
}: CatalogScreenShellProps) {
  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        accept={fileInputAccept}
        aria-label={fileInputLabel}
        title={fileInputTitle}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1 md:px-0 mb-2">
        <div className="flex items-center gap-3">{header}</div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start relative px-1 md:px-0 transition-all duration-300">
        {showSidebar && sidebar ? (
          <aside className="hidden lg:block w-64 shrink-0 sticky top-4 animate-in slide-in-from-left duration-200">
            {sidebar}
          </aside>
        ) : null}

        <div className="flex-1 min-w-0 w-full relative">
          {isOverlayVisible ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-2xl">
              <div className="flex flex-col items-center gap-3 p-6 bg-card border shadow-xl rounded-xl">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="flex flex-col items-center gap-1">
                  <p className="text-[12px] font-semibold">{overlayTitle}</p>
                  {overlayDescription ? (
                    <p className="text-[12px] text-muted-foreground uppercase tracking-wider font-medium">
                      {overlayDescription}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}

