import type { CollectionConfig } from "payload";

export const PricingPlans: CollectionConfig = {
  slug: "pricing-plans",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "planId", "amount", "checkoutMode"],
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
      name: "planId",
      type: "text",
      required: true,
    },
    {
      name: "amount",
      type: "number",
      required: false,
    },
    {
      name: "currency",
      type: "text",
      defaultValue: "SAR",
    },
    {
      name: "periodDays",
      type: "number",
      defaultValue: 30,
    },
    {
      name: "features",
      type: "json",
      required: false,
      localized: true,
    },
    {
      name: "highlighted",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "checkoutMode",
      type: "select",
      defaultValue: "provider",
      options: [
        { label: "Provider", value: "provider" },
        { label: "Contact Sales", value: "contact_sales" },
      ],
    },
  ],
};
