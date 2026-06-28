"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SectionKicker } from "@/components/design-system";

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
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3rem] border border-[var(--q-border)] md:w-1/2">
        <Image
          src={founder.image}
          alt={founder.name}
          fill
          className="object-cover transition-transform duration-1000 hover:scale-105"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--q-bg-very-dark)]/20 via-transparent to-transparent" />
      </div>

      {/* Content Side */}
      <div className="w-full md:w-1/2">
        <div className="space-y-8">
          <header>
            <div className="flex items-center gap-4 text-[var(--q-accent)]">
              <div className="h-px w-8 bg-current opacity-40" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">
                {founder.role}
              </span>
            </div>
            <h3 className="mt-6 text-5xl font-bold tracking-tight text-[var(--q-text-primary)] md:text-7xl">
              {founder.name}
            </h3>
          </header>

          <p className="text-lg font-medium leading-relaxed text-[var(--q-text-secondary)] md:text-2xl md:leading-10">
            {founder.bio}
          </p>

          <div className="pt-10">
            <blockquote>
              <p className="text-xl font-bold leading-relaxed text-[var(--q-text-primary)] md:text-2xl">
                &ldquo;{founder.quote}&rdquo;
              </p>
              <footer className="mt-4 flex items-center gap-3">
                <div className="h-px w-6 bg-[var(--q-accent)]/30" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--q-text-muted)]">
                  {founder.author}
                </span>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </article>
  );
}
