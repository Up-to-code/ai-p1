import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import type { AuthConfig } from "convex/server";

export default {
  providers: [
    getAuthConfigProvider(),
    {
      domain: `${process.env.NEXT_PUBLIC_APP_URL!}/api/auth`,
      applicationID: "https://mcp.qentrah.com/mcp",
    },
  ],
} satisfies AuthConfig;
