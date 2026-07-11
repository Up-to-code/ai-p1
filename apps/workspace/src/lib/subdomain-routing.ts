export function resolveSubdomainPath(
  label: string | null,
  locale: string,
  pathname: string,
): string | null {
  if (!label) return null;

  if (label === "inbox") {
    return `/${locale}/inbox${pathname === "/" ? "" : pathname}`;
  }

  if (label === "ws") {
    // Client navigation may already include the canonical workspace prefix.
    // Rewriting `/en/ws` again would produce the non-existent `/en/ws/ws`.
    if (pathname === "/ws" || pathname.startsWith("/ws/")) return null;
    return `/${locale}/ws${pathname === "/" ? "" : pathname}`;
  }

  // app.qentrah.com is the canonical application host. Only its root aliases
  // the workspace dashboard; named application routes such as /ai and
  // /projects must keep their own route instead of becoming /ws/ai or
  // /ws/projects, which do not exist.
  if (label === "app" && pathname === "/") {
    return `/${locale}/ws`;
  }

  if (label === "admin") {
    return `/${locale}/organization${pathname === "/" ? "" : pathname}`;
  }

  if (label === "ai") {
    return `/${locale}/ai${pathname === "/" ? "" : pathname}`;
  }

  return null;
}
