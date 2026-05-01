import * as React from "react";
import { Loader2 } from "lucide-react";

const catalogRootClassName = "space-y-2";
const catalogHeaderClassName = "mb-2 flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between md:px-0";
const catalogHeaderContentClassName = "flex items-center gap-3";
const catalogFrameClassName = "relative flex flex-col items-start gap-6 px-1 transition-all duration-300 md:px-0 lg:flex-row";
const catalogSidebarClassName = "hidden w-64 shrink-0 animate-in slide-in-from-left sticky top-4 duration-200 lg:block";
const catalogMainClassName = "relative w-full min-w-0 flex-1";
const catalogOverlayClassName = "absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-background/50 backdrop-blur-[1px]";
const catalogOverlayCardClassName = "flex flex-col items-center gap-3 rounded-xl border bg-card p-6 shadow-xl";
const catalogOverlayIconClassName = "size-10 animate-spin text-primary";
const catalogOverlayTextFrameClassName = "flex flex-col items-center gap-1";
const catalogOverlayTitleClassName = "text-xs font-semibold";
const catalogOverlayDescriptionClassName = "text-xs font-medium uppercase tracking-wider text-muted-foreground";

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
    <div className={catalogRootClassName}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        accept={fileInputAccept}
        aria-label={fileInputLabel}
        title={fileInputTitle}
      />

      <div className={catalogHeaderClassName}>
        <div className={catalogHeaderContentClassName}>{header}</div>
      </div>

      <div className={catalogFrameClassName}>
        {showSidebar && sidebar ? (
          <aside className={catalogSidebarClassName}>
            {sidebar}
          </aside>
        ) : null}

        <div className={catalogMainClassName}>
          {isOverlayVisible ? (
            <div className={catalogOverlayClassName}>
              <div className={catalogOverlayCardClassName}>
                <Loader2 className={catalogOverlayIconClassName} />
                <div className={catalogOverlayTextFrameClassName}>
                  <p className={catalogOverlayTitleClassName}>{overlayTitle}</p>
                  {overlayDescription ? (
                    <p className={catalogOverlayDescriptionClassName}>
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
