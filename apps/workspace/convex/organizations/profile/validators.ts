import { v } from "convex/values";

export const organizationProfileValidator = v.object({
  organizationId: v.string(),
  name: v.string(),
  legalName: v.string(),
  type: v.string(),
  email: v.string(),
  phone: v.string(),
  website: v.string(),
  address: v.string(),
  updatedAt: v.number(),
});

export const updateOrganizationProfileInputValidator = v.object({
  name: v.string(),
  legalName: v.string(),
  type: v.string(),
  email: v.string(),
  phone: v.string(),
  website: v.string(),
  address: v.string(),
});

export const emptyOrganizationProfile = (organizationId: string) => ({
  organizationId,
  name: "Organization",
  legalName: "",
  type: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  updatedAt: 0,
});
