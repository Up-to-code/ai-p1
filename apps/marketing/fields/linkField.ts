import type { Field } from "payload";

/**
 * Reusable link field for CTAs and navigation.
 */
export const linkField: Field = {
  name: "link",
  type: "group",
  label: "Link",
  fields: [
    {
      name: "type",
      type: "select",
      label: "Link Type",
      defaultValue: "internal",
      options: [
        { label: "Internal Page", value: "internal" },
        { label: "External URL", value: "external" },
        { label: "Workspace App", value: "workspace" },
      ],
    },
    {
      name: "internalPath",
      type: "text",
      label: "Internal Path",
      admin: {
        condition: (data) => data?.link?.type === "internal",
        description: "e.g. /pricing, /about",
      },
    },
    {
      name: "externalUrl",
      type: "text",
      label: "External URL",
      admin: {
        condition: (data) => data?.link?.type === "external",
        description: "e.g. https://example.com",
      },
    },
    {
      name: "workspacePath",
      type: "select",
      label: "Workspace Path",
      admin: {
        condition: (data) => data?.link?.type === "workspace",
      },
      options: [
        { label: "Home", value: "home" },
        { label: "Sign In", value: "signIn" },
        { label: "Sign Up", value: "signUp" },
        { label: "Dashboard", value: "dashboard" },
        { label: "Billing", value: "billing" },
      ],
    },
    {
      name: "label",
      type: "text",
      label: "Link Label",
      required: true,
      localized: true,
    },
    {
      name: "openInNewTab",
      type: "checkbox",
      label: "Open in New Tab",
      defaultValue: false,
    },
  ],
};
