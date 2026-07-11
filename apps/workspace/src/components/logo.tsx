import Image from "next/image";
import Link from "next/link";

import { useLocale } from "next-intl";

export const BrandMark = ({ className = "h-5 w-5", priority = false }: { className?: string; priority?: boolean }) => (
  <>
    <Image
      src="/brand-logo.svg"
      alt="Qentrah"
      width={24}
      height={28}
      className={`${className} h-auto dark:hidden`}
      priority={priority}
    />
    <Image
      src="/brand-logo-white.svg"
      alt="Qentrah"
      width={24}
      height={28}
      className={`${className} h-auto hidden dark:block`}
      priority={priority}
    />
  </>
);

export const Logo = () => {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[var(--q-card)] shadow-sm ring-1 ring-[var(--q-border)] transition-transform group-hover:scale-110">
        <BrandMark className="h-5 w-5" priority />
      </div>
      <span className="text-[17px] font-black tracking-tight text-[var(--q-text-primary)]">
        {isAr ? "كانترا" : "qentrah"}
      </span>
    </Link>
  );
};
