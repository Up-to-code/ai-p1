import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[oklch(8.5%_0.012_255)] px-5 py-10 text-[oklch(96%_0.008_255)]">
      <section className="w-full max-w-2xl text-center">
        <p className="text-[clamp(5.5rem,18vw,14rem)] font-black leading-[0.85] tracking-0 text-[oklch(96%_0.008_255)]">
          404
        </p>
        <h1 className="mt-8 text-4xl font-semibold tracking-0 sm:text-6xl">Page not found</h1>
        <p className="mx-auto mt-5 max-w-md text-base font-medium leading-7 text-[oklch(73%_0.018_255)]">
          This page is not available. Choose a language route or return home.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/en"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[oklch(96%_0.008_255)] px-7 text-sm font-bold text-[oklch(8.5%_0.012_255)] transition hover:bg-[oklch(90%_0.01_255)]"
          >
            English home
          </Link>
          <Link
            href="/ar/about"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-7 text-sm font-bold text-[oklch(96%_0.008_255)] transition hover:bg-white/[0.06]"
          >
            العربية
          </Link>
        </div>
      </section>
    </main>
  );
}
