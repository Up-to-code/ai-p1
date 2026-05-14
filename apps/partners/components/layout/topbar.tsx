import { HelpCircle, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { GeneratedAvatarView } from "@/components/portal/GeneratedAvatar";
import { getDisplayEmail, getDisplayName, getGeneratedAvatar } from "@/utilities/avatar";
import type { PartnerAccountView } from "@/types/account";
import Link from "next/link";
import { dashboardNav } from "@/lib/navigation";

export function Topbar({ account }: { account: PartnerAccountView | null }) {
  const organizationName = account?.organization?.name ?? "Programmer organization";
  const displayName = getDisplayName(account);
  const displayEmail = getDisplayEmail(account);
  const avatar = getGeneratedAvatar(account);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/88 px-4 backdrop-blur-md dark:bg-card/90 sm:px-6">
      <div className="flex h-[69px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/dashboard" className="shrink-0 text-lg font-bold text-foreground">
            qentrah<span className="text-primary">portal</span>
          </Link>
          <span className="hidden text-muted-foreground sm:block">/</span>
          <Link href="/dashboard/account" className="hidden min-w-0 items-center gap-2 rounded-[7px] border border-border bg-background px-3 py-1.5 hover:bg-muted sm:flex">
            <GeneratedAvatarView avatar={avatar} className="h-6 w-6 text-[10px]" />
            <span className="max-w-[220px] truncate text-foreground">{organizationName}</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
        <Link href="/dashboard/apps/new" className="hidden h-9 items-center justify-center gap-2 rounded-[7px] bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#6b90e6] sm:inline-flex">
          <Plus className="h-4 w-4" />
          Create app
        </Link>
        <Link href="/docs" className="inline-flex h-9 items-center justify-center rounded-[7px] px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
          <HelpCircle className="h-4 w-4 mr-2" />
          Docs
        </Link>
        <ThemeToggle />
        <Link href="/dashboard/account" className="ml-1 flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1 hover:bg-muted">
          <GeneratedAvatarView avatar={avatar} className="h-8 w-8" />
          <span className="hidden max-w-[160px] flex-col text-left sm:flex">
            <span className="truncate text-xs font-semibold text-foreground">{displayName}</span>
            <span className="truncate text-[11px] text-muted-foreground">{displayEmail ?? "Account"}</span>
          </span>
        </Link>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-border py-2 md:hidden">
        {dashboardNav.map((item) => (
          <Link key={item.href} href={item.href} className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
