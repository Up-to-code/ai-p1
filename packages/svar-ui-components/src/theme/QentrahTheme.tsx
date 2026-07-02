import React, { createContext, useContext, ReactNode } from 'react';

/**
 * Qentrah theme adapter for SVAR components.
 * Maps Qentrah CSS variables to SVAR theme tokens.
 */

export interface QentrahThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    card: string;
    'card-foreground': string;
    border: string;
    muted: string;
    'muted-foreground': string;
    accent: string;
    'accent-foreground': string;
    destructive: string;
    'destructive-foreground': string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
  };
}

const defaultTheme: QentrahThemeConfig = {
  colors: {
    primary: 'hsl(var(--q-primary))',
    secondary: 'hsl(var(--q-secondary))',
    background: 'hsl(var(--q-background))',
    foreground: 'hsl(var(--q-foreground))',
    card: 'hsl(var(--q-card))',
    'card-foreground': 'hsl(var(--q-card-foreground))',
    border: 'hsl(var(--q-border))',
    muted: 'hsl(var(--q-muted))',
    'muted-foreground': 'hsl(var(--q-muted-foreground))',
    accent: 'hsl(var(--q-accent))',
    'accent-foreground': 'hsl(var(--q-accent-foreground))',
    destructive: 'hsl(var(--q-destructive))',
    'destructive-foreground': 'hsl(var(--q-destructive-foreground))',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
  },
};

const ThemeContext = createContext<QentrahThemeConfig>(defaultTheme);

export interface QentrahThemeProviderProps {
  children: ReactNode;
  theme?: Partial<QentrahThemeConfig>;
}

export function QentrahThemeProvider({ children, theme }: QentrahThemeProviderProps) {
  const mergedTheme = { ...defaultTheme, ...theme };
  return (
    <ThemeContext.Provider value={mergedTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useQentrahTheme(): QentrahThemeConfig {
  const context = useContext(ThemeContext);
  if (!context) {
    return defaultTheme;
  }
  return context;
}

/**
 * Inject Qentrah CSS variables for SVAR components.
 * Call this in your app's root or layout.
 */
export function injectQentrahThemeVars() {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = `
    :root {
      --q-primary: 222.2 47.4% 11.2%;
      --q-secondary: 210 40% 96.1%;
      --q-background: 0 0% 100%;
      --q-foreground: 222.2 47.4% 11.2%;
      --q-card: 0 0% 100%;
      --q-card-foreground: 222.2 47.4% 11.2%;
      --q-border: 214.3 31.8% 91.4%;
      --q-muted: 210 40% 96.1%;
      --q-muted-foreground: 215.4 16.3% 46.9%;
      --q-accent: 210 40% 96.1%;
      --q-accent-foreground: 222.2 47.4% 11.2%;
      --q-destructive: 0 84.2% 60.2%;
      --q-destructive-foreground: 210 40% 98%;
    }

    .dark {
      --q-primary: 210 40% 98%;
      --q-secondary: 217.2 32.6% 17.5%;
      --q-background: 222.2 47.4% 11.2%;
      --q-foreground: 210 40% 98%;
      --q-card: 222.2 47.4% 11.2%;
      --q-card-foreground: 210 40% 98%;
      --q-border: 217.2 32.6% 17.5%;
      --q-muted: 217.2 32.6% 17.5%;
      --q-muted-foreground: 215 20.2% 65.1%;
      --q-accent: 217.2 32.6% 17.5%;
      --q-accent-foreground: 210 40% 98%;
      --q-destructive: 0 62.8% 30.6%;
      --q-destructive-foreground: 210 40% 98%;
    }
  `;
  document.head.appendChild(style);
}
