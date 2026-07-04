"use client";

import { useTransition, useState } from "react";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { LogOut, User, Building, Settings, Moon, Sun, Globe, LayoutDashboard, Briefcase } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "@/components/providers/theme-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/domains/auth";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function ProfileMenu() {
  const t = useTranslations("ProfileMenu");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { isDark, setTheme } = useTheme();
  
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const session = useAuthSession();

  const handleLogout = () => {
    startLogoutTransition(async () => {
      await authClient.signOut();
      setLogoutOpen(false);
      router.replace("/sign-in");
      router.refresh();
    });
  };

  const nextLocale = locale === "ar" ? "en" : "ar";
  const languageLabel = locale === "ar" ? "English" : "العربية";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="rounded-full outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt={session.user.name} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[10px] font-black text-text-secondary">
                  {session.user.initials}
                </span>
              )}
              <span className="sr-only">{t("open")}</span>
            </Button>
          }
        />
        <DropdownMenuContent
          align="end"
          collisionPadding={12}
          sideOffset={8}
          className="w-[280px] max-w-[calc(100vw-24px)] rounded-xl border-border p-2 bg-popover"
        >
          {/* User Info Header */}
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt={session.user.name} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-black text-text-secondary shrink-0">
                {session.user.initials}
              </span>
            )}
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="font-semibold text-[13px] truncate text-foreground">{session.user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{session.user.email}</span>
            </div>
          </div>
          
          <DropdownMenuSeparator />

          {/* Profile */}
          <DropdownMenuItem render={<Link href="/profile" />} className="py-2 rounded-lg">
            <User className="h-4 w-4 me-2" />
            <span>Profile</span>
          </DropdownMenuItem>

          {/* Views — localized */}
          <DropdownMenuItem render={<Link href="/ws" />} className="py-2 rounded-lg">
            <LayoutDashboard className="h-4 w-4 me-2" />
            <span>{locale === "ar" ? "العروض" : "Views"}</span>
          </DropdownMenuItem>

          {/* Workspaces — localized */}
          <DropdownMenuItem render={<Link href="/organization" />} className="py-2 rounded-lg">
            <Briefcase className="h-4 w-4 me-2" />
            <span>{locale === "ar" ? "مساحات العمل" : "Workspaces"}</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />

          {/* Organization */}
          <DropdownMenuItem render={<Link href="/organization" />} className="py-2 rounded-lg">
            <Building className="h-4 w-4 me-2" />
            <span>Organization</span>
          </DropdownMenuItem>

          {/* Settings */}
          <DropdownMenuItem render={<Link href="/settings" />} className="py-2 rounded-lg">
            <Settings className="h-4 w-4 me-2" />
            <span>Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />

          {/* Theme toggle */}
          <DropdownMenuItem 
            className="py-2 rounded-lg cursor-pointer"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              setTheme(isDark ? "light" : "dark");
            }}
          >
            {isDark ? <Sun className="h-4 w-4 me-2" /> : <Moon className="h-4 w-4 me-2" />}
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </DropdownMenuItem>

          {/* Language toggle */}
          <DropdownMenuItem 
            render={<Link href={pathname} locale={nextLocale} />} 
            className="py-2 rounded-lg"
          >
            <Globe className="h-4 w-4 me-2" />
            <span>{languageLabel}</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Logout */}
          <DropdownMenuItem
            variant="destructive"
            className="py-2 rounded-lg"
            onClick={() => setLogoutOpen(true)}
          >
            <LogOut className="h-4 w-4 me-2" />
            <span>{t("logout")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("logoutTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("logoutDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isLoggingOut}
              onClick={(event: React.MouseEvent) => {
                event.preventDefault();
                handleLogout();
              }}
            >
              {t("logout")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
