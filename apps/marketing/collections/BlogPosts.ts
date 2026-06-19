import type { CollectionConfig } from "payload";

import { seoFields } from "../fields/seoFields";

export const BlogPosts: CollectionConfig = {
  slug: "blog-posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "author", "status", "publishedAt"],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "excerpt",
      type: "textarea",
      required: true,
      localized: true,
      admin: {
        description: "Short summary (2-3 sentences) shown in blog cards.",
        rows: 3,
      },
    },
    {
      name: "body",
      type: "richText",
      required: true,
      localized: true,
      admin: {
        description:
          "Main blog content. Use the toolbar to format text with headings, bold, italic, lists, and links.",
      },
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      required: false,
      admin: {
        description: "Main hero image for blog detail page.",
      },
    },
    {
      name: "cardImage",
      type: "upload",
      relationTo: "media",
      required: false,
      admin: {
        description:
          "Smaller image for blog listing cards. Falls back to hero image if empty.",
      },
    },
    {
      name: "author",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "authorAvatar",
      type: "upload",
      relationTo: "media",
      required: false,
    },
    {
      name: "authorRole",
      type: "text",
      localized: true,
      admin: {
        description: "e.g. Founder, Product Manager, Engineering",
      },
    },
    {
      name: "category",
      type: "text",
      required: false,
      localized: true,
    },
    {
      name: "tags",
      type: "json",
      required: false,
      localized: true,
    },
    {
      name: "readingTime",
      type: "number",
      required: false,
      defaultValue: 5,
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        description: "Publication date for this post.",
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
