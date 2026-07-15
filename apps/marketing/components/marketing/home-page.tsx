"use client";

import LogoCloud from "@/components/logo-cloud";
import { AnimatedHomeHero } from "@/components/landing/animated-home-hero";
import { CtaSection } from "@/components/landing/cta-section";
import { Faq02 } from "@/components/landing/faq-02";
import { PlatformStorySections } from "@/components/landing/platform-story-sections";

export function HomePage() {
  return (
    <>
      <AnimatedHomeHero />

      <LogoCloud />

      <PlatformStorySections />

      <Faq02 />

      <CtaSection />
    </>
  );
}
