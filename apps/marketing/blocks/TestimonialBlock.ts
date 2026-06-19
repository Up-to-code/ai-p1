import type { Block } from "payload";

export const TestimonialBlock: Block = {
  slug: "testimonial",
  labels: {
    singular: "Testimonial",
    plural: "Testimonials",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Section Title",
      localized: true,
    },
    {
      name: "testimonials",
      type: "array",
      label: "Testimonials",
      minRows: 1,
      fields: [
        {
          name: "quote",
          type: "textarea",
          label: "Quote",
          required: true,
          localized: true,
        },
        {
          name: "authorName",
          type: "text",
          label: "Author Name",
          required: true,
        },
        {
          name: "authorRole",
          type: "text",
          label: "Author Role",
          localized: true,
        },
        {
          name: "authorAvatar",
          type: "upload",
          relationTo: "media",
          label: "Author Avatar",
        },
        {
          name: "companyLogo",
          type: "upload",
          relationTo: "media",
          label: "Company Logo",
        },
      ],
    },
  ],
};
