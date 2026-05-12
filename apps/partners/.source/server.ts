// @ts-nocheck
import * as __fd_glob_9 from "../content/docs/troubleshooting.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/sdk-installation.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/register-an-app.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/quickstart.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/pdf-generator-example.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/oauth-flow.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/business-flow.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/api-usage.mdx?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, }, {"api-usage.mdx": __fd_glob_1, "business-flow.mdx": __fd_glob_2, "index.mdx": __fd_glob_3, "oauth-flow.mdx": __fd_glob_4, "pdf-generator-example.mdx": __fd_glob_5, "quickstart.mdx": __fd_glob_6, "register-an-app.mdx": __fd_glob_7, "sdk-installation.mdx": __fd_glob_8, "troubleshooting.mdx": __fd_glob_9, });