"use client";

import type { ComponentProps } from "react";
import { useLocale } from "next-intl";

import { Link } from "@/i18n/routing";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { publicSeoLinks } from "@/lib/public-links";

const navItems = publicSeoLinks;

export const NavMenu = (props: ComponentProps<typeof NavigationMenu>) => {
  const locale = useLocale() === "ar" ? "ar" : "en";
  
  return (
    <NavigationMenu {...props}>
      <NavigationMenuList className="gap-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-start">
        {navItems.map((item) => (
          <NavigationMenuItem key={item.id}>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} render={<Link href={item.href} />}>
              {item.labels[locale]}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
