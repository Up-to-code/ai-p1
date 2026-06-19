import type { Block } from "payload";

export const CTASectionBlock: Block = {
  slug: "ctaSection",
  labels: {
    singular: "CTA Section",
    plural: "CTA Sections",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Title",
      required: true,
      localized: true,
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      localized: true,
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
          required: true,
          localized: true,
        },
        {
          name: "href",
          type: "text",
          label: "Link",
          required: true,
        },
      ],
    },
    {
      name: "secondaryCTA",
      type: "group",
      label: "Secondary CTA (optional)",
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
