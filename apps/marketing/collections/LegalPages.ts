import type { CollectionConfig } from "payload";

export const LegalPages: CollectionConfig = {
  slug: "legal-pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["slug", "title"],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "body",
      type: "richText",
      required: true,
      localized: true,
    },
  ],
};
