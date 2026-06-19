import type { Block } from "payload";

export const HeroBlock: Block = {
  slug: "hero",
  labels: {
    singular: "Hero Section",
    plural: "Hero Sections",
  },
  fields: [
    {
      name: "eyebrow",
      type: "text",
      label: "Eyebrow Text",
      localized: true,
      admin: {
        description: "Small text above the title (optional)",
      },
    },
    {
      name: "title",
      type: "text",
      label: "Title",
      required: true,
      localized: true,
    },
    {
      name: "subtitle",
      type: "textarea",
      label: "Subtitle",
      localized: true,
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      label: "Hero Image",
    },
    {
      name: "primaryCTA",
      type: "group",
      label: "Primary CTA",
      fields: [
        {
          name: "label",
          type: "text",
          label: "Button Label",
          localized: true,
        },
        {
          name: "href",
          type: "text",
          label: "Link",
        },
      ],
    },
    {
      name: "secondaryCTA",
      type: "group",
      label: "Secondary CTA",
      fields: [
        {
          name: "label",
          type: "text",
          label: "Button Label",
          localized: true,
        },
        {
          name: "href",
          type: "text",
          label: "Link",
        },
      ],
    },
  ],
};
