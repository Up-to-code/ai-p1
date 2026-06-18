"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Headphones,
  Layers,
  Minus,
  Plus,
  Shield,
  Users,
  Zap,
  X,
} from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { PRICE_PER_SEAT, QENTRAH_PLAN } from "@/domains/billing/api/billing";

// ─── Feature comparison data ──────────────────────────────────────────────────

type FeatureValue = boolean | string;

type FeatureRow = {
  label: { en: string; ar: string };
  value: FeatureValue;
};

type FeatureCategory = {
  title: { en: string; ar: string };
  rows: FeatureRow[];
};

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    title: { en: "AI Workspace", ar: "مساحة الذكاء الاصطناعي" },
    rows: [
      { label: { en: "AI Assistant", ar: "مساعد الذكاء الاصطناعي" }, value: true },
      { label: { en: "AI Agents", ar: "وكلاء الذكاء الاصطناعي" }, value: true },
      { label: { en: "Agent Workflows", ar: "سير عمل الوكلاء" }, value: true },
      { label: { en: "AI Credits (included)", ar: "رصيد AI المضمّن" }, value: true },
    ],
  },
  {
    title: { en: "Project & Client Management", ar: "إدارة المشاريع والعملاء" },
    rows: [
      { label: { en: "Projects", ar: "المشاريع" }, value: "Unlimited" },
      { label: { en: "Clients", ar: "العملاء" }, value: "Unlimited" },
      { label: { en: "Tasks", ar: "المهام" }, value: "Unlimited" },
      { label: { en: "Calendar & Scheduling", ar: "التقويم والجدولة" }, value: true },
      { label: { en: "Opportunities Pipeline", ar: "خط الصفقات" }, value: true },
      { label: { en: "Asset Management", ar: "إدارة الأصول" }, value: true },
    ],
  },
  {
    title: { en: "Apps & Integrations", ar: "التطبيقات والتكاملات" },
    rows: [
      { label: { en: "All Integrations", ar: "جميع التكاملات" }, value: true },
      { label: { en: "MCP Agent Links", ar: "روابط وكلاء MCP" }, value: true },
      { label: { en: "API Keys", ar: "مفاتيح API" }, value: true },
      { label: { en: "Partner Apps", ar: "تطبيقات الشركاء" }, value: true },
      { label: { en: "Web Apps", ar: "تطبيقات الويب" }, value: true },
    ],
  },
  {
    title: { en: "Team & Permissions", ar: "الفريق والصلاحيات" },
    rows: [
      { label: { en: "Team Members", ar: "أعضاء الفريق" }, value: "Per seat" },
      { label: { en: "Custom Roles", ar: "الأدوار المخصصة" }, value: true },
      { label: { en: "Custom Permissions", ar: "الصلاحيات المخصصة" }, value: true },
      { label: { en: "Organization Profile", ar: "ملف المؤسسة" }, value: true },
    ],
  },
  {
    title: { en: "Support", ar: "الدعم" },
    rows: [
      { label: { en: "Email Support", ar: "دعم البريد الإلكتروني" }, value: true },
      { label: { en: "Priority Support", ar: "دعم ذو أولوية" }, value: true },
      { label: { en: "30-day Money-back", ar: "ضمان استرداد 30 يوماً" }, value: true },
    ],
  },
];

const FEATURES = [
  { icon: Layers,     en: "Project, asset & client workspace",   ar: "مساحة المشاريع والأصول والعملاء" },
  { icon: Bot,        en: "AI agents & workflows",               ar: "وكلاء الذكاء الاصطناعي وسير العمل" },
  { icon: Zap,        en: "All apps & integrations",             ar: "جميع التطبيقات والتكاملات" },
  { icon: Users,      en: "Unlimited team members",              ar: "عدد غير محدود من أعضاء الفريق" },
  { icon: Shield,     en: "Included AI credits + add-ons",       ar: "رصيد AI مضمّن + إضافات مرنة" },
  { icon: Headphones, en: "Priority support",                    ar: "دعم ذو أولوية" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function PricingScreen() {
  const locale = useLocale() as "en" | "ar";
  const isAr = locale === "ar";
  const [seats, setSeats] = useState(3);
  const [inputValue, setInputValue] = useState("3");
  const total = (seats * PRICE_PER_SEAT).toFixed(2);

  function commitInput(raw: string) {
    const v = Math.max(1, Math.min(9999, parseInt(raw, 10) || 1));
    setSeats(v);
    setInputValue(String(v));
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero header ────────────────────────────────────────── */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--q-accent)]">
            {isAr ? "التسعير" : "Pricing"}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground md:text-5xl">
            {isAr ? "خطة واحدة. كل الميزات." : "One plan. Every feature."}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base font-medium text-muted-foreground">
            {isAr
              ? "تسعير شفاف ومرن — اختر عدد المقاعد واحصل على كل ما تحتاجه."
              : "Transparent and flexible pricing — pick your seat count and get everything you need."}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12 space-y-16">

        {/* ── Pricing card ────────────────────────────────────── */}
        <div className="overflow-hidden rounded-3xl border-2 border-[var(--q-accent)] bg-card shadow-xl shadow-[var(--q-accent)]/10">
          <div className="h-1.5 bg-[var(--q-accent)]" />

          <div className="grid md:grid-cols-[1fr_1.1fr]">

            {/* Left — price + seat calculator */}
            <div className="space-y-6 p-8 md:p-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--q-accent)]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--q-accent)]">
                <Zap className="h-3 w-3" />
                {QENTRAH_PLAN.name}
              </span>

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-6xl font-black tracking-tight text-foreground">
                    $6.99
                  </span>
                  <span className="text-sm font-bold text-muted-foreground">
                    {isAr ? "/ مستخدم / شهر" : "/ user / month"}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  {isAr
                    ? "يدفع مالك المؤسسة — يشمل جميع الأعضاء"
                    : "Organization owner pays — covers entire team"}
                </p>
              </div>

              {/* Seat calculator */}
              <div className="rounded-2xl border border-[var(--q-accent)]/20 bg-[var(--q-accent)]/5 p-5 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--q-accent)]">
                  {isAr ? "احسب إجمالي فريقك" : "Calculate your team total"}
                </p>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { const v = Math.max(1, seats - 1); setSeats(v); setInputValue(String(v)); }}
                    disabled={seats <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-[var(--q-accent)] hover:text-[var(--q-accent)] disabled:opacity-40"
                    aria-label={isAr ? "تقليل" : "Decrease"}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  <input
                    type="number"
                    min={1}
                    max={9999}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={(e) => commitInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && commitInput(inputValue)}
                    className="w-20 rounded-xl border border-[var(--q-accent)]/40 bg-card px-2 py-1.5 text-center text-2xl font-black tabular-nums text-foreground focus:border-[var(--q-accent)] focus:outline-none"
                    aria-label={isAr ? "عدد المقاعد" : "Number of seats"}
                  />

                  <button
                    type="button"
                    onClick={() => { const v = seats + 1; setSeats(v); setInputValue(String(v)); }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-[var(--q-accent)] hover:text-[var(--q-accent)]"
                    aria-label={isAr ? "زيادة" : "Increase"}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>

                  <span className="text-sm font-bold text-muted-foreground">
                    {isAr ? "مستخدم" : seats === 1 ? "user" : "users"}
                  </span>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={Math.min(seats, 50)}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setSeats(v);
                    setInputValue(String(v));
                  }}
                  className="w-full accent-[var(--q-accent)]"
                  aria-label={isAr ? "تمرير المقاعد" : "Drag seats"}
                />
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                  <span>1</span>
                  <span>50+</span>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between border-t border-[var(--q-accent)]/20 pt-4">
                  <span className="text-sm font-bold text-muted-foreground">
                    {isAr ? "الإجمالي الشهري" : "Monthly total"}
                  </span>
                  <div className="text-end">
                    <span className="text-2xl font-black text-[var(--q-accent)]">${total}</span>
                    <span className="ms-1 text-xs font-bold text-muted-foreground">
                      {isAr ? "/ شهر" : "/ mo"}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link
                href={`/billing?seats=${seats}`}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4",
                  "bg-[var(--q-accent)] text-sm font-black uppercase tracking-widest text-white",
                  "shadow-lg shadow-[var(--q-accent)]/25 transition-all hover:bg-[var(--q-accent)]/90 hover:shadow-xl active:scale-[0.98]",
                )}
              >
                {isAr ? "ابدأ الاشتراك" : "Start subscription"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>

              {/* Guarantee */}
              <div className="flex items-center justify-center gap-2">
                <Check className="h-3.5 w-3.5 text-[var(--q-accent)]" strokeWidth={3} />
                <span className="text-[10px] font-bold text-muted-foreground">
                  {isAr
                    ? "ضمان استرداد 30 يوماً · دفع آمن عبر DodoPayments"
                    : "30-day money-back guarantee · Secure checkout via DodoPayments"}
                </span>
              </div>
            </div>

            {/* Right — features */}
            <div className="border-t border-border bg-muted/30 p-8 md:border-s md:border-t-0 md:p-10">
              <p className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {isAr ? "كل ما في الخطة" : "Everything included"}
              </p>
              <ul className="space-y-4">
                {FEATURES.map(({ icon: Icon, en, ar }) => (
                  <li key={en} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--q-accent)]/10">
                      <Icon className="h-4 w-4 text-[var(--q-accent)]" />
                    </div>
                    <span className="pt-1 text-sm font-medium text-foreground">
                      {isAr ? ar : en}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-2xl border border-[var(--q-accent)]/20 bg-[var(--q-accent)]/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--q-accent)]">
                  {isAr ? "إضافات مرنة عبر DodoPayments" : "Flexible add-ons via DodoPayments"}
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {isAr
                    ? "وسّع رصيد الذكاء الاصطناعي وزد المقاعد في أي وقت."
                    : "Expand AI credits and add seats at any time — no plan change needed."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Feature comparison table ─────────────────────────── */}
        <div>
          <h2 className="mb-8 text-center text-2xl font-black tracking-tight text-foreground">
            {isAr ? "مقارنة الميزات" : "Compare Features"}
          </h2>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto] border-b border-border bg-muted/50 px-6 py-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {isAr ? "الميزة" : "Feature"}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--q-accent)]">
                {isAr ? "Qentrah Workspace" : "Qentrah Workspace"}
              </span>
            </div>

            {/* Categories */}
            {FEATURE_CATEGORIES.map((category) => (
              <div key={category.title.en}>
                {/* Category header */}
                <div className="border-b border-border bg-muted/20 px-6 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {isAr ? category.title.ar : category.title.en}
                  </p>
                </div>
                {/* Rows */}
                {category.rows.map((row, i) => (
                  <div
                    key={row.label.en}
                    className={cn(
                      "grid grid-cols-[1fr_auto] items-center gap-8 border-b border-border/50 px-6 py-3.5 last:border-0",
                      i % 2 === 0 ? "bg-card" : "bg-muted/10",
                    )}
                  >
                    <span className="text-sm font-medium text-foreground">
                      {isAr ? row.label.ar : row.label.en}
                    </span>
                    <FeatureCell value={row.value} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA section ──────────────────────────────────────── */}
        <div className="overflow-hidden rounded-3xl border-2 border-[var(--q-accent)] bg-[var(--q-accent)] text-white">
          <div className="px-8 py-14 text-center md:px-16">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              {isAr ? "هل أنت جاهز لبناء مساحة عملك؟" : "Ready to build your workspace?"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base font-medium text-white/80">
              {isAr
                ? "ابدأ اليوم — اختر عدد مقاعدك وأكمل الاشتراك في دقائق."
                : "Get started today — pick your seat count and complete your subscription in minutes."}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/billing?seats=${seats}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-black uppercase tracking-widest text-[var(--q-accent)] shadow-lg transition-all hover:bg-white/90 active:scale-[0.98]"
              >
                {isAr ? "ابدأ الاشتراك" : "Start subscription"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-8 py-3.5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
              >
                {isAr ? "فتح لوحة التحكم" : "Open dashboard"}
              </Link>
            </div>
            <p className="mt-5 text-[11px] font-bold text-white/60">
              {isAr
                ? "ضمان استرداد 30 يوماً · بدون رسوم خفية · يمكن الإلغاء في أي وقت"
                : "30-day money-back guarantee · No hidden fees · Cancel anytime"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === true) {
    return (
      <CheckCircle2 className="h-5 w-5 text-[var(--q-accent)]" />
    );
  }
  if (value === false) {
    return (
      <X className="h-4 w-4 text-muted-foreground/40" />
    );
  }
  return (
    <span className="rounded-full bg-[var(--q-accent)]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--q-accent)]">
      {value}
    </span>
  );
}
