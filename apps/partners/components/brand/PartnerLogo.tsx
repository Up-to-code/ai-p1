import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PartnerLogoProps = {
  href?: string;
  inverse?: boolean;
  compact?: boolean;
  className?: string;
};

export function PartnerLogo({ href = "/", inverse = false, compact = false, className }: PartnerLogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-w-0 items-center gap-2.5 text-start font-bold text-foreground",
        inverse && "text-white",
        compact ? "text-base" : "text-lg",
        className,
      )}
      aria-label="Qentrah Partners"
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-1",
          compact ? "h-7 w-7" : "h-8 w-8",
          inverse ? "bg-white/10 ring-white/15" : "bg-white ring-border dark:bg-zinc-950",
        )}
      >
        <Image
          src={inverse ? "/brand-logo-white.svg" : "/brand-logo-dark-blue.svg"}
          alt="Qentrah"
          width={22}
          height={26}
          className={cn(compact ? "h-4.5 w-4.5" : "h-5.5 w-5.5", !inverse && "dark:hidden")}
          priority
        />
        {!inverse ? (
          <Image
            src="/brand-logo-white.svg"
            alt="Qentrah"
            width={22}
            height={26}
            className={cn("hidden dark:block", compact ? "h-4.5 w-4.5" : "h-5.5 w-5.5")}
            priority
          />
        ) : null}
      </span>
      <span className="min-w-0 leading-none">
        qentrah <span className={cn("font-medium", inverse ? "text-blue-200" : "text-muted-foreground")}>/ partners</span>
      </span>
    </Link>
  );
}
