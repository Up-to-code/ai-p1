"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export function AdminLoginForm({
  nextPath,
  labels,
}: {
  nextPath: string;
  labels: {
    email: string;
    password: string;
    submit: string;
    submitting: string;
    failed: string;
  };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function submit(formData: FormData) {
    if (isPending) return;
    setIsPending(true);
    setError(null);
    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      }),
    });

    if (!response.ok) {
      setError(labels.failed);
      setIsPending(false);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <form action={submit} className="mt-7 space-y-4">
      <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">{labels.email}</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="mt-2 h-12 w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-4 text-sm font-bold outline-none transition focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]"
        />
      </label>
      <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">{labels.password}</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 h-12 w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-4 text-sm font-bold outline-none transition focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]"
        />
      </label>
      {error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-50 p-3 text-xs font-black text-rose-700 dark:bg-rose-400/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" />
        {isPending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
