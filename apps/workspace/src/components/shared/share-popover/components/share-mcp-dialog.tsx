"use client";

import { Plus, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { shareMcpPresetIds } from "../config/mcp-presets.config";

type ShareMcpDialogProps = {
  open: boolean;
  name: string;
  preset: string;
  creating: boolean;
  onOpenChange: (open: boolean) => void;
  onNameChange: (name: string) => void;
  onPresetChange: (preset: string) => void;
  onCreate: () => void;
};

export function ShareMcpDialog({
  open,
  name,
  preset,
  creating,
  onOpenChange,
  onNameChange,
  onPresetChange,
  onCreate,
}: ShareMcpDialogProps) {
  const t = useTranslations("SharePopover.mcpDialog");
  const tPresets = useTranslations("SharePopover.mcpPresets");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-6">
        <DialogHeader className="pe-8 text-start">
          <DialogTitle className="text-base font-black text-foreground">{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {t("name")}
            </Label>
            <Input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder={t("namePlaceholder")}
              className="h-10 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {t("preset")}
            </Label>
            <Select value={preset} onValueChange={(value) => value && onPresetChange(value)}>
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {shareMcpPresetIds.map((presetId) => (
                  <SelectItem key={presetId} value={presetId}>
                    {tPresets(presetId)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="justify-start gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-lg">
            {t("cancel")}
          </Button>
          <Button
            onClick={onCreate}
            disabled={!name.trim() || creating}
            className="h-10 rounded-lg bg-primary px-5 text-[10px] font-black uppercase tracking-widest text-primary-foreground hover:bg-black"
          >
            {creating ? (
              <span className="flex items-center gap-2">
                <Settings2 className="h-3.5 w-3.5 animate-spin" />
                {t("creating")}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="h-3.5 w-3.5" />
                {t("create")}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
