import type { Field } from "payload";

/**
 * Reusable SEO field group for pages, blog posts, and other public content.
 */
export const seoFields: Field[] = [
  {
    name: "seo",
    type: "group",
    label: "SEO",
    fields: [
      {
        name: "title",
        type: "text",
        label: "SEO Title",
        localized: true,
        admin: {
          description: "Page title for search engines. Leave empty to use the main title.",
        },
      },
      {
        name: "description",
        type: "textarea",
        label: "SEO Description",
        localized: true,
        admin: {
          description: "Meta description for search engines. Recommended 150-160 characters.",
        },
      },
      {
        name: "keywords",
        type: "text",
        label: "Keywords",
        localized: true,
        admin: {
          description: "Comma-separated keywords for this content.",
        },
      },
      {
        name: "image",
        type: "upload",
        relationTo: "media",
        label: "Open Graph Image",
        admin: {
          description: "Image for social sharing. Recommended 1200x630px.",
        },
      },
      {
        name: "noIndex",
        type: "checkbox",
        label: "No Index",
        defaultValue: false,
        admin: {
          description: "Prevent search engines from indexing this page.",
        },
      },
      {
        name: "canonicalUrl",
        type: "text",
        label: "Canonical URL",
        admin: {
          description: "Optional canonical URL if different from default.",
        },
      },
    ],
  },
];
