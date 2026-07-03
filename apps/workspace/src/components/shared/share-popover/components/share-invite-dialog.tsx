"use client";

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

type ShareInviteDialogProps = {
  open: boolean;
  email: string;
  permission: string;
  inviting: boolean;
  inviteDisabled: boolean;
  onOpenChange: (open: boolean) => void;
  onEmailChange: (email: string) => void;
  onPermissionChange: (permission: string) => void;
  onSend: () => void;
};

export function ShareInviteDialog({
  open,
  email,
  permission,
  inviting,
  inviteDisabled,
  onOpenChange,
  onEmailChange,
  onPermissionChange,
  onSend,
}: ShareInviteDialogProps) {
  const t = useTranslations("SharePopover.inviteDialog");
  const tPermissions = useTranslations("SharePopover.permissions");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-6">
        <DialogHeader className="pe-8 text-start">
          <DialogTitle className="text-base font-black text-foreground">{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {t("email")}
            </Label>
            <Input
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder={t("emailPlaceholder")}
              className="h-10 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {t("permission")}
            </Label>
            <Select value={permission} onValueChange={(value: string | null) => value && onPermissionChange(value)}>
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">{tPermissions("viewer")}</SelectItem>
                <SelectItem value="editor">{tPermissions("editor")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="justify-start gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-lg">
            {t("cancel")}
          </Button>
          <Button
            onClick={onSend}
            disabled={!email.trim() || inviteDisabled || inviting}
            className="h-10 rounded-lg bg-primary px-5 text-[10px] font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
          >
            {t("send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
