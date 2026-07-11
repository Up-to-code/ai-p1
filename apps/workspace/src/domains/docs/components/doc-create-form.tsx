"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModulePanel,
  ModulePanelContent,
  ModulePanelHeader,
  ModulePanelBody,
  ModulePanelFooter,
  ModulePanelCloseButton,
} from "@/components/shared/module-panel";
import { DOC_TEMPLATE_TYPES } from "../docs.constants";
import { DocTemplateCover } from "./doc-template-cover";

interface DocCreateFormProps {
  onClose: () => void;
  onSubmit: (title: string, templateId?: string) => void;
  folderId?: string | null;
  initialTemplateId?: string;
}

export function DocCreateForm({ onClose, onSubmit, initialTemplateId = "blank" }: DocCreateFormProps) {
  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>(initialTemplateId);
  const [open, setOpen] = useState(true);

  function handleSubmit() {
    if (!title.trim()) return;
    onSubmit(title.trim(), selectedTemplate);
  }

  function handleClose() {
    setOpen(false);
    onClose();
  }

  return (
    <ModulePanel open={open} onOpenChange={(next) => { if (!next) handleClose(); }} defaultWidth={520} defaultHeight={580}>
      <ModulePanelContent>
        <ModulePanelHeader
          center={<span className="text-sm font-semibold text-foreground">New Document</span>}
          right={<ModulePanelCloseButton />}
        />

        <ModulePanelBody className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              placeholder="Document title..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Start from template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DOC_TEMPLATE_TYPES.map((template) => (
                <Button
                  key={template.id}
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedTemplate(template.id)}
                  className={cn(
                    "h-auto min-w-0 flex-col items-stretch justify-start gap-0 overflow-hidden rounded-lg p-0 text-left text-xs transition-colors",
                    selectedTemplate === template.id
                      ? "border-foreground bg-muted"
                      : "border-border bg-background hover:bg-muted/60",
                  )}
                >
                  <DocTemplateCover templateId={template.id} className="aspect-[3/2] w-full border-b border-border/60" />
                  <span className="block truncate px-3 py-2 text-xs font-medium text-foreground">
                    {template.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </ModulePanelBody>

        <ModulePanelFooter>
          <div />
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleClose} className="h-8 rounded-xl px-3 text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="h-8 rounded-xl px-3 text-xs"
            >
              Create
            </Button>
          </div>
        </ModulePanelFooter>
      </ModulePanelContent>
    </ModulePanel>
  );
}
