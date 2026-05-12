import type { GeneratedAvatar, PartnerAccountView } from "@/types/account";

const AVATAR_CLASSES = [
  "bg-blue-600 text-white",
  "bg-emerald-600 text-white",
  "bg-violet-600 text-white",
  "bg-slate-800 text-white",
  "bg-amber-500 text-slate-950",
] as const;

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function getDisplayName(account: PartnerAccountView | null | undefined) {
  return account?.profile?.name || account?.identity.name || account?.identity.email || "Developer";
}

export function getDisplayEmail(account: PartnerAccountView | null | undefined) {
  return account?.profile?.email || account?.identity.email || null;
}

export function getAvatarInitials(input: { name?: string | null; email?: string | null; subject?: string | null }) {
  const name = input.name?.trim();
  if (name) {
    const parts = name.split(/\s+/u).filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "D";
  }
  const emailLocal = input.email?.split("@")[0]?.trim();
  if (emailLocal) return emailLocal.slice(0, 2).toUpperCase();
  return (input.subject?.slice(0, 2) || "DV").toUpperCase();
}

export function getGeneratedAvatar(account: PartnerAccountView | null | undefined): GeneratedAvatar {
  const subject = account?.identity.subject ?? account?.profile?.authSubject ?? "developer";
  const name = getDisplayName(account);
  const email = getDisplayEmail(account);
  return {
    initials: getAvatarInitials({ name, email, subject }),
    className: AVATAR_CLASSES[hashString(subject) % AVATAR_CLASSES.length],
  };
}
