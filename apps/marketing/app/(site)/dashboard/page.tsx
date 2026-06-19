import { redirect } from "next/navigation";

import { productUrls } from "@/lib/content";

export default function DashboardRedirectPage() {
  redirect(productUrls.workspace);
}
