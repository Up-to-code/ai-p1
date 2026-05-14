"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function AdminLogoutButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/auth/logout", { method: "POST" });
        router.replace("/sign-in");
        router.refresh();
      }}
      className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/10 dark:hover:text-white"
    >
      <LogOut className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
