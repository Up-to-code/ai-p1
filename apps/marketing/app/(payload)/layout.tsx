import "@payloadcms/next/css";

import React from "react";

export default function PayloadLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
