/**
 * CMS pages — thin re-export from the Strapi client.
 * Keeps existing import paths (lib/cms-pages) working without changes.
 */
export type {
  StrapiMarketingPage as CMSPage,
} from "./strapi";

export {
  getMarketingPage,
  getAllMarketingPages,
} from "./strapi";
