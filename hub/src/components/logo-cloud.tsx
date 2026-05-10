import {
  Logo01,
  Logo02,
  Logo03,
  Logo04,
  Logo05,
  Logo06,
  Logo07,
  Logo08,
} from "@/components/logos";
import { Marquee } from "@/components/ui/marquee";
import { useLocale } from "next-intl";

const LogoCloud = () => {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="w-full border-b border-zinc-200/70 px-6 py-12 dark:border-white/[0.08] md:py-16">
      <div className="mx-auto max-w-7xl overflow-hidden">
        <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 md:text-base">
          {isAr ? "موثوق من قبل رواد التطوير والوسطاء" : "Trusted by Elite Developers & Brokers"}
        </p>

        <div className="mt-8 flex items-center justify-center overflow-hidden">
          <Marquee
            className="w-full [--duration:18s] [--gap:3rem] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [&_svg]:h-10 [&_svg]:w-auto [&_svg]:opacity-75"
            pauseOnHover
            repeat={3}
            reverse={isAr}
          >
            <Logo01 />
            <Logo02 />
            <Logo03 />
            <Logo04 />
            <Logo05 />
            <Logo06 />
            <Logo07 />
            <Logo08 />
          </Marquee>
        </div>
      </div>
    </div>
  );
};

export default LogoCloud;
