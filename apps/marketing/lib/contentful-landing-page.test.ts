import { describe, expect, it } from "vitest";

import { extractContentfulLandingPagePayload } from "./contentful-landing-page";

const link = (id: string) => ({ sys: { type: "Link", linkType: "Entry", id } });
const assetLink = (id: string) => ({
  sys: { type: "Link", linkType: "Asset", id },
});

describe("Contentful landing-page blocks", () => {
  it("resolves editor inputs and ignores retired landing artwork fields", () => {
    const payload = extractContentfulLandingPagePayload({
      items: [
        {
          fields: {
            hero: link("hero"),
            platformStory: link("platform"),
            aiOutcomes: link("ai"),
            trust: link("trust"),
            cta: link("cta"),
          },
        },
      ],
      includes: {
        Entry: [
          {
            sys: { id: "hero" },
            fields: {
              eyebrow: "ONE WORKSPACE",
              title: "One connected workspace",
              primaryActionLabel: "Start free",
              benefits: [link("benefit")],
              note: "No card required.",
              modulesLabel: "Workspace modules",
              modules: ["Projects", "Docs"],
              imageAlt: "A connected workspace",
              image: assetLink("hero-image"),
            },
          },
          {
            sys: { id: "platform" },
            fields: {
              contextTitle: "Context stays connected",
              contextImage: assetLink("context-image"),
              agentImages: [
                assetLink("agent-1"),
                assetLink("agent-2"),
                assetLink("agent-3"),
              ],
            },
          },
          {
            sys: { id: "ai" },
            fields: {
              solutionsTitle: "One operating context",
              solutionImage: assetLink("solution-image"),
            },
          },
          {
            sys: { id: "trust" },
            fields: {
              title: "Permission-aware by design",
              images: [
                assetLink("security-1"),
                assetLink("security-2"),
                assetLink("security-3"),
              ],
            },
          },
          {
            sys: { id: "cta" },
            fields: { primaryActionLabel: "Create your workspace" },
          },
          {
            sys: { id: "benefit" },
            fields: { title: "One context", body: "Keep every handoff connected." },
          },
        ],
        Asset: [
          { sys: { id: "hero-image" }, fields: { file: { url: "//images.ctfassets.net/hero.png" } } },
          { sys: { id: "context-image" }, fields: { file: { url: "//images.ctfassets.net/context.png" } } },
          { sys: { id: "agent-1" }, fields: { file: { url: "//images.ctfassets.net/agent-1.png" } } },
          { sys: { id: "agent-2" }, fields: { file: { url: "//images.ctfassets.net/agent-2.png" } } },
          { sys: { id: "agent-3" }, fields: { file: { url: "//images.ctfassets.net/agent-3.png" } } },
          { sys: { id: "solution-image" }, fields: { file: { url: "//images.ctfassets.net/solution.png" } } },
          { sys: { id: "security-1" }, fields: { file: { url: "//images.ctfassets.net/security-1.png" } } },
          { sys: { id: "security-2" }, fields: { file: { url: "//images.ctfassets.net/security-2.png" } } },
          { sys: { id: "security-3" }, fields: { file: { url: "//images.ctfassets.net/security-3.png" } } },
        ],
      },
    });

    expect(payload?.hero).toMatchObject({
      cta: "Start free",
      title: "One connected workspace",
      benefits: [["One context", "Keep every handoff connected."]],
      modules: ["Projects", "Docs"],
    });
    expect(payload).not.toHaveProperty("assets");
    expect(payload?.hero).not.toHaveProperty("imageAlt");
    expect(payload?.landingPage).toMatchObject({
      platformStory: { contextTitle: "Context stays connected" },
      cta: { primary: "Create your workspace" },
    });
  });

  it("rejects a collection without a linked page composition", () => {
    expect(extractContentfulLandingPagePayload({ items: [] })).toBeNull();
  });
});
