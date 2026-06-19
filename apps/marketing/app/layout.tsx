import type { Metadata } from "next";
import type { ReactNode } from "react";
import config from "@payload-config";
import {
  RootLayout as PayloadRootLayout,
  handleServerFunctions,
} from "@payloadcms/next/layouts";
import type { ServerFunctionClient } from "payload";
import { importMap } from "./(payload)/admin/importMap";

import { rootMarketingMetadata } from "@/lib/seo";

export const metadata: Metadata = rootMarketingMetadata("ar");

const serverFunction: ServerFunctionClient = async ({ name, args }) => {
  "use server";
  return handleServerFunctions({
    name,
    args,
    config: Promise.resolve(config),
    importMap,
  });
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <PayloadRootLayout
      config={Promise.resolve(config)}
      importMap={importMap}
      serverFunction={serverFunction}
      htmlProps={{
        suppressHydrationWarning: true,
      }}
    >
      {children}
    </PayloadRootLayout>
  );
}
