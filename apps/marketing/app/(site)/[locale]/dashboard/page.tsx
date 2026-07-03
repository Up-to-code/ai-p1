import { permanentRedirect } from "next/navigation";

import { productUrls } from "@/lib/content";

export default function DashboardRedirectPage() {
  permanentRedirect(productUrls.workspace);
}
