import Image from "next/image";
import Link from "next/link";

import { useLocale } from "next-intl";

export const Logo = () => {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-zinc-950 shadow-sm transition-transform group-hover:scale-110 dark:bg-white">
        <Image src="/brand-logo.svg" alt="Anan" width={20} height={20} className="h-5 w-5 invert dark:invert-0" priority />
      </div>
      <span className="text-[17px] font-black tracking-tight text-zinc-950 dark:text-white">
        {isAr ? "عنان" : "anan"}
      </span>
    </Link>
  );
};
