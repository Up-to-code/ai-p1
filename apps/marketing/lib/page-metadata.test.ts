import { describe, expect, it } from "vitest";

import { pageMetadata } from "./page-metadata";

describe("Marketing page metadata", () => {
  it("uses the CMS title, description, keywords, social asset, and alt text", () => {
    const metadata = pageMetadata("en", "home", {
      pageKey: "home",
      title: "Connected client delivery",
      description: "Keep every handoff in one operating context.",
      keywords: ["client delivery", "connected workspace"],
      socialImage: "https://images.ctfassets.net/qentrah/social.png",
      socialImageAlt: "Qentrah connected client-delivery workspace",
    });

    expect(metadata).toMatchObject({
      title: "Connected client delivery",
      description: "Keep every handoff in one operating context.",
      keywords: ["client delivery", "connected workspace"],
      openGraph: {
        images: [{
          url: "https://images.ctfassets.net/qentrah/social.png",
          alt: "Qentrah connected client-delivery workspace",
        }],
      },
      twitter: {
        images: ["https://images.ctfassets.net/qentrah/social.png"],
      },
    });
  });
});
