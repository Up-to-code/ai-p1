import type { Block } from "payload";

export const StatsBlock: Block = {
  slug: "stats",
  labels: {
    singular: "Stats Section",
    plural: "Stats Sections",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Section Title",
      localized: true,
    },
    {
      name: "stats",
      type: "array",
      label: "Statistics",
      minRows: 1,
      maxRows: 4,
      fields: [
        {
          name: "value",
          type: "text",
          label: "Value",
          required: true,
          admin: {
            description: "e.g. 10,000+, 99%",
          },
        },
        {
          name: "label",
          type: "text",
          label: "Label",
          required: true,
          localized: true,
        },
        {
          name: "description",
          type: "textarea",
          label: "Description",
          localized: true,
        },
      ],
    },
  ],
};
