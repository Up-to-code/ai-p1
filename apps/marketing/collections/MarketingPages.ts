import type { CollectionConfig } from "payload";

import { seoFields } from "../fields/seoFields";
import { HeroBlock } from "../blocks/HeroBlock";
import { RichTextBlock } from "../blocks/RichTextBlock";
import { FeatureGridBlock } from "../blocks/FeatureGridBlock";
import { ImageTextBlock } from "../blocks/ImageTextBlock";
import { CTASectionBlock } from "../blocks/CTASectionBlock";
import { StatsBlock } from "../blocks/StatsBlock";
import { TestimonialBlock } from "../blocks/TestimonialBlock";

export const MarketingPages: CollectionConfig = {
  slug: "marketing-pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "pageType", "status", "updatedAt"],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Page Title",
      required: true,
      localized: true,
    },
    {
      name: "slug",
      type: "text",
      label: "URL Slug",
      required: true,
      unique: true,
      admin: {
        description: "e.g. pricing, about, home. Do not include locale prefix.",
      },
    },
    {
      name: "pageType",
      type: "select",
      label: "Page Type",
      defaultValue: "generic",
      options: [
        { label: "Home", value: "home" },
        { label: "Pricing", value: "pricing" },
        { label: "About", value: "about" },
        { label: "Contact", value: "contact" },
        { label: "Docs", value: "docs" },
        { label: "Generic", value: "generic" },
      ],
      admin: {
        description: "Page type helps with layout and SEO defaults.",
      },
    },
    {
      name: "excerpt",
      type: "textarea",
      label: "Page Excerpt",
      localized: true,
      admin: {
        description: "Short summary for cards and previews.",
      },
    },
    {
      name: "sections",
      type: "blocks",
      label: "Page Sections",
      blocks: [
        HeroBlock,
        RichTextBlock,
        FeatureGridBlock,
        ImageTextBlock,
        CTASectionBlock,
        StatsBlock,
        TestimonialBlock,
      ],
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        description: "Publication date for this page.",
      },
    },
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
      admin: { position: "sidebar" },
    },
    ...seoFields,
  ],
};
