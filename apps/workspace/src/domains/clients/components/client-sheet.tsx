"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[80vw] sm:min-w-[800px] max-w-none sm:max-w-none border-none bg-background p-0 shadow-2xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-border bg-card px-8 py-6">
            <SheetTitle className="text-2xl font-black tracking-tight text-foreground">
              {existing ? t("form.editTitle") : t("form.createTitle")}
            </SheetTitle>
            <SheetDescription className="sr-only">
              {t("form.subtitle")}
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-8">
            <ClientForm
              existing={existing}
              indexQueryKey={indexQueryKey}
              onSuccess={(id) => {
                onSuccess?.(id);
                onOpenChange(false);
              }}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
