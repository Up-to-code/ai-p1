import type { CollectionConfig } from "payload";

export const LandingSections: CollectionConfig = {
  slug: "landing-sections",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["sectionKey", "title"],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "sectionKey",
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
      name: "subtitle",
      type: "text",
      required: false,
      localized: true,
    },
    {
      name: "body",
      type: "richText",
      required: false,
      localized: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: false,
    },
    {
      name: "items",
      type: "json",
      required: false,
      localized: true,
    },
  ],
};
