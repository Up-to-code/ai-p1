"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function NoOrganizationState({ title, description, action, href }: { title: string; description: string; action: string; href: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-muted/50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Building2 className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-xl font-black uppercase tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        <Link href={href} className={cn(buttonVariants(), "mt-6 h-11 rounded-xl bg-primary px-6 text-[10px] font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90")}>
          {action}
        </Link>
      </div>
    </div>
  );
}
