import { permanentRedirect } from "next/navigation";

import { productUrls } from "@/lib/content";

export default function PartnersRedirectPage() {
  permanentRedirect(productUrls.partners);
}
