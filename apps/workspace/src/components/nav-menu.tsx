"use client";

import type { ComponentProps } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const navItems = [
  { key: "solutions", href: "/#solutions" },
  { key: "pricing", href: "/#pricing" },
  { key: "resources", href: "/#resources" },
  { key: "company", href: "/about" },
] as const;

export const NavMenu = (props: ComponentProps<typeof NavigationMenu>) => {
  const t = useTranslations("Landing.nav");
  
  return (
    <NavigationMenu {...props}>
      <NavigationMenuList className="gap-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-start">
        {navItems.map((item) => (
          <NavigationMenuItem key={item.key}>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} render={<Link href={item.href} />}>
              {t(item.key)}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
