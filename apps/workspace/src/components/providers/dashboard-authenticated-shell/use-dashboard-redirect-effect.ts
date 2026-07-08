import { useEffect, useState } from "react";
import { chooseOrgRedirectHref, signInRedirectHref, toRouterHref } from "./router-utils";

type DashboardRouter = {
  replace: (href: string) => void;
};

export function useDashboardRedirectEffect(args: {
  authRedirect: string | null;
  locale: string;
  router: DashboardRouter;
}) {
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!args.authRedirect || hasRedirected) return;

    setHasRedirected(true);
    const targetHref = toRouterHref(args.locale, args.authRedirect);

    if (targetHref.startsWith("http://") || targetHref.startsWith("https://")) {
      if (window.location.href !== targetHref) {
        window.location.href = targetHref;
      }
      return;
    }

    if (window.location.pathname !== targetHref) {
      const redirectHref = targetHref.includes("/sign-in")
        ? signInRedirectHref(args.locale)
        : targetHref.includes("/choose-org")
          ? chooseOrgRedirectHref(args.locale)
          : targetHref;
      args.router.replace(redirectHref);
    }
  }, [args.authRedirect, args.locale, args.router, hasRedirected]);

  useEffect(() => {
    if (args.authRedirect) setHasRedirected(false);
  }, [args.authRedirect]);

  return { hasRedirected };
}
