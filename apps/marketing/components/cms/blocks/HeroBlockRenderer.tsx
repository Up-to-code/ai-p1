import React from "react";
import Image from "next/image";
import Link from "next/link";

type HeroBlockData = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  heroImage?: {
    id: number;
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  primaryCTA?: {
    label?: string;
    href?: string;
  };
  secondaryCTA?: {
    label?: string;
    href?: string;
  };
};

type HeroBlockRendererProps = {
  data: HeroBlockData;
};

export function HeroBlockRenderer({ data }: HeroBlockRendererProps) {
  const { eyebrow, title, subtitle, heroImage, primaryCTA, secondaryCTA } = data;

  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Text Content */}
          <div className="flex flex-col justify-center space-y-6">
            {eyebrow && (
              <p className="text-sm font-medium uppercase tracking-wider text-primary">
                {eyebrow}
              </p>
            )}

            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {title}
            </h1>

            {subtitle && (
              <p className="text-lg text-muted-foreground md:text-xl">
                {subtitle}
              </p>
            )}

            {/* CTAs */}
            {(primaryCTA?.label || secondaryCTA?.label) && (
              <div className="flex flex-wrap gap-4">
                {primaryCTA?.label && primaryCTA?.href && (
                  <Link
                    href={primaryCTA.href}
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    {primaryCTA.label}
                  </Link>
                )}

                {secondaryCTA?.label && secondaryCTA?.href && (
                  <Link
                    href={secondaryCTA.href}
                    className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {secondaryCTA.label}
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Hero Image */}
          {heroImage && (
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted lg:aspect-square">
              <Image
                src={heroImage.url}
                alt={heroImage.alt || title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
