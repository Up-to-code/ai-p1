import Link from "next/link";
import { ShieldCheck, KeyRound } from "lucide-react";
import { brandLabel } from "@qentrah/brand-identity";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string; locale?: string }>;
}) {
  const locale = await getAdminLocale();
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/";
  const isAr = locale === "ar";

  return (
    <main className="auth-viewport bg-background px-4 py-5 text-foreground sm:px-6">
      <div className="auth-viewport-frame mx-auto flex max-w-7xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-100 bg-white text-blue-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-blue-300">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="text-lg font-black tracking-tight">{brandLabel(locale)} {isAr ? "الإدارة" : "Admin"}</span>
          </Link>
        </header>

        <section className="flex flex-1 items-center justify-center py-10 sm:py-12">
          <div className="w-full max-w-[460px]">
            <div className="mb-7 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <KeyRound className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400">
                  {isAr ? "دخول آمن" : "Secure access"}
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight">
                  {isAr ? "تسجيل دخول الإدارة" : "Admin sign in"}
                </h1>
              </div>
            </div>

            <p className="text-sm font-bold leading-6 text-zinc-500 dark:text-zinc-400">
              {isAr
                ? "سجل الدخول ببيانات الإدارة الموجودة في env. لن يحصل المتصفح على رموز الخدمة أو أسرار الإدارة، ولن تمنح هذه الشاشة أي دور جديد."
                : "Sign in with operator-controlled Admin env credentials. The browser never receives service tokens or admin secrets, and this screen cannot grant new roles."}
            </p>

            {params.reason ? (
              <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-50 p-3 text-xs font-black text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
                {isAr ? "تحتاج إلى جلسة مدير صالحة للمتابعة." : "A valid admin session is required to continue."}
              </div>
            ) : null}

            <AdminLoginForm
              nextPath={nextPath}
              labels={{
                email: isAr ? "البريد الإلكتروني" : "Email",
                password: isAr ? "كلمة المرور" : "Password",
                submit: isAr ? "دخول الإدارة" : "Enter admin",
                submitting: isAr ? "جار التحقق" : "Checking",
                failed: isAr ? "بيانات الإدارة غير صحيحة أو الدور غير مسموح." : "Invalid admin credentials or unauthorized role.",
              }}
            />

            <div className="mt-5 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                {isAr ? "الأدوار" : "Roles"}
              </p>
              <p className="mt-2 text-xs font-bold leading-5 text-zinc-500 dark:text-zinc-400">
                {isAr
                  ? "تأتي بيانات الدخول والأدوار من env أو DB تحت تحكم المشغل فقط. لا توجد دعوة أو ترقية مدير من الواجهة."
                  : "Admin credentials and roles come only from operator-controlled env or DB allowlists. There is no UI invite or promote-to-admin path."}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
