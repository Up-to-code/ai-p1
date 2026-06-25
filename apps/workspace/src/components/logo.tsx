import Image from "next/image";
import Link from "next/link";

import { useLocale } from "next-intl";

export const BrandMark = ({ className = "h-5 w-5", priority = false }: { className?: string; priority?: boolean }) => (
  <Image
    src="/ai-logo-mode.png"
    alt="Qentrah"
    width={24}
    height={28}
    className={className}
    priority={priority}
    style={{ width: "auto" }}
  />
);

export const Logo = () => {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-zinc-200 transition-transform group-hover:scale-110 dark:bg-zinc-950 dark:ring-white/10">
        <BrandMark className="h-5 w-5" priority />
      </div>
      <span className="text-[17px] font-black tracking-tight text-zinc-950 dark:text-white">
        {isAr ? "كانترا" : "qentrah"}
      </span>
    </Link>
  );
};
