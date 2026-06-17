"use client";

import { PublicSection } from "@/components/landing/public-landing-kit";
import { Reveal } from "@/components/landing/cinematic-motion";

const copy = {
  en: {
    painPoints: {
      eyebrow: "The Old Way of Working",
      title: "The Old Way of Working is Broken.",
      description: "You are a human doing machine work. Managing 10 different SaaS tools, chasing updates, and drowning in busywork. It's time to let it go.",
      items: [
        {
          title: "The SaaS Trap",
          desc: "You bought tools to save time, but now you spend all your time managing the tools. The context switching is destroying your focus."
        },
        {
          title: "Manual Chaos",
          desc: "Copy-pasting data, writing endless follow-ups, and updating statuses manually across disconnected systems."
        },
        {
          title: "Wasted Potential",
          desc: "Your team's talent is buried under administrative overhead instead of driving creative and strategic outcomes."
        }
      ]
    },
    fix: {
      eyebrow: "The New Paradigm",
      title: "Say Hello to Your New AI Teammate.",
      description: "Qentrah isn't just software; it's an intelligent agent that actively works alongside you. You set the direction, the AI handles the execution.",
      items: [
        {
          title: "Autonomous Execution",
          desc: "Hand off tasks and watch them get done. From organizing data to drafting communications, the agent handles the heavy lifting."
        },
        {
          title: "Unified Intelligence",
          desc: "One brain that understands your clients, projects, and goals. No more siloed data or disjointed context."
        },
        {
          title: "Human Leverage",
          desc: "Multiply your team's output without adding headcount. Let humans focus on strategy while the AI handles the operations."
        }
      ]
    }
  },
  ar: {
    painPoints: {
      eyebrow: "طريقة العمل القديمة",
      title: "العمل بالطريقة القديمة لم يعد مجدياً.",
      description: "أنت إنسان تقوم بعمل الآلات. تدير 10 أدوات مختلفة، وتطارد التحديثات، وتغرق في العمل الروتيني. حان الوقت للتخلص من ذلك.",
      items: [
        {
          title: "فخ التطبيقات",
          desc: "اشتريت أدوات لتوفير الوقت، لكنك الآن تقضي كل وقتك في إدارتها. التنقل بينها يدمر تركيزك."
        },
        {
          title: "الفوضى اليدوية",
          desc: "نسخ ولصق البيانات، كتابة رسائل متابعة لا تنتهي، وتحديث الحالات يدوياً عبر أنظمة منفصلة."
        },
        {
          title: "إهدار الإمكانيات",
          desc: "موهبة فريقك مدفونة تحت الأعباء الإدارية بدلاً من التركيز على النتائج الإبداعية والاستراتيجية."
        }
      ]
    },
    fix: {
      eyebrow: "النموذج الجديد",
      title: "رحب بزميلك الذكي الجديد.",
      description: "كانترا ليست مجرد برنامج؛ إنها وكيل ذكي يعمل جنباً إلى جنب معك. أنت تحدد الاتجاه، والذكاء الاصطناعي يتولى التنفيذ.",
      items: [
        {
          title: "تنفيذ ذاتي",
          desc: "سلم المهام وشاهدها تنجز. من تنظيم البيانات إلى صياغة الرسائل، الوكيل يتولى المهام الثقيلة."
        },
        {
          title: "ذكاء موحد",
          desc: "عقل واحد يفهم عملاءك، مشاريعك، وأهدافك. لا مزيد من البيانات المعزولة أو السياق المشتت."
        },
        {
          title: "مضاعفة قدرات البشر",
          desc: "ضاعف إنتاجية فريقك دون زيادة العدد. دع البشر يركزون على الاستراتيجية بينما يتولى الذكاء الاصطناعي العمليات."
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
              <h2 className="text-4xl font-bold tracking-tight text-[var(--q-text-primary)] dark:text-[var(--q-text-primary)] md:text-6xl rtl:leading-[1.25]">
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
                  <h3 className="text-xl font-bold text-[var(--q-text-primary)] dark:text-[var(--q-text-primary)] flex items-center gap-2">
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
              <h2 className="text-4xl font-bold tracking-tight text-[var(--q-text-primary)] dark:text-[var(--q-text-primary)] md:text-6xl rtl:leading-[1.25]">
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
                  <h3 className="text-xl font-bold text-[var(--q-text-primary)] dark:text-[var(--q-text-primary)] flex items-center gap-2">
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
