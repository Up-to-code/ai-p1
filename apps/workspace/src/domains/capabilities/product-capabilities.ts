/** Product destinations backed by a real model and reactive read state. */
export type ProductCapability =
  | "deliveryEconomics"
  | "timeTracking"
  | "inboxPosts"
  | "inboxReplies"
  | "inboxActivity";

/**
 * Keep this manifest explicit until each destination has its production data
 * contract. A destination must be enabled here before it can be exposed by
 * navigation or an App Router page.
 */
export const productCapabilities: Readonly<Record<ProductCapability, boolean>> = {
  deliveryEconomics: false,
  timeTracking: false,
  inboxPosts: false,
  inboxReplies: true,
  inboxActivity: false,
};

export function isProductCapabilityEnabled(capability: ProductCapability): boolean {
  return productCapabilities[capability];
}

export const productCapabilityFallbacks: Readonly<Record<ProductCapability, string>> = {
  deliveryEconomics: "/projects",
  timeTracking: "/tasks",
  inboxPosts: "/inbox",
  inboxReplies: "/inbox",
  inboxActivity: "/inbox",
};

export function productCapabilityFallback(capability: ProductCapability): string {
  return productCapabilityFallbacks[capability];
}
