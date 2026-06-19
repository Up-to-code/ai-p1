import type { Block } from "payload";

export const ImageTextBlock: Block = {
  slug: "imageText",
  labels: {
    singular: "Image + Text",
    plural: "Image + Text Blocks",
  },
  fields: [
    {
      name: "layout",
      type: "select",
      label: "Layout",
      defaultValue: "imageLeft",
      options: [
        { label: "Image Left", value: "imageLeft" },
        { label: "Image Right", value: "imageRight" },
      ],
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Image",
      required: true,
    },
    {
      name: "title",
      type: "text",
      label: "Title",
      localized: true,
    },
    {
      name: "content",
      type: "richText",
      label: "Content",
      required: true,
      localized: true,
    },
    {
      name: "cta",
      type: "group",
      label: "Call to Action",
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
