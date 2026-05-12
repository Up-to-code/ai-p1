import { HelpCircle } from "lucide-react";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { GeneratedAvatarView } from "@/components/portal/GeneratedAvatar";
import { getDisplayEmail, getDisplayName, getGeneratedAvatar } from "@/utilities/avatar";
import type { PartnerAccountView } from "@/types/account";
import Link from "next/link";

export function Topbar({ account }: { account: PartnerAccountView | null }) {
  const organizationName = account?.organization?.name ?? "Programmer organization";
  const displayName = getDisplayName(account);
  const displayEmail = getDisplayEmail(account);
  const avatar = getGeneratedAvatar(account);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center text-sm font-semibold">
          <span className="text-foreground text-lg font-bold tracking-tight mr-4">anan<span className="text-primary">portal</span></span>
          <span className="text-muted-foreground mr-4 text-lg font-light">/</span>
          <Link href="/dashboard/account" className="flex min-w-0 items-center gap-2 rounded-md bg-muted/30 px-3 py-1.5 hover:bg-muted">
            <GeneratedAvatarView avatar={avatar} className="h-6 w-6 text-[10px]" />
            <span className="max-w-[220px] truncate text-foreground">{organizationName}</span>
          </Link>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Link href="/docs" className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <HelpCircle className="h-4 w-4 mr-2" />
          Docs
        </Link>
        <ThemeToggle />
        <Link href="/dashboard/account" className="ml-2 flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1 hover:bg-muted">
          <GeneratedAvatarView avatar={avatar} className="h-8 w-8" />
          <span className="hidden max-w-[160px] flex-col text-left sm:flex">
            <span className="truncate text-xs font-semibold text-foreground">{displayName}</span>
            <span className="truncate text-[11px] text-muted-foreground">{displayEmail ?? "Account"}</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
