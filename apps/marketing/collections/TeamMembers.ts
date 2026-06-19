import type { CollectionConfig } from "payload";

export const TeamMembers: CollectionConfig = {
  slug: "team-members",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "role", "sortOrder"],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "role",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "avatar",
      type: "upload",
      relationTo: "media",
      required: false,
    },
    {
      name: "bio",
      type: "text",
      required: false,
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
