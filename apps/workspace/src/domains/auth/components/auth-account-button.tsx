"use client";

import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

type AuthAccountButtonUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type AuthAccountButtonProps = {
  disabled?: boolean;
  label: string;
  loading?: boolean;
  loadingLabel?: string;
  onClick: () => void;
  user?: AuthAccountButtonUser | null;
};

function getInitials(user?: AuthAccountButtonUser | null) {
  const source = user?.name || user?.email || "Qentrah";
  const parts = source.replace(/@.*/, "").split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return (initials || "Q").toUpperCase();
}

export function AuthAccountButton({
  disabled,
  label,
  loading,
  loadingLabel,
  onClick,
  user,
}: AuthAccountButtonProps) {
  const name = user?.name || user?.email || label;
  const currentLabel = loading ? (loadingLabel ?? label) : label;

  return (
    <Button
      className="h-10 rounded-full pe-3 ps-1.5 text-muted-foreground hover:text-foreground"
      disabled={disabled}
      onClick={onClick}
      size="sm"
      type="button"
      variant="ghost"
    >
      <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-[10px] font-black uppercase text-foreground">
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          getInitials(user)
        )}
      </span>
      <span className="hidden min-w-0 max-w-40 items-center gap-1.5 sm:flex">
        <LogOut className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{currentLabel}</span>
      </span>
    </Button>
  );
}
