import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "alt",
  },
  upload: {
    staticDir: "media",
    mimeTypes: [
      "image/*",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description: "Alternative text for accessibility. Required for images.",
      },
    },
    {
      name: "caption",
      type: "text",
      localized: true,
      admin: {
        description: "Optional caption for this media.",
      },
    },
    {
      name: "credit",
      type: "text",
      admin: {
        description: "Photo/file credit or attribution.",
      },
    },
    {
      name: "isDownloadable",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Allow public download of this file.",
      },
    },
  ],
};
