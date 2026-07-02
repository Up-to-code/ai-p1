import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-text-primary">
      <section className="w-full max-w-2xl text-center">
        <p className="text-[clamp(5.5rem,18vw,14rem)] font-black leading-[0.85] tracking-0 text-text-primary">
          404
        </p>
        <h1 className="mt-8 text-4xl font-semibold tracking-0 sm:text-6xl">Page not found</h1>
        <p className="mx-auto mt-5 max-w-md text-base font-medium leading-7 text-text-secondary">
          This page is not available. Choose a language route or return home.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/en"
            className="inline-flex h-12 items-center justify-center rounded-full bg-text-primary px-7 text-sm font-bold text-background transition hover:bg-text-primary/90"
          >
            English home
          </Link>
          <Link
            href="/ar/about"
            className="inline-flex h-12 items-center justify-center rounded-full border border-border px-7 text-sm font-bold text-text-primary transition hover:bg-surface"
          >
            العربية
          </Link>
        </div>
      </section>
    </main>
  );
}
