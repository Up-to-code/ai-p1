import type { Block } from "payload";

export const FeatureGridBlock: Block = {
  slug: "featureGrid",
  labels: {
    singular: "Feature Grid",
    plural: "Feature Grids",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Section Title",
      localized: true,
    },
    {
      name: "subtitle",
      type: "textarea",
      label: "Section Subtitle",
      localized: true,
    },
    {
      name: "features",
      type: "array",
      label: "Features",
      minRows: 1,
      fields: [
        {
          name: "icon",
          type: "upload",
          relationTo: "media",
          label: "Icon/Image",
        },
        {
          name: "title",
          type: "text",
          label: "Feature Title",
          required: true,
          localized: true,
        },
        {
          name: "description",
          type: "textarea",
          label: "Description",
          localized: true,
        },
        {
          name: "link",
          type: "text",
          label: "Link (optional)",
        },
      ],
    },
  ],
};
