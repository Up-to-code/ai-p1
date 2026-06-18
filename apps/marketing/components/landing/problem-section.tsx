"use client";

import { PublicSection } from "@/components/landing/public-landing-kit";
import { Reveal } from "@/components/landing/cinematic-motion";

const copy = {
  en: {
    painPoints: {
      tagline: "40% of work is lost in context \u2014 and AI is lost without it",
      description: "Work sprawl is killing context and destroying your team's productivity.",
      items: [
        {
          stat: "40%",
          title: "Context Switching",
          desc: "Teams waste up to 40% of their day constantly switching between 10+ disjointed SaaS apps just to find context."
        },
        {
          stat: "3 Hours",
          title: "Manual Chaos",
          desc: "Employees spend an average of 3 hours every single day searching for information and manually syncing statuses."
        },
        {
          stat: "85%",
          title: "AI Failure",
          desc: "85% of companies fail to get value from AI because it lacks the unified workspace context needed to execute tasks."
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
      tagline: "40% من العمل يضيع في فوضى التطبيقات — والذكاء الاصطناعي يضيع بدون سياق",
      description: "فوضى التطبيقات تدمر السياق وتقضي على إنتاجية فريقك بالكامل.",
      items: [
        {
          stat: "40%",
          title: "تشتت الانتباه",
          desc: "تهدر الفرق ما يصل إلى 40٪ من يومها في التنقل المستمر بين أكثر من 10 تطبيقات منفصلة للبحث عن المعلومات."
        },
        {
          stat: "3 ساعات",
          title: "الفوضى اليدوية",
          desc: "يقضي الموظفون ما معدله 3 ساعات يومياً في البحث عن البيانات وتحديث الحالات يدوياً بين الأنظمة."
        },
        {
          stat: "85%",
          title: "فشل الذكاء الاصطناعي",
          desc: "85٪ من الشركات تفشل في الاستفادة من الذكاء الاصطناعي لأنه يفتقر إلى مساحة عمل موحدة لفهم السياق."
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
      <PublicSection id="solutions" tone="very-dark" className="border-y border-zinc-200/50 dark:border-white/[0.04]">
        <div className="flex flex-col items-center text-center space-y-24">
          <Reveal>
            <div className="max-w-4xl space-y-6 mx-auto">
              <h2 className="text-4xl font-bold tracking-tight text-[var(--q-text-primary)] dark:text-[var(--q-text-primary)] md:text-6xl lg:text-7xl rtl:leading-[1.25]">
                {pLabels.tagline}
              </h2>
              <p className="mx-auto max-w-2xl text-lg font-medium text-zinc-600 dark:text-zinc-400 md:text-xl rtl:leading-[1.8]">
                {pLabels.description}
              </p>
            </div>
          </Reveal>

          <div className="grid w-full gap-8 md:grid-cols-3">
            {pLabels.items.map((item, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="group relative overflow-hidden rounded-3xl bg-zinc-50 border border-zinc-200 p-8 text-left transition-all hover:shadow-lg dark:bg-zinc-900/50 dark:border-zinc-800">
                  <div className="mb-8 text-4xl font-black text-[var(--q-text-primary)] md:text-5xl">
                    {item.stat}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-[var(--q-text-primary)]">
                    {item.title}
                  </h3>
                  <p className="text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </PublicSection>

      <PublicSection id="the-fix" tone="light">
        <div className="space-y-16">
          <Reveal>
            <div className="max-w-4xl space-y-5">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[var(--q-accent)]/30" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--q-accent)] dark:text-[var(--q-accent)]">{fLabels.eyebrow}</span>
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
                    <span className="h-2 w-2 rounded-full bg-[var(--q-accent)] shrink-0" />
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
