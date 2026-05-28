import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { brandProductName } from "@qentrah/brand-identity";
import { PartnersDocsJsonLd } from "@/components/seo-json-ld";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <PartnersDocsJsonLd />
      <DocsLayout
        tree={source.pageTree}
        nav={{
          title: `${brandProductName("partners", "en")} Docs`,
          url: "/",
        }}
        sidebar={{
          tabs: false,
        }}
      >
        {children}
      </DocsLayout>
    </>
  );
}
