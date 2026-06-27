"use client";

import {
  ModulePanel,
  ModulePanelContent,
  ModulePanelHeader,
  ModulePanelTitle,
  ModulePanelDescription,
  ModulePanelBody,
  ModulePanelCloseButton,
} from "@/components/shared/module-panel";
import { useTranslations } from "next-intl";
import { ClientForm } from "./client-form";
import type { Client } from "../store/clients.types";

interface ClientSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing?: Client;
  indexQueryKey?: readonly unknown[];
  onSuccess?: (id: string) => void;
}

export function ClientSheet({ open, onOpenChange, existing, indexQueryKey, onSuccess }: ClientSheetProps) {
  const t = useTranslations('Clients');

  return (
    <ModulePanel open={open} onOpenChange={onOpenChange}>
      <ModulePanelContent>
        <ModulePanelHeader
          center={
            <ModulePanelTitle className="text-2xl font-black tracking-tight">
              {existing ? t("form.editTitle") : t("form.createTitle")}
            </ModulePanelTitle>
          }
          right={<ModulePanelCloseButton />}
        />
        <ModulePanelDescription className="sr-only">
          {t("form.subtitle")}
        </ModulePanelDescription>
        <ModulePanelBody className="p-8">
          <ClientForm
            existing={existing}
            indexQueryKey={indexQueryKey}
            onSuccess={(id) => {
              onSuccess?.(id);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        </ModulePanelBody>
      </ModulePanelContent>
    </ModulePanel>
  );
}
