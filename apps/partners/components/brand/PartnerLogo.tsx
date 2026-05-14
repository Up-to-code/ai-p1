import Image from "next/image";
import Link from "next/link";

export function PartnerLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 text-lg font-bold text-foreground">
      <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-border dark:bg-zinc-950">
        <Image
          src="/brand-logo-dark-blue.svg"
          alt="Qentrah"
          width={22}
          height={26}
          className="h-5.5 w-5.5 dark:hidden"
          priority
        />
        <Image
          src="/brand-logo-white.svg"
          alt="Qentrah"
          width={22}
          height={26}
          className="hidden h-5.5 w-5.5 dark:block"
          priority
        />
      </span>
      <span>
        qentrah<span className="text-primary">portal</span>
      </span>
    </Link>
  );
}
