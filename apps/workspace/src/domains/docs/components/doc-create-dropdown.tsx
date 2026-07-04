"use client";

import { useState } from "react";
import { Plus, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface DocCreateDropdownProps {
  onCreateBlank: () => void;
  onCreateFromTemplate?: (templateId: string) => void;
}

export function DocCreateDropdown({
  onCreateBlank,
  onCreateFromTemplate,
}: DocCreateDropdownProps) {
  const t = useTranslations("Docs");
  const [open, setOpen] = useState(false);

  const templates = [
    { id: "meeting-notes", label: t("templates.meetingNotes"), icon: FileText },
    { id: "project-plan", label: t("templates.projectPlan"), icon: Sparkles },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="module"
            size="sm"
            className="h-9 rounded-lg px-4 text-sm font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("actions.newDoc")}
          </Button>
        }
      />
      <PopoverContent
        align="end"
        sideOffset={4}
        className="w-56 p-2 rounded-xl border-border bg-card shadow-lg"
      >
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              onCreateBlank();
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            {t("actions.blankDoc")}
          </button>

          {templates.length > 0 && (
            <>
              <div className="px-3 py-2">
                <div className="h-px bg-border" />
              </div>
              <div className="px-3 py-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("templates.title")}
                </span>
              </div>
              {templates.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      onCreateFromTemplate?.(template.id);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {template.label}
                  </button>
                );
              })}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
