// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"api-usage.mdx": () => import("../content/docs/api-usage.mdx?collection=docs"), "business-flow.mdx": () => import("../content/docs/business-flow.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "oauth-flow.mdx": () => import("../content/docs/oauth-flow.mdx?collection=docs"), "pdf-generator-example.mdx": () => import("../content/docs/pdf-generator-example.mdx?collection=docs"), "quickstart.mdx": () => import("../content/docs/quickstart.mdx?collection=docs"), "register-an-app.mdx": () => import("../content/docs/register-an-app.mdx?collection=docs"), "sdk-installation.mdx": () => import("../content/docs/sdk-installation.mdx?collection=docs"), "troubleshooting.mdx": () => import("../content/docs/troubleshooting.mdx?collection=docs"), }),
};
export default browserCollections;