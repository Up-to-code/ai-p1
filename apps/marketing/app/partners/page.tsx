import { redirect } from "next/navigation";

import { productUrls } from "@/lib/content";

export default function PartnersRedirectPage() {
  redirect(productUrls.partners);
}
