"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
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

interface DocCreateFormProps {
  onClose: () => void;
  onSubmit: (title: string, templateId?: string) => void;
  folderId?: string | null;
}

export function DocCreateForm({ onClose, onSubmit }: DocCreateFormProps) {
  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("blank");
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
    <ModulePanel open={open} onOpenChange={(next) => { if (!next) handleClose(); }} defaultWidth={480} defaultHeight={420}>
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
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplate(template.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all",
                    selectedTemplate === template.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30",
                  )}
                >
                  <FileText className="h-4 w-4 text-text-muted shrink-0" />
                  <span className="text-xs font-medium text-foreground">
                    {template.label}
                  </span>
                </button>
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
