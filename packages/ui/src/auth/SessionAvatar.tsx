"use client";

import { useAuth } from "@anan/auth-sdk/react";

function initialsFromName(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "A";
  return source
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function SessionAvatar({
  className = "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-xs font-black text-white",
}: {
  className?: string;
}) {
  const { context } = useAuth();
  if (context?.image) {
    return <img src={context.image} alt={context.name ?? context.email ?? "User"} className={className} />;
  }
  return <span className={className}>{initialsFromName(context?.name, context?.email)}</span>;
}
