import type { Block } from "payload";

export const RichTextBlock: Block = {
  slug: "richText",
  labels: {
    singular: "Rich Text",
    plural: "Rich Text Blocks",
  },
  fields: [
    {
      name: "content",
      type: "richText",
      label: "Content",
      required: true,
      localized: true,
    },
  ],
};
