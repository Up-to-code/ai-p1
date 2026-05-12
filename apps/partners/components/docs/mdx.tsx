import defaultMdxComponents from "fumadocs-ui/mdx";
import { Callout } from "fumadocs-ui/components/callout";
import { Code2 } from "lucide-react";
import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  ...defaultMdxComponents,
  Callout,
  SDKName: () => <code>@anan/auth-sdk</code>,
  CodeIcon: () => <Code2 className="inline h-4 w-4" />,
};
