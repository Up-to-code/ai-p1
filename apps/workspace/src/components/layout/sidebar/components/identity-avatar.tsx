import { cn } from "@/lib/utils";

type IdentityAvatarProps = {
  image: string | null;
  initials: string;
  name: string;
  size?: "sm" | "md";
};

export function IdentityAvatar({ image, initials, name, size = "sm" }: IdentityAvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted font-black uppercase text-foreground transition-opacity",
        size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs",
      )}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
