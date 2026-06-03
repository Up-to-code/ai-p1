function convexSiteUrl() {
  return (
    process.env.CONVEX_SITE_URL ??
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
    ""
  ).replace(/\/+$/u, "");
}

export async function GET(request: Request) {
  const siteUrl = convexSiteUrl();
  if (!siteUrl) {
    return new Response("CONVEX_SITE_URL is not configured.", { status: 500 });
  }

  const upstream = new URL(
    "/.well-known/oauth-authorization-server/api/auth",
    siteUrl,
  );
  const response = await fetch(upstream, {
    headers: { accept: request.headers.get("accept") ?? "application/json" },
    cache: "no-store",
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "cache-control":
        response.headers.get("cache-control") ??
        "public, max-age=15, stale-while-revalidate=15, stale-if-error=86400",
      "content-type": response.headers.get("content-type") ?? "application/json",
    },
  });
}
