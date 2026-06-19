import type { CollectionConfig } from "payload";

export const FAQs: CollectionConfig = {
  slug: "faqs",
  admin: {
    useAsTitle: "question",
    defaultColumns: ["question", "sortOrder"],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "question",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "answer",
      type: "richText",
      required: true,
      localized: true,
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar" },
    },
  ],
};
