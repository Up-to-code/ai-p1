"use client";

import { PublicSection } from "@/components/landing/public-landing-kit";
import { Reveal } from "@/components/landing/cinematic-motion";

const copy = {
  en: {
    painPoints: {
      eyebrow: "The Pain Points",
      title: "Business operations shouldn't be this hard.",
      description: "Manual processes, scattered data, and slow execution are costing you growth. Fragmented workflows are the invisible tax on your business.",
      items: [
        {
          title: "Scattered Data",
          desc: "Work data lives in disconnected chats, spreadsheets, and old CRMs, creating manual copying errors and stale decisions."
        },
        {
          title: "Slow Execution",
          desc: "Contracts and agreements wait for manual signature, and price confirmations take days of redundant messaging, pending emails, and phone follow-ups."
        },
        {
          title: "Lost Opportunities",
          desc: "Qualified client requests expire because teams lack instant access to updated assets, calendars, and responsibilities."
        }
      ]
    },
    fix: {
      eyebrow: "The Qentrah Resolution",
      title: "How Qentrah Fixes It",
      description: "A single platform of record, automated pipeline verification, and zero lead leakage. Run your operations with perfect speed and absolute trust.",
      items: [
        {
          title: "One Source of Truth",
          desc: "Assets, clients, projects, and calendars stay synchronized in real time so every team works from the same record."
        },
        {
          title: "2.4-Second Pipeline",
          desc: "AI checks workspace context, drafts the next action, and moves routine work forward from the same operating layer."
        },
        {
          title: "Zero Lead Leakage",
          desc: "Clients receive fast follow-up, clear next steps, and calendar-ready actions without waiting for manual handoffs."
        }
      ]
    }
  },
  ar: {
    painPoints: {
      eyebrow: "التحديات التشغيلية",
      title: "التشغيل لا ينبغي أن يُدار بالتعقيد",
      description: "تعدد الأدوات، وتشتت البيانات، وبطء الإجراءات يرفع التكلفة ويضعف الكفاءة. مع كانترا، تتحول العمليات إلى لمسة ذكية واحدة تُسرّع القرار وترفع جودة الأداء.",
      items: [
        {
          title: "تشتت البيانات",
          desc: "تتوزع البيانات والعملاء والطلبات بين المحادثات والجداول والأنظمة المختلفة، مما يضعف وضوح القرار ويزيد احتمالية الأخطاء في التسعير والمتابعة."
        },
        {
          title: "دورة بيع أطول من اللازم",
          desc: "تأخر الموافقات، وتعدد المراسلات، والاعتماد اليدوي للاتفاقيات يحوّل كل فرصة بيعية إلى مسار بطيء يستهلك الوقت ويضعف سرعة الإغلاق."
        },
        {
          title: "فرص جاهزة تضيع",
          desc: "تتأخر الاستجابة للعميل المؤهل بسبب غياب البيانات المحدثة عن الأصول والمهام؛ فتضعف فرصة الإنجاز ويتجه العميل لمنافس أسرع."
        }
      ]
    },
    fix: {
      eyebrow: "الحل مع كانترا",
      title: "مع كانترا.. تتحول الفوضى الى تشغيل ذكي",
      description: "منصة موحدة تضع المشاريع، العملاء، الفرق والبيانات في مساحة واحدة؛ لتسريع التنفيذ، توحيد القرار، ورفع كفاءة التشغيل.",
      items: [
        {
          title: "المصدر الوحيد للحقيقة",
          desc: "جميع بيانات الأصول والعملاء متزامنة لحظياً وبشكل موحد. خطأ النقل المزدوج يساوي صفراً، والسجلات محدثة باستمرار للجميع."
        },
        {
          title: "إجراءات أسرع… وبيع أكثر انضباطًا",
          desc: "من تأهيل العميل إلى متابعة الطلب وإرسال العروض، تتحول الخطوات المتفرقة إلى مسار واضح يقلل التأخير ويرفع سرعة الإغلاق."
        },
        {
          title: "الاستجابة الفورية لكل عميل",
          desc: "العملاء خارج أوقات العمل يتلقون متابعة واضحة وخطوة قادمة جاهزة دون انتظار التسليم اليدوي بين الفرق."
        }
      ]
    }
  }
};

export function ProblemSection({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const pLabels = isAr ? copy.ar.painPoints : copy.en.painPoints;
  const fLabels = isAr ? copy.ar.fix : copy.en.fix;

  return (
    <div className="w-full">
      <PublicSection id="solutions" tone="very-dark" className="border-y border-[var(--q-border)]">
        <div className="space-y-16">
          <Reveal>
            <div className="max-w-4xl space-y-5">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-red-500/30" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-red-600 dark:text-red-400">{pLabels.eyebrow}</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-[var(--q-text-primary)] md:text-6xl rtl:leading-[1.25]">
                {pLabels.title}
              </h2>
              <p className="max-w-3xl text-base font-semibold leading-7 text-[var(--q-text-secondary)] md:text-lg rtl:leading-[1.8]">
                {pLabels.description}
              </p>
            </div>
          </Reveal>

          <div className="grid gap-x-12 gap-y-10 md:grid-cols-3 border-t border-[var(--q-border)] pt-12">
            {pLabels.items.map((item, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[var(--q-text-primary)] flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                    {item.title}
                  </h3>
                  <p className="text-sm font-semibold leading-relaxed text-[var(--q-text-secondary)] md:text-base rtl:leading-[1.7]">
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </PublicSection>

      <PublicSection id="the-fix" tone="secondary">
        <div className="space-y-16">
          <Reveal>
            <div className="max-w-4xl space-y-5">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-emerald-500/30" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-600 dark:text-emerald-400">{fLabels.eyebrow}</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-[var(--q-text-primary)] md:text-6xl rtl:leading-[1.25]">
                {fLabels.title}
              </h2>
              <p className="max-w-3xl text-base font-semibold leading-7 text-[var(--q-text-secondary)] md:text-lg rtl:leading-[1.8]">
                {fLabels.description}
              </p>
            </div>
          </Reveal>

          <div className="grid gap-x-12 gap-y-10 md:grid-cols-3 border-t border-[var(--q-border)] pt-12">
            {fLabels.items.map((item, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[var(--q-text-primary)] flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    {item.title}
                  </h3>
                  <p className="text-sm font-semibold leading-relaxed text-[var(--q-text-secondary)] md:text-base rtl:leading-[1.7]">
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </PublicSection>

    </div>
  );
}
