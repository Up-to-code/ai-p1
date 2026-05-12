import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anan Partner Auth Demo",
  description: "Standalone partner OAuth demo for Anan organization authorization.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
