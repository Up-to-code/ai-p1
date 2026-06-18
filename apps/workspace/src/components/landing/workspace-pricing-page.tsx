"use client";

import { useState } from "react";
import {
  ArrowRight,
  Zap,
  Layers,
  Bot,
  Users,
  Shield,
  Headphones,
} from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PRICE_PER_SEAT, QENTRAH_PLAN } from "@/domains/billing/api/billing";

const PARTNER_LOGOS = [
  "TechCorp", "DataFlow", "CloudNest", "InnoVate", "ScaleUp", "NexGen", "PrimeStack",
];

export function WorkspacePricingPage() {
  const locale = useLocale() as "en" | "ar";
  const isAr = locale === "ar";
  const [previewSeats, setPreviewSeats] = useState(3);
  const totalPreview = (previewSeats * PRICE_PER_SEAT).toFixed(2);

  const features = isAr
    ? [
        { icon: Layers, text: "مساحة المشاريع والأصول والعملاء" },
        { icon: Bot, text: "وكلاء الذكاء الاصطناعي وسير العمل" },
        { icon: Zap, text: "جميع التطبيقات والتكاملات" },
        { icon: Users, text: "عدد غير محدود من أعضاء الفريق" },
        { icon: Shield, text: "رصيد AI ضمن الخطة" },
        { icon: Headphones, text: "دعم ذو أولوية" },
      ]
    : [
        { icon: Layers, text: "Project, asset & client workspace" },
        { icon: Bot, text: "AI agents & workflows" },
        { icon: Zap, text: "All apps & integrations" },
        { icon: Users, text: "Unlimited team members" },
        { icon: Shield, text: "Included AI credits" },
        { icon: Headphones, text: "Priority support" },
      ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-primary mb-6">
            <Zap className="h-3.5 w-3.5" />
            {isAr ? "تسعير بسيط" : "Simple Pricing"}
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground md:text-6xl">
            {isAr ? "خطة واحدة. كل الميزات." : "One plan. Every feature."}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-semibold text-muted-foreground md:text-lg">
            {isAr
              ? "كل ما يحتاجه فريقك لإدارة العملاء والمشاريع ووكلاء الذكاء الاصطناعي — بسعر ثابت لكل مستخدم شهرياً."
              : "Everything your team needs to manage clients, projects, and AI agents — billed per user each month."}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16">

        {/* ── Single Pricing Card ────────────────────────────────── */}
        <div className="overflow-hidden rounded-3xl border-2 border-primary/20 bg-card shadow-xl">
          <div className="grid gap-px md:grid-cols-2">
            {/* ── Left: price + seat preview ─────────────── */}
            <div className="space-y-6 p-8 md:p-10">
              {/* Plan badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
                <Zap className="h-3 w-3" />
                {QENTRAH_PLAN.name}
              </div>

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black tracking-tight text-foreground">
                    ${PRICE_PER_SEAT}
                  </span>
                  <span className="text-sm font-bold text-muted-foreground">
                    {isAr ? "/ مستخدم / شهر" : "/ user / month"}
                  </span>
                </div>
              </div>

              {/* ── Interactive seat preview ──────────────── */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    {isAr ? "معاينة السعر" : "Price preview"}
                  </span>
                </div>

                {/* Number input + total */}
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={previewSeats}
                    onChange={(e) => {
                      const v = Math.max(1, Math.min(999, Number(e.target.value) || 1));
                      setPreviewSeats(v);
                    }}
                    className="w-20 rounded-lg border border-border bg-card px-2 py-1.5 text-center text-xl font-black tabular-nums text-foreground focus:border-primary focus:outline-none"
                    aria-label={isAr ? "عدد المقاعد" : "Number of seats"}
                  />
                  <span className="text-sm font-bold text-muted-foreground">
                    {previewSeats === 1 ? (isAr ? "مقعد" : "seat") : (isAr ? "مقاعد" : "seats")}
                  </span>
                  <span className="ms-auto font-black text-primary">
                    ${totalPreview}/mo
                  </span>
                </div>

                {/* Slider for quick drag up to 50 */}
                <div className="mt-3 space-y-1">
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={Math.min(previewSeats, 50)}
                    onChange={(e) => setPreviewSeats(Number(e.target.value))}
                    className="w-full accent-primary"
                    aria-label={isAr ? "تمرير عدد المقاعد" : "Drag seats"}
                  />
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground/60">
                    <span>1</span>
                    <span>50+</span>
                  </div>
                </div>

                <p className="mt-3 text-[10px] font-medium text-muted-foreground">
                  {isAr ? "يمكنك ضبط عدد المقاعد بعد التسجيل" : "Adjust seats after signing up"}
                </p>
              </div>

              {/* CTA — carries seat count to billing page */}
              <Link href={`/billing?seats=${previewSeats}`}>
                <Button
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40 active:scale-[0.98]"
                >
                  {isAr ? "ابدأ الآن" : "Get started"}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </Link>

              <p className="text-center text-[10px] font-bold text-muted-foreground">
                {isAr
                  ? "ضمان استرداد 30 يوماً · بدون رسوم خفية"
                  : "30-day money-back guarantee · No hidden fees"}
              </p>
            </div>

            {/* ── Right: features ───────────────────────── */}
            <div className="bg-muted/20 p-8 md:p-10">
              <p className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {isAr ? "كل ما تحتاجه" : "Everything included"}
              </p>
              <ul className="space-y-4">
                {features.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="pt-0.5 text-sm font-medium leading-relaxed text-foreground">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Add-ons note */}
              <div className="mt-8 rounded-xl border border-border bg-card p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                  {isAr ? "إضافات مرنة" : "Flexible add-ons"}
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {isAr
                    ? "وسّع رصيد الذكاء الاصطناعي وقدرات فريقك بإضافات مرنة."
                    : "Extend AI credits and team capacity with flexible seat add-ons via DodoPayments."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Social proof ────────────────────────────────────── */}
        <div className="mt-20 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            {isAr
              ? "موثوق من قبل الوكالات الرائدة"
              : "Trusted by leading agencies"}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {PARTNER_LOGOS.map((name) => (
              <div
                key={name}
                className="flex h-8 items-center rounded-md px-4 text-sm font-black uppercase tracking-widest text-muted-foreground/40"
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* ── What's Included Table ───────────────────────────── */}
        <div className="mt-20">
          <h2 className="mb-8 text-center text-2xl font-black tracking-tight text-foreground">
            {isAr ? "ما المضمّن في الخطة" : "What's included"}
          </h2>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="divide-y divide-border">
              {[
                {
                  category: isAr ? "الميزات الأساسية" : "Core Features",
                  items: [
                    { name: isAr ? "المشاريع" : "Projects", value: isAr ? "غير محدود" : "Unlimited" },
                    { name: isAr ? "العملاء" : "Clients", value: isAr ? "غير محدود" : "Unlimited" },
                    { name: isAr ? "إدارة المهام" : "Task Management", value: isAr ? "متضمن" : "Included" },
                    { name: isAr ? "التقويم والجدولة" : "Calendar & Scheduling", value: isAr ? "متضمن" : "Included" },
                    { name: isAr ? "إدارة الأصول" : "Asset Management", value: isAr ? "متضمن" : "Included" },
                  ],
                },
                {
                  category: isAr ? "الذكاء الاصطناعي" : "AI Capabilities",
                  items: [
                    { name: isAr ? "وكلاء AI" : "AI Agents", value: isAr ? "غير محدود" : "Unlimited" },
                    { name: isAr ? "سير عمل الوكلاء" : "Agent Workflows", value: isAr ? "متضمن" : "Included" },
                    { name: isAr ? "رصيد AI الشهري" : "Monthly AI Credits", value: isAr ? "متضمن" : "Included" },
                    { name: isAr ? "تدريب النماذج" : "Model Training", value: isAr ? "قريباً" : "Coming soon" },
                  ],
                },
                {
                  category: isAr ? "التعاون" : "Collaboration",
                  items: [
                    { name: isAr ? "أعضاء الفريق" : "Team Members", value: isAr ? "غير محدود" : "Unlimited" },
                    { name: isAr ? "الأدوار المخصصة" : "Custom Roles", value: isAr ? "متضمن" : "Included" },
                    { name: isAr ? "الصلاحيات المخصصة" : "Custom Permissions", value: isAr ? "متضمن" : "Included" },
                    { name: isAr ? "ملف المؤسسة" : "Organization Profile", value: isAr ? "متضمن" : "Included" },
                  ],
                },
                {
                  category: isAr ? "التكاملات والدعم" : "Integrations & Support",
                  items: [
                    { name: isAr ? "جميع التكاملات" : "All Integrations", value: isAr ? "متضمن" : "Included" },
                    { name: isAr ? "الوصول إلى API" : "API Access", value: isAr ? "متضمن" : "Included" },
                    { name: isAr ? "دعم ذو أولوية" : "Priority Support", value: isAr ? "متضمن" : "Included" },
                    { name: isAr ? "ضمان استرداد 30 يوماً" : "30-day Money-back", value: isAr ? "متضمن" : "Included" },
                  ],
                },
              ].map((section, idx) => (
                <div key={section.category}>
                  <div className="bg-muted/20 px-6 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {section.category}
                    </p>
                  </div>
                  {section.items.map((item, i) => (
                    <div
                      key={item.name}
                      className={cn(
                        "grid grid-cols-[1fr_auto] gap-4 px-6 py-3.5",
                        i % 2 === 0 ? "bg-card" : "bg-muted/10",
                      )}
                    >
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA banner ──────────────────────────────────────── */}
        <div className="mt-20 overflow-hidden rounded-3xl bg-foreground text-background">
          <div className="relative px-8 py-14 text-center md:px-16">
            <div className="relative z-10">
              <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                {isAr ? "هل أنت جاهز لبناء مساحة عملك؟" : "Ready to build your workspace?"}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-base font-medium text-background/80">
                {isAr
                  ? "ابدأ اليوم — اختر عدد المقاعد وأكمل الاشتراك في دقائق."
                  : "Get started today — choose your seats and complete your subscription in minutes."}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href={`/billing?seats=${previewSeats}`}>
                  <Button
                    variant="outline"
                    className="rounded-2xl border-background/30 bg-background text-foreground px-8 py-6 text-sm font-black uppercase tracking-widest hover:bg-background/90"
                  >
                    {isAr ? "ابدأ الاشتراك" : "Start subscription"}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Button>
                </Link>
              </div>
              <p className="mt-5 text-[11px] font-bold text-background/60">
                {isAr
                  ? "ضمان استرداد 30 يوماً · بدون رسوم خفية · يمكن الإلغاء في أي وقت"
                  : "30-day money-back guarantee · No hidden fees · Cancel anytime"}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
