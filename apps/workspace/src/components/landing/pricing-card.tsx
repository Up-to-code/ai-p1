"use client";

import { Check, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PricingFeature = {
  title: string;
  included?: boolean;
};

type PricingCardProps = {
  planName: string;
  description: string;
  price: number | string;
  priceSuffix?: string;
  priceNote?: string;
  buttonText?: string;
  buttonHref?: string;
  features: PricingFeature[];
  isPopular?: boolean;
  popularBadgeText?: string;
  className?: string;
};

export function PricingCard({
  planName,
  description,
  price,
  priceSuffix,
  priceNote,
  buttonText = "Get started",
  buttonHref = "#",
  features,
  isPopular = false,
  popularBadgeText = "Most Popular",
  className,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[10px] border border-[var(--q-border)] bg-[var(--q-card)] p-3 transition-colors duration-150 hover:border-[var(--q-border-strong)]",
        isPopular && "border-[var(--q-accent-border)]",
        className
      )}
    >
      {isPopular && (
        <div className="absolute -top-[9px] left-5">
          <span className="inline-block rounded-[4px] bg-[var(--q-accent)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white">
            {popularBadgeText}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3">
        <div>
          <h3 className="text-[14px] font-medium tracking-normal text-[var(--q-text-primary)]">
            {planName}
          </h3>
          <p className="mt-1 text-[12px] leading-[1.5] text-[var(--q-text-secondary)]">
            {description}
          </p>
        </div>

        <div className="h-px bg-[var(--q-border)]" />

        <div className="flex items-baseline gap-1.5">
          {typeof price === "number" ? (
            <>
              <span className="text-[32px] font-semibold tracking-[-0.03em] text-[var(--q-text-primary)]">
                ${price}
              </span>
              <div className="flex flex-col">
                {priceSuffix && (
                  <span className="text-[12px] leading-[1.5] text-[var(--q-text-secondary)]">
                    {priceSuffix}
                  </span>
                )}
                {priceNote && (
                  <span className="text-[12px] leading-[1.5] text-[var(--q-text-muted)]">
                    {priceNote}
                  </span>
                )}
              </div>
            </>
          ) : (
            <span className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--q-text-primary)]">
              {price}
            </span>
          )}
        </div>

        <a
          href={buttonHref}
          className="flex items-center justify-center gap-2 rounded-[8px] bg-[var(--q-accent)] px-4 py-2 text-[13px] font-medium text-white transition-colors duration-150 hover:bg-[var(--q-accent-hover)] active:bg-[var(--q-accent-active)]"
        >
          {buttonText}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>

        <div className="h-px bg-[var(--q-border)]" />

        <ul className="flex flex-col gap-2">
          {features.map((feature) => {
            const isIncluded = feature.included !== false;
            return (
              <li key={feature.title} className="flex items-start gap-2">
                <Check
                  className={cn(
                    "mt-0.5 h-3.5 w-3.5 shrink-0",
                    isIncluded
                      ? "text-[var(--q-accent)]"
                      : "text-[var(--q-text-muted)]"
                  )}
                />
                <span
                  className={cn(
                    "text-[13px] leading-[1.6]",
                    isIncluded
                      ? "text-[var(--q-text-primary)]"
                      : "text-[var(--q-text-muted)] line-through"
                  )}
                >
                  {feature.title}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
