import React from "react";
import Image from "next/image";
import Link from "next/link";

type Feature = {
  icon?: {
    url: string;
    alt?: string;
  };
  title: string;
  description?: string;
  link?: string;
};

type FeatureGridBlockData = {
  title?: string;
  subtitle?: string;
  features: Feature[];
};

type FeatureGridBlockRendererProps = {
  data: FeatureGridBlockData;
};

export function FeatureGridBlockRenderer({ data }: FeatureGridBlockRendererProps) {
  const { title, subtitle, features } = data;

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-4 text-lg text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Features Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const content = (
    <div className="flex flex-col space-y-4">
      {feature.icon && (
        <div className="relative h-12 w-12">
          <Image
            src={feature.icon.url}
            alt={feature.icon.alt || feature.title}
            fill
            className="object-contain"
          />
        </div>
      )}

      <h3 className="text-xl font-semibold text-foreground">
        {feature.title}
      </h3>

      {feature.description && (
        <p className="text-muted-foreground">
          {feature.description}
        </p>
      )}
    </div>
  );

  if (feature.link) {
    return (
      <Link
        href={feature.link}
        className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {content}
    </div>
  );
}
