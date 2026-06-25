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
import { brandIdentity } from "@qentrah/brand-identity";

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

const stripExtensionAttributes = `
(function(){
  try{
    new MutationObserver(function(m){
      for(var i=0;i<m.length;i++){
        var t=m[i].target;
        if(t.removeAttribute&&t.hasAttribute("cz-shortcut-listen"))t.removeAttribute("cz-shortcut-listen");
      }
    }).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:["cz-shortcut-listen"]});
  }catch(e){}
})();
`;

const themeInitScript = `
(() => {
  try {
    const theme = window.localStorage.getItem("${brandIdentity.themeStorageKey}") === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

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
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} suppressHydrationWarning />
      <script dangerouslySetInnerHTML={{ __html: stripExtensionAttributes }} suppressHydrationWarning />
      {children}
    </PayloadRootLayout>
  );
}
