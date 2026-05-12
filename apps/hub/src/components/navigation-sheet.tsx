import { useLocale, useTranslations } from "next-intl";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { NavMenu } from "@/components/nav-menu";
import { cn } from "@/lib/utils";

export const NavigationSheet = () => {
  const t = useTranslations("Landing.nav");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <Sheet>
      <VisuallyHidden>
        <SheetTitle>{t("home")}</SheetTitle>
      </VisuallyHidden>

      <SheetTrigger render={<Button className="rounded-full h-10 w-10 border-zinc-200 dark:border-white/10" size="icon" variant="outline" />}>
        <Menu className="h-4 w-4" />
      </SheetTrigger>
      <SheetContent side={isAr ? "right" : "left"} className="w-[300px] px-6 py-10">
        <Logo />
        <div className="mt-10 flex flex-col gap-2">
          <NavMenu className="[&>div]:h-full" orientation="vertical" />
        </div>
      </SheetContent>
    </Sheet>
  );
};
