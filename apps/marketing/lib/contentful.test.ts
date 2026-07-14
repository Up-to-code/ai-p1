import { describe, expect, it } from "vitest";

import { applyContentfulMarketingPayload } from "./contentful-payload";

describe("Contentful Marketing payload", () => {
  it("falls back when Contentful has no usable payload", () => {
    const content = applyContentfulMarketingPayload("en", null);

    expect(content.source).toBe("repository");
    expect(content.presentation.hero.cta).toBe("Start free");
  });

  it("overlays only known Marketing presentation fields", () => {
    const content = applyContentfulMarketingPayload("en", {
      hero: { cta: "Create your workspace", unknown: "ignored" },
      footer: { tagline: "Work with complete context" },
      assets: { homeHero: "https://images.ctfassets.net/example/hero.png" },
      landingPage: {
        cta: { primary: "Create your workspace" },
        platformStory: { contextTitle: "Keep every decision connected" },
      },
      messages: { Landing: { home: { hero: { title: "One connected workspace" } } } },
    });

    expect(content.source).toBe("contentful");
    expect(content.presentation.hero.cta).toBe("Create your workspace");
    expect(content.presentation.hero.eyebrow).toBe("ONE WORKSPACE. EVERY TEAM.");
    expect(content.presentation.footer.tagline).toBe("Work with complete context");
    expect(content.presentation.assets.homeHero).toBe(
      "https://images.ctfassets.net/example/hero.png",
    );
    expect(content.presentation.landingPage.cta.primary).toBe(
      "Create your workspace",
    );
    expect(content.presentation.landingPage.platformStory.contextTitle).toBe(
      "Keep every decision connected",
    );
    expect(content.messages.Landing.home.hero.title).not.toBe("One connected workspace");
    expect(content.presentation.hero).not.toHaveProperty("unknown");
  });

  it("rejects type-incompatible overrides", () => {
    const content = applyContentfulMarketingPayload("en", {
      hero: { cta: 42 },
      assets: { security: "not-an-array" },
      landingPage: { cta: { points: "not-an-array" } },
      pricingPage: { plans: [{ id: "free", name: "Only one plan" }] },
      testimonials: "not-an-array",
    });

    expect(content.presentation.hero.cta).toBe("Start free");
    expect(content.presentation.testimonials.length).toBeGreaterThan(0);
    expect(content.presentation.assets.security).toHaveLength(3);
    expect(content.presentation.landingPage.cta.points).toHaveLength(3);
    expect(content.presentation.pricingPage.plans).toHaveLength(4);
  });
});
