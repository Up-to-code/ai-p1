"use client";

import Image from "next/image";
import Link from "next/link";

import { useLocale } from "next-intl";

export const BrandMark = ({ className = "h-5 w-5", priority = false }: { className?: string; priority?: boolean }) => (
  <>
    <Image
      src="/logo-derk-color.svg"
      alt="Qentrah"
      width={24}
      height={28}
      className={`${className} qentrah-brand-mark-light`}
      priority={priority}
    />
    <Image
      src="/logo-dark-mood.svg"
      alt=""
      aria-hidden="true"
      width={24}
      height={28}
      className={`${className} qentrah-brand-mark-dark`}
      priority={priority}
    />
  </>
);

export const Logo = ({ compact = false }: { compact?: boolean }) => {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <Link href="/" aria-label={isAr ? "كانترا" : "Qentrah"} className={compact ? "group flex items-center gap-2" : "group flex items-center gap-2.5"}>
      <span className={compact ? "flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--q-bg-secondary)] transition-colors group-hover:bg-[var(--q-bg-tertiary)]" : "flex h-10 w-10 items-center justify-center rounded-[14px] bg-[var(--q-bg-secondary)] transition-colors group-hover:bg-[var(--q-bg-tertiary)]"}>
        <BrandMark className={compact ? "h-[18px] w-[18px]" : "h-6 w-6"} priority />
      </span>
      <span className={compact ? "text-[15px] font-medium tracking-[-0.03em] text-[var(--q-text-primary)]" : "text-lg font-medium tracking-[-0.035em] text-[var(--q-text-primary)]"}>
        {isAr ? "كانترا" : "Qentrah"}
      </span>
    </Link>
  );
};
