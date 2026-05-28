import { redirect } from "next/navigation";

import { productUrls } from "@/lib/content";

export default function DocsRedirectPage() {
  redirect(`${productUrls.workspace}/docs`);
}
