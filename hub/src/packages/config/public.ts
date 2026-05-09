import { envReader } from "./env-reader";

export const convexRuntimeConfig = {
  url: envReader.read("NEXT_PUBLIC_CONVEX_URL", "http://127.0.0.1:3210"),
  siteUrl: envReader.read(
    "NEXT_PUBLIC_CONVEX_SITE_URL",
    "http://127.0.0.1:3211",
  ),
};

export const apiRuntimeConfig = {
  baseUrl: envReader.read("NEXT_PUBLIC_API_URL", ""),
};
