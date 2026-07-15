"use client";

import { Marquee } from "@/components/ui/marquee";
import { useMarketingContent } from "@/components/marketing/marketing-content-provider";

const LogoCloud = () => {
  const cloud = useMarketingContent().landingPage.support.logoCloud;

  return (
    <div aria-label={cloud.label} className="w-full border-y border-[var(--q-border)] bg-[var(--q-card)] py-8 md:py-10">
      <div className="mx-auto max-w-7xl overflow-hidden">
        <div className="flex items-center justify-center overflow-hidden">
          <Marquee
            className="w-full [--duration:38s] [--gap:3rem] [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
            dir="ltr"
            pauseOnHover
            repeat={3}
          >
            {cloud.items.map(({ image, name }) => (
              <span
                key={name}
                className="flex items-center gap-2.5 whitespace-nowrap text-base font-semibold text-[var(--q-text-secondary)] grayscale transition duration-200 hover:text-[var(--q-text-primary)] hover:grayscale-0"
              >
                <img
                  alt=""
                  className="h-6 w-6 object-contain"
                  src={image}
                />
                <span>{name}</span>
              </span>
            ))}
          </Marquee>
        </div>
      </div>
    </div>
  );
};

export default LogoCloud;
