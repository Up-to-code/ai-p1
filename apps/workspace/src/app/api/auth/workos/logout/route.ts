import { signOut } from "@workos-inc/authkit-nextjs";
import { workosRuntimeConfig } from "@/packages/config";

export async function POST() {
  await signOut({ returnTo: workosRuntimeConfig.logoutReturnUrl });
}
