export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL!,
      applicationID: "convex",
    },
    {
      domain: `${process.env.NEXT_PUBLIC_APP_URL!}/api/auth`,
      applicationID: "https://mcp.qentrah.com/mcp",
    },
  ],
};
