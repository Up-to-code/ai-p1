import type { ReactNode } from "react";

export function AppPageShell({
  children,
  contentClassName = "",
}: {
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <main className={`mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 ${contentClassName}`}>
      {children}
    </main>
  );
}

export function AppPageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center">
      {eyebrow && (
        <span className="mb-3 inline-block text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-300">
          {eyebrow}
        </span>
      )}
      <h1 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}
