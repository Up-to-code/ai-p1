"use client";

import { PublicSection } from "@/components/landing/public-landing-kit";
import { Reveal } from "@/components/landing/cinematic-motion";

const copy = {
  en: {
    painPoints: {
      eyebrow: "The Pain Points",
      title: "Real estate shouldn't be this hard.",
      description: "Manual processes, scattered data, and slow execution are costing you growth. Fragmented workflows are the invisible tax on your business.",
      items: [
        {
          title: "Scattered Data",
          desc: "Pricing and data live in disconnected WhatsApp chats, Excel spreadsheets, and old CRMs, leading to manual copying errors and constant unit pricing mismatches."
        },
        {
          title: "Slow Execution",
          desc: "Contracts and agreements wait for manual signature, and price confirmations take days of redundant messaging, pending emails, and phone follow-ups."
        },
        {
          title: "Lost Opportunities",
          desc: "Qualified client requests expire or buyers go to faster competitors because brokers lack instant, updated access to property availability and inventory data."
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
          desc: "All inventory and client data are synchronized in real-time. Double-copy errors are zero, and pricing is locked and continuously updated for everyone."
        },
        {
          title: "2.4-Second Pipeline",
          desc: "AI verifies unit details in real-time and dispatches agreements directly to clients via WhatsApp for e-signature within seconds."
        },
        {
          title: "Zero Lead Leakage",
          desc: "Clients receive interactive brochures automatically within 30 seconds—even outside business hours—with instant tour booking to secure deals immediately."
        }
      ]
    }
  },
  ar: {
    painPoints: {
      eyebrow: "التحديات التشغيلية",
      title: "التشغيل العقاري لا ينبغي أن يُدار بالتعقيد",
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
          desc: "تتأخر الاستجابة للعميل المؤهل بسبب غياب البيانات المحدثة عن الوحدات والمخزون؛ فتضعف فرصة الإغلاق ويتجه العميل لمنافس أسرع."
        }
      ]
    },
    fix: {
      eyebrow: "الحل مع كانترا",
      title: "مع كانترا.. تتحول الفوضى الى تشغيل ذكي",
      description: "منصة موحدة تضع المشاريع، العملاء، الوسطاء والبيانات في مساحة واحدة؛ لتسريع البيع، توحيد القرار، ورفع كفاءة التشغيل من أول تواصل حتى إغلاق الصفقة.",
      items: [
        {
          title: "المصدر الوحيد للحقيقة",
          desc: "جميع بيانات الوحدات والعملاء متزامنة لحظياً وبشكل موحد. خطأ في النقل المزدوج يساوي صفراً، والأسعار مقفلة ومحدثة باستمرار للجميع."
        },
        {
          title: "إجراءات أسرع… وبيع أكثر انضباطًا",
          desc: "من تأهيل العميل إلى متابعة الطلب وإرسال العروض، تتحول الخطوات المتفرقة إلى مسار واضح يقلل التأخير ويرفع سرعة الإغلاق."
        },
        {
          title: "الاستجابة الفورية لكل عميل",
          desc: "العملاء خارج أوقات العمل يتلقون بروشوراً تفاعلياً خلال ٣٠ ثانية ويحجزون المعاينة فوراً لتأمين وإغلاق الصفقات العقارية دون أي تسريب للفرص."
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
      <PublicSection id="solutions" tone="muted" className="border-y border-zinc-200/50 dark:border-white/[0.04]">
        <div className="space-y-16">
          <Reveal>
            <div className="max-w-4xl space-y-5">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-red-500/30" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-red-600 dark:text-red-400">{pLabels.eyebrow}</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-white md:text-6xl rtl:leading-[1.25]">
                {pLabels.title}
              </h2>
              <p className="max-w-3xl text-base font-semibold leading-7 text-zinc-700 dark:text-zinc-300 md:text-lg rtl:leading-[1.8]">
                {pLabels.description}
              </p>
            </div>
          </Reveal>

          <div className="grid gap-x-12 gap-y-10 md:grid-cols-3 border-t border-zinc-200/50 dark:border-white/[0.04] pt-12">
            {pLabels.items.map((item, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                    {item.title}
                  </h3>
                  <p className="text-sm font-semibold leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-base rtl:leading-[1.7]">
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </PublicSection>

      <PublicSection id="the-fix" tone="default">
        <div className="space-y-16">
          <Reveal>
            <div className="max-w-4xl space-y-5">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-emerald-500/30" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-600 dark:text-emerald-400">{fLabels.eyebrow}</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-white md:text-6xl rtl:leading-[1.25]">
                {fLabels.title}
              </h2>
              <p className="max-w-3xl text-base font-semibold leading-7 text-zinc-700 dark:text-zinc-300 md:text-lg rtl:leading-[1.8]">
                {fLabels.description}
              </p>
            </div>
          </Reveal>

          <div className="grid gap-x-12 gap-y-10 md:grid-cols-3 border-t border-zinc-200/50 dark:border-white/[0.04] pt-12">
            {fLabels.items.map((item, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    {item.title}
                  </h3>
                  <p className="text-sm font-semibold leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-base rtl:leading-[1.7]">
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
