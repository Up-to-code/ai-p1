import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import type { ReactNode } from "react";

import { rootMarketingMetadata } from "@/lib/seo";
import { brandIdentity } from "@qentrah/brand-identity";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = rootMarketingMetadata("ar");

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo", display: "swap" });

// Inline theme-init script: runs before paint, no flash of wrong theme.
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

// Strip browser-extension attributes that cause hydration mismatches.
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

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className={cairo.variable} suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} suppressHydrationWarning />
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: stripExtensionAttributes }} suppressHydrationWarning />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
