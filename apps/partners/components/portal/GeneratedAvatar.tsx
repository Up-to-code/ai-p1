import { cn } from "@/lib/utils";
import type { GeneratedAvatar } from "@/types/account";

export function GeneratedAvatarView({
  avatar,
  className,
}: {
  avatar: GeneratedAvatar;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full text-sm font-bold shadow-sm ring-1 ring-border",
        avatar.className,
        className,
      )}
      aria-label={`Avatar ${avatar.initials}`}
    >
      {avatar.initials}
    </div>
  );
}
