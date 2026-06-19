import React from "react";
import Link from "next/link";

type CTASectionBlockData = {
  title: string;
  description?: string;
  primaryCTA: {
    label: string;
    href: string;
  };
  secondaryCTA?: {
    label?: string;
    href?: string;
  };
};

type CTASectionBlockRendererProps = {
  data: CTASectionBlockData;
};

export function CTASectionBlockRenderer({ data }: CTASectionBlockRendererProps) {
  const { title, description, primaryCTA, secondaryCTA } = data;

  return (
    <section className="bg-primary py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl lg:text-5xl">
            {title}
          </h2>

          {description && (
            <p className="mt-6 text-lg text-primary-foreground/90">
              {description}
            </p>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href={primaryCTA.href}
              className="inline-flex items-center justify-center rounded-lg bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-background/90 focus:outline-none focus:ring-2 focus:ring-background focus:ring-offset-2 focus:ring-offset-primary"
            >
              {primaryCTA.label}
            </Link>

            {secondaryCTA?.label && secondaryCTA?.href && (
              <Link
                href={secondaryCTA.href}
                className="inline-flex items-center justify-center rounded-lg border-2 border-primary-foreground/20 px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:border-primary-foreground/40 hover:bg-primary-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary-foreground focus:ring-offset-2 focus:ring-offset-primary"
              >
                {secondaryCTA.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
