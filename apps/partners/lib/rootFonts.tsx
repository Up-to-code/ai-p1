import { createRootFontClassName } from "@anan/web-foundation/fonts";
import localFont from "next/font/local";

const cairo = localFont({
  src: "../public/fonts/cairo-arabic.woff2",
  weight: "200 1000",
  style: "normal",
  display: "swap",
  variable: "--font-cairo",
});

const geistMono = localFont({
  src: "../public/fonts/geist-mono-latin.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-geist-mono",
});

export const rootFontClassName = createRootFontClassName(cairo.variable, cairo.className, geistMono.variable);
