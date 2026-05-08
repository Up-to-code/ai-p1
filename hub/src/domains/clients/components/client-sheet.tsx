"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useTranslations } from "next-intl";
import { ClientForm } from "./client-form";
import type { Client } from "../store/clients.types";

interface ClientSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing?: Client;
  onSuccess?: (id: string) => void;
}

export function ClientSheet({ open, onOpenChange, existing, onSuccess }: ClientSheetProps) {
  const t = useTranslations('Clients');
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[32vw] sm:min-w-[450px] max-w-none sm:max-w-none border-none bg-[#FBFBFA] p-0 dark:bg-[#0A0A0A] shadow-2xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-zinc-100 bg-white p-10 dark:border-white/5 dark:bg-[#0A0A0A]">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-600 dark:text-sky-400">{t('form.eyebrow')}</div>
            </div>
            <SheetTitle className="mt-4 text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">
              {existing ? t('form.editTitle') + "." : t('form.createTitle') + "."}
            </SheetTitle>
            <SheetDescription className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              {t('form.subtitle')}
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-8">
            <ClientForm 
              existing={existing} 
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
