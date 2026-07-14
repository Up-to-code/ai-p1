import { describe, expect, it } from "vitest";

import { extractContentfulMarketingSitePayload } from "./contentful-marketing-site";

const link = (id: string) => ({ sys: { type: "Link", linkType: "Entry", id } });

describe("Contentful Marketing site composition", () => {
  it("resolves site, navigation, pricing, and linked Home inputs", () => {
    const workspaceCells = Array.from({ length: 32 }, (_, index) => `CMS cell ${index + 1}`);
    const solutionTabs = ["Projects", "Spaces", "Tasks", "Automations", "Insights"];
    const payload = extractContentfulMarketingSitePayload({
      items: [{ fields: {
        brand: link("brand"),
        navigation: link("navigation"),
        homePage: link("home"),
        homeSupport: link("home-support"),
        pricingPage: link("pricing"),
        legalPages: [link("privacy")],
        seoEntries: [link("home-seo")],
        description: "One connected workspace.",
        product: "Platform",
      } }],
      includes: { Entry: [
        { sys: { id: "brand" }, fields: { displayName: "Qentrah CMS", accessibleName: "CMS home", accentColor: "#3366CC", markLight: { sys: { type: "Link", linkType: "Asset", id: "brand-light" } } } },
        { sys: { id: "navigation" }, fields: { announcement: "New from Qentrah", pricing: "Plans", signIn: "Enter workspace", openMenu: "Show menu", closeMenu: "Hide menu" } },
        { sys: { id: "pricing" }, fields: { eyebrow: "PRICING", headline: ["One ", "workspace", " for ", "delivery"] } },
        { sys: { id: "home" }, fields: { hero: link("hero") } },
        { sys: { id: "hero" }, fields: { title: "Connected work", modules: ["Projects", "Docs"], benefits: [link("hero-benefit")] } },
        { sys: { id: "hero-benefit" }, fields: { title: "One context", body: "Keep delivery connected." } },
        { sys: { id: "home-support" }, fields: { workspaceCells, solutionTabs, showcaseImageAlt: "CMS workspace preview", faq: link("faq"), logoCloud: link("logo-cloud") } },
        { sys: { id: "faq" }, fields: { eyebrow: "FAQ", title: "Questions", description: "Answers", items: [link("faq-item")] } },
        { sys: { id: "faq-item" }, fields: { question: "Can I edit this?", answer: "Yes." } },
        { sys: { id: "logo-cloud" }, fields: { label: "Connected tools", items: [link("logo-item")] } },
        { sys: { id: "logo-item" }, fields: { name: "Qentrah", icon: { sys: { type: "Link", linkType: "Asset", id: "brand-light" } } } },
        { sys: { id: "privacy" }, fields: { pageKey: "privacy", eyebrow: "Policy", title: "Privacy", updated: "Today", sections: [link("privacy-section")] } },
        { sys: { id: "privacy-section" }, fields: { title: "Introduction", body: "Privacy body", bulletItems: ["One"] } },
        { sys: { id: "home-seo" }, fields: { pageKey: "home", title: "CMS title", description: "CMS description", keywords: ["cms"], socialImage: { sys: { type: "Link", linkType: "Asset", id: "brand-light" } }, socialImageAlt: "Qentrah connected workspace" } },
      ], Asset: [{ sys: { id: "brand-light" }, fields: { file: { url: "//images.ctfassets.net/brand.svg" } } }] },
    });

    expect(payload).toMatchObject({
      brand: { displayName: "Qentrah CMS", accentColor: "#3366CC", markLight: "https://images.ctfassets.net/brand.svg" },
      navigation: { announcement: "New from Qentrah", pricing: "Plans", signIn: "Enter workspace", openMenu: "Show menu", closeMenu: "Hide menu" },
      footer: { description: "One connected workspace." },
      hero: { title: "Connected work", modules: ["Projects", "Docs"], benefits: [["One context", "Keep delivery connected."]] },
      pricingPage: { eyebrow: "PRICING", headline: ["One ", "workspace", " for ", "delivery"] },
      landingPage: { support: { workspaceCells, solutionTabs, showcaseImageAlt: "CMS workspace preview", faq: { title: "Questions", items: [["Can I edit this?", "Yes."]] }, logoCloud: { items: [{ name: "Qentrah", image: "https://images.ctfassets.net/brand.svg" }] } } },
      legalPages: [{ pageKey: "privacy", sections: [{ title: "Introduction", body: "Privacy body", bulletItems: ["One"] }] }],
      seoEntries: [{ pageKey: "home", title: "CMS title", socialImage: "https://images.ctfassets.net/brand.svg", socialImageAlt: "Qentrah connected workspace" }],
    });
  });

  it("rejects an invalid CMS accent color", () => {
    expect(extractContentfulMarketingSitePayload({
      items: [{ fields: { brand: link("brand") } }],
      includes: { Entry: [{ sys: { id: "brand" }, fields: { accentColor: "url(javascript:bad)" } }] },
    }))
      .toMatchObject({ brand: { accentColor: undefined } });
  });

  it("rejects a response without a site entry", () => {
    expect(extractContentfulMarketingSitePayload({ items: [] })).toBeNull();
  });
});
