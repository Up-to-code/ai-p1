"use client";

import type { ComponentProps } from "react";
import { useLocale } from "next-intl";

import { Link } from "@/i18n/routing";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
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
            <NavigationMenuLink className="flex h-9 w-max items-center justify-center rounded-md px-4 py-1.5 text-sm font-medium outline-hidden select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50">
              <Link href={item.href}>
                {item.labels[locale]}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
