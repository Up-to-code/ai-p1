"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SectionKicker } from "./public-page-shell";

type Founder = {
  name: string;
  role: string;
  bio: string;
  quote: string;
  author: string;
  image: string;
};

export function FounderSection() {
  const t = useTranslations("Landing.about.founders");
  const foundersRaw = t.raw("items") as Array<Omit<Founder, "image">>;
  
  const images = [
    "https://lxlnvkv63w.ufs.sh/f/mB2esVAwkuPD0bWXvWPmr7qen1Cs3u8xDVvH5Ij9QEXKYfac",
    "https://lxlnvkv63w.ufs.sh/f/mB2esVAwkuPDMsLcRAUQBOms8PtoWrSvNkdCT3HiLuA7fZK4"
  ];
  
  const founders: Founder[] = foundersRaw.map((f, i) => ({
    ...f,
    image: images[i],
  }));

  return (
    <section className="py-24 md:py-48">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-24 text-center">
          <SectionKicker center>{t("title")}</SectionKicker>
        </div>
        
        <div className="space-y-32 md:space-y-64">
          {founders.map((founder, index) => (
            <FounderCinematicSection 
              key={founder.name} 
              founder={founder} 
              index={index} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderCinematicSection({ 
  founder, 
  index,
}: { 
  founder: Founder; 
  index: number;
}) {
  const isEven = index % 2 === 0;

  return (
    <article className={cn(
      "flex flex-col gap-12 md:flex-row md:items-center md:gap-24",
      !isEven && "md:flex-row-reverse"
    )}>
      {/* Image Side */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3rem] border border-zinc-200 dark:border-white/10 md:w-1/2">
        <Image
          src={founder.image}
          alt={founder.name}
          fill
          className="object-cover transition-transform duration-1000 hover:scale-105"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        {/* Subtle atmospheric overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/20 via-transparent to-transparent" />
      </div>

      {/* Content Side */}
      <div className="w-full md:w-1/2">
        <div className="space-y-8">
          <header>
            <div className="flex items-center gap-4 text-blue-600 dark:text-blue-400">
              <div className="h-px w-8 bg-current opacity-40" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">
                {founder.role}
              </span>
            </div>
            <h3 className="mt-6 text-5xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-7xl">
              {founder.name}
            </h3>
          </header>

          <p className="text-lg font-medium leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-2xl md:leading-10">
            {founder.bio}
          </p>

          <div className="relative pt-12">
            {/* Redesigned Quote: Editorial Style */}
            <div className="relative rounded-[2.5rem] bg-zinc-50 p-8 dark:bg-white/[0.03]">
              <span className="absolute -top-6 left-8 text-8xl font-serif text-blue-500/10 dark:text-blue-400/10">"</span>
              <blockquote className="relative">
                <p className="text-base font-medium italic leading-relaxed text-zinc-800 dark:text-zinc-200 md:text-lg">
                  {founder.quote}
                </p>
                <footer className="mt-6 flex items-center gap-3">
                  <div className="h-0.5 w-4 bg-blue-500/30" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    {founder.author}
                  </span>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
