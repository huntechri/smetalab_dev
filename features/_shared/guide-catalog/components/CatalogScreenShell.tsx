import * as React from "react";
import { Loader2 } from "lucide-react";

import { FileInput } from "@/shared/ui/file-input";
import { catalogScreenShellClassNames } from "@/shared/ui/shells/catalog-directory-visual-contracts";

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
    <div className={catalogScreenShellClassNames.root}>
      <FileInput
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        accept={fileInputAccept}
        aria-label={fileInputLabel}
        title={fileInputTitle}
      />

      <div className={catalogScreenShellClassNames.header}>
        <div className={catalogScreenShellClassNames.headerContent}>{header}</div>
      </div>

      <div className={catalogScreenShellClassNames.frame}>
        {showSidebar && sidebar ? (
          <aside className={catalogScreenShellClassNames.sidebar}>
            {sidebar}
          </aside>
        ) : null}

        <div className={catalogScreenShellClassNames.main}>
          {isOverlayVisible ? (
            <div className={catalogScreenShellClassNames.overlay}>
              <div className={catalogScreenShellClassNames.overlayCard}>
                <Loader2 className={catalogScreenShellClassNames.overlayIcon} />
                <div className={catalogScreenShellClassNames.overlayTextFrame}>
                  <p className={catalogScreenShellClassNames.overlayTitle}>{overlayTitle}</p>
                  {overlayDescription ? (
                    <p className={catalogScreenShellClassNames.overlayDescription}>
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
