import { useTranslations } from "next-intl";

import { Logo } from "@/components/logo";
import { NavMenu } from "@/components/nav-menu";
import { NavigationSheet } from "@/components/navigation-sheet";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const t = useTranslations("Landing.nav");

  return (
    <nav className="fixed inset-x-4 top-6 mx-auto h-16 max-w-(--breakpoint-xl) rounded-full border bg-background">
      <div className="mx-auto flex h-full items-center justify-between px-4">
        <Logo />

        {/* Desktop Menu */}
        <NavMenu className="hidden md:block" />

        <div className="flex items-center gap-3">
          <Link
            className={cn(
              buttonVariants({ variant: "outline" }),
              "hidden rounded-full sm:inline-flex"
            )}
            href="/sign-in"
          >
            {t("signIn")}
          </Link>
          <Link
            className={cn(buttonVariants(), "rounded-full")}
            href="/sign-up"
          >
            {t("getStarted")}
          </Link>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
