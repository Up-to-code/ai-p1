"use client";

import type { ComponentProps, PropsWithChildren } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type NextThemesProviderWithChildrenProps = PropsWithChildren<ComponentProps<typeof NextThemesProvider>>;
const StableNextThemesProvider =
  NextThemesProvider as React.ComponentType<NextThemesProviderWithChildrenProps>;

export type AnanThemeProviderProps = {
  children: React.ReactNode;
  storageKey?: string;
};

export function AnanThemeProvider({ children, storageKey }: AnanThemeProviderProps) {
  return (
    <StableNextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey={storageKey}
    >
      {children}
    </StableNextThemesProvider>
  );
}
