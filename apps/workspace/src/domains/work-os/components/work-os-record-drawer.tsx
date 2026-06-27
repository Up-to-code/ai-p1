"use client";

import type { ReactNode } from "react";
import {
  ModulePanel,
  ModulePanelContent,
  ModulePanelHeader,
  ModulePanelTitle,
  ModulePanelDescription,
  ModulePanelBody,
  ModulePanelCloseButton,
} from "@/components/shared/module-panel";

export function WorkOsRecordDrawer({
  open,
  eyebrow,
  title,
  description,
  onOpenChange,
  children,
}: {
  open: boolean;
  eyebrow: string;
  title: string;
  description?: string;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <ModulePanel open={open} onOpenChange={onOpenChange}>
      <ModulePanelContent>
        <ModulePanelHeader
          left={
            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {eyebrow}
              </p>
              <ModulePanelTitle className="mt-0 text-2xl font-black leading-tight tracking-tight">
                {title}
              </ModulePanelTitle>
              {description ? (
                <ModulePanelDescription className="mt-1 text-xs font-bold leading-5">
                  {description}
                </ModulePanelDescription>
              ) : null}
            </div>
          }
          right={<ModulePanelCloseButton />}
        />
        <ModulePanelBody className="p-5">
          {children}
        </ModulePanelBody>
      </ModulePanelContent>
    </ModulePanel>
  );
}
