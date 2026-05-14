import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getAdminLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const locale = await getAdminLocale();
  const params = await searchParams;
  const isAr = locale === "ar";

  return (
    <main className="auth-viewport bg-background px-4 py-5 text-foreground sm:px-6">
      <div className="auth-viewport-frame mx-auto flex max-w-7xl items-center justify-center">
        <section className="w-full max-w-[500px] rounded-[24px] border border-zinc-100 bg-white p-6 text-center dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
            <ShieldAlert className="h-6 w-6" />
          </span>
          <h1 className="mt-5 text-2xl font-black tracking-tight">
            {isAr ? "الدور غير مصرح" : "Role not authorized"}
          </h1>
          <p className="mt-3 text-sm font-bold leading-6 text-zinc-500 dark:text-zinc-400">
            {isAr
              ? "هذه الجلسة صالحة، لكنها ليست ضمن أدوار الإدارة المسموحة. تعيين مدير المنصة يتم فقط من env أو DB بواسطة المشغل."
              : "This session is valid, but it is not on an allowed admin role. Platform-admin assignment is operator-controlled through env or DB only."}
          </p>
          {params.email ? (
            <p className="mt-4 rounded-2xl bg-zinc-50 p-3 font-mono text-xs font-bold text-zinc-500 dark:bg-white/[0.03] dark:text-zinc-400">
              {params.email}
            </p>
          ) : null}
          <Link href="/sign-in" className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-blue-700">
            {isAr ? "العودة لتسجيل الدخول" : "Back to sign in"}
          </Link>
        </section>
      </div>
    </main>
  );
}
