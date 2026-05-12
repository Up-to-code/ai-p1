import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  Dumbbell,
  Gem,
  Headphones,
  MessageCircle,
  Network,
  Rocket,
  ShieldCheck,
  Slack,
  Sparkles,
  Workflow
} from "lucide-react";

import { getContent, type Locale } from "@/lib/content";

const productIcons = {
  workspace: Building2,
  partners: Code2
};

const logoNames = ["Logoipsum", "Logoipsum", "Logoipsum", "Logoipsum", "Logoipsum", "Logoipsum"];

const integrations = {
  en: [
    { name: "WhatsApp", description: "Conversations and lead follow-up in one operational context.", icon: MessageCircle },
    { name: "Boom", description: "Lead capture and campaign handoff into the workspace.", icon: Sparkles },
    { name: "Wafeer", description: "Operational sync for property and customer data.", icon: Gem },
    { name: "Zapier", description: "Automations between Anan and the tools your team already uses.", icon: Rocket },
    { name: "Slack", description: "Team notifications, approvals, and activity alerts.", icon: Slack },
    { name: "Hootsuite", description: "Social media workflow and publishing coordination.", icon: Headphones }
  ],
  ar: [
    { name: "واتساب", description: "المحادثات ومتابعة العملاء ضمن سياق تشغيلي واحد.", icon: MessageCircle },
    { name: "بوم", description: "التقاط العملاء المحتملين وتسليم الحملات إلى مساحة العمل.", icon: Sparkles },
    { name: "وفير", description: "مزامنة تشغيلية لبيانات العقارات والعملاء.", icon: Gem },
    { name: "زابير", description: "أتمتة بين أنان والأدوات التي يستخدمها فريقك بالفعل.", icon: Rocket },
    { name: "سلاك", description: "إشعارات الفريق والموافقات وتنبيهات النشاط.", icon: Slack },
    { name: "هوتسويت", description: "تنسيق تدفق النشر والعمل على الشبكات الاجتماعية.", icon: Headphones }
  ]
};

const pricing = {
  en: [
    {
      name: "Launch",
      price: "$79",
      description: "For teams starting with clean property and client operations.",
      features: ["Workspace and client records", "Basic integrations", "Team activity timeline", "Property operations"]
    },
    {
      name: "Operate",
      price: "$149",
      featured: true,
      description: "For teams that need approvals, partner access, and daily workflows.",
      features: ["Everything in Launch", "Partner OAuth integrations", "Advanced approvals", "Workflow automation"]
    },
    {
      name: "Institutional",
      price: "$299",
      description: "For larger organizations with multiple teams and governance needs.",
      features: ["Custom onboarding", "Advanced roles", "Priority support", "Compliance review"]
    }
  ],
  ar: [
    {
      name: "إطلاق",
      price: "$79",
      description: "للفرق التي تبدأ بتشغيل واضح للعقارات والعملاء.",
      features: ["سجلات مساحة العمل والعملاء", "تكاملات أساسية", "سجل نشاط الفريق", "تشغيل العقارات"]
    },
    {
      name: "تشغيل",
      price: "$149",
      featured: true,
      description: "للفرق التي تحتاج الموافقات ووصول الشركاء وتدفقات العمل اليومية.",
      features: ["كل ما في إطلاق", "تكاملات OAuth للشركاء", "موافقات متقدمة", "أتمتة سير العمل"]
    },
    {
      name: "مؤسسي",
      price: "$299",
      description: "للمؤسسات الأكبر ذات الفرق المتعددة واحتياجات الحوكمة.",
      features: ["تهيئة مخصصة", "أدوار متقدمة", "دعم أولوية", "مراجعة امتثال"]
    }
  ]
};

const faqs = {
  en: [
    ["Who is Anan for?", "Real estate teams, brokers, developers, and software partners who need one operational workspace."],
    ["How do integrations work?", "Approved partners use OAuth, scoped permissions, and Hub APIs. They never connect directly to the database."],
    ["Can I start with one team?", "Yes. Start with one workspace, then expand into more teams, permissions, and integrations."],
    ["Is this the same as the workspace app?", "This is the public brand site. The workspace app remains the product where teams do daily work."],
    ["Where do developers go?", "Developers use Anan Partners to register apps, request review, and build approved integrations."]
  ],
  ar: [
    ["لمن صممت أنان؟", "لفرق العقار والوسطاء والمطورين وشركاء البرمجيات الذين يحتاجون مساحة تشغيل واحدة."],
    ["كيف تعمل التكاملات؟", "يستخدم الشركاء المعتمدون OAuth وصلاحيات محددة وواجهات Hub، ولا يتصلون مباشرة بقاعدة البيانات."],
    ["هل يمكن البدء بفريق واحد؟", "نعم. ابدأ بمساحة عمل واحدة ثم توسع إلى فرق وصلاحيات وتكاملات أكثر."],
    ["هل هذا هو تطبيق مساحة العمل؟", "هذه صفحة العلامة العامة. تطبيق مساحة العمل يبقى المنتج الذي تنجز فيه الفرق العمل اليومي."],
    ["أين يذهب المطورون؟", "يستخدم المطورون بوابة شركاء أنان لتسجيل التطبيقات وطلب المراجعة وبناء التكاملات المعتمدة."]
  ]
};

const principles = {
  en: [
    {
      title: "Workspace-first data",
      description: "Organizations manage people, properties, clients, projects, and daily work from the main workspace.",
      icon: Workflow
    },
    {
      title: "Partner access by consent",
      description: "Approved partners connect through OAuth and scoped APIs instead of direct database access.",
      icon: ShieldCheck
    },
    {
      title: "One brand system",
      description: "Public pages, product surfaces, and developer flows share one Anan identity and policy layer.",
      icon: Network
    }
  ],
  ar: [
    {
      title: "البيانات تبدأ من مساحة العمل",
      description: "تدير المؤسسات الأشخاص والعقارات والعملاء والمشاريع والعمل اليومي من مساحة العمل الرئيسية.",
      icon: Workflow
    },
    {
      title: "وصول الشركاء بالموافقة",
      description: "يتصل الشركاء المعتمدون عبر OAuth وواجهات API محددة الصلاحيات بدلا من الوصول المباشر لقاعدة البيانات.",
      icon: ShieldCheck
    },
    {
      title: "نظام علامة واحد",
      description: "تتشارك الصفحات العامة وتجارب المنتج وتدفقات المطورين هوية أنان وطبقة السياسات نفسها.",
      icon: Network
    }
  ]
};

function buttonClass(variant: "primary" | "secondary" | "dark" = "primary") {
  if (variant === "secondary") {
    return "inline-flex h-14 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-8 text-[15px] font-bold text-zinc-950 backdrop-blur-xl transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10";
  }

  if (variant === "dark") {
    return "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-zinc-950 transition hover:bg-zinc-100";
  }

  return "inline-flex h-14 items-center justify-center gap-2 rounded-full bg-zinc-950 px-8 text-[15px] font-bold text-white shadow-2xl shadow-zinc-900/20 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200";
}

function LogoCloud({ isAr }: { isAr: boolean }) {
  return (
    <section className="border-y border-zinc-200/70 bg-zinc-50/70 px-6 py-10 dark:border-white/10 dark:bg-zinc-950/50">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {isAr ? "موثوق من فرق إدارة العقار والوسطاء" : "Trusted by real estate operators and partner teams"}
        </p>
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {logoNames.map((name, index) => (
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-zinc-500" key={`${name}-${index}`}>
              <span className={["bg-blue-300", "bg-emerald-400", "bg-orange-500", "bg-rose-400", "bg-violet-500", "bg-indigo-300"][index] + " size-7 rounded-full"} />
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductPreview({ isAr }: { isAr: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/75 p-4 shadow-2xl shadow-zinc-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
      <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-950 p-4 text-white dark:border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200">Anan Workspace</p>
            <h2 className="mt-2 text-2xl font-bold">{isAr ? "مكتب اليوم" : "Today desk"}</h2>
          </div>
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">
            {isAr ? "جاهز" : "Ready"}
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            [isAr ? "العملاء" : "Clients", "184"],
            [isAr ? "العقارات" : "Properties", "72"],
            [isAr ? "المهام" : "Tasks", "29"]
          ].map(([label, value]) => (
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4" key={label}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{label}</p>
              <p className="mt-4 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold">{isAr ? "تكامل شريك معتمد" : "Approved partner integration"}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                {isAr ? "وصول مؤسسي محدد الصلاحيات عبر OAuth." : "Scoped organization access through OAuth."}
              </p>
            </div>
            <Code2 className="size-8 text-blue-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProblemSection({ isAr }: { isAr: boolean }) {
  return (
    <section className="bg-white px-6 py-20 dark:bg-background md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-4 lg:order-first">
          {[0, 1, 2, 3].map((item) => (
            <div className="h-28 rounded-[24px] bg-zinc-100 dark:bg-white/10" key={item} />
          ))}
        </div>
        <div className="lg:ps-10">
          <h2 className="max-w-2xl text-4xl font-bold leading-[0.95] tracking-tight text-zinc-950 dark:text-white md:text-6xl rtl:leading-[1.15]">
            {isAr ? "العمل العقاري لا يجب أن يكون صعبا." : "Real estate work should not be this hard."}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-zinc-500 dark:text-zinc-400">
            {isAr
              ? "العمليات اليومية والبيانات المشتتة وبطء التنفيذ تجعل الشركات تخسر وقتا ثمينا. أنان يحول العمل إلى منظومة واحدة."
              : "Daily operations, scattered data, and slow handoffs cost teams real time. Anan turns the work into one operating system."}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {(isAr ? ["بيانات مشتتة", "تأخير الموافقات", "تكاملات صعبة"] : ["Scattered data", "Slow approvals", "Hard integrations"]).map((item) => (
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-500 dark:bg-red-500/10 dark:text-red-200" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function IntegrationsSection({ isAr }: { isAr: boolean }) {
  const items = integrations[isAr ? "ar" : "en"];

  return (
    <section className="bg-zinc-50/80 px-6 py-20 dark:bg-zinc-950/50 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold leading-none tracking-tight text-zinc-950 dark:text-white md:text-6xl rtl:leading-[1.18]">
            {isAr ? "متكامل مع منظومتك العقارية." : "Integrated with your real estate stack."}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-500 dark:text-zinc-400">
            {isAr
              ? "اربط أنان مع أدوات التسويق والعمليات لتبسيط سير العمل ومزامنة البيانات بشكل ذكي."
              : "Connect Anan with marketing and operations tools to simplify workflows and keep data in sync."}
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <article className="rounded-[24px] border border-zinc-200 bg-white p-7 dark:border-white/10 dark:bg-white/[0.04]" key={item.name}>
                <div className="mb-7 flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                    <Icon className="size-5" />
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">{item.name}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PricingSection({ isAr }: { isAr: boolean }) {
  const plans = pricing[isAr ? "ar" : "en"];

  return (
    <section className="bg-white px-6 py-20 dark:bg-background md:py-28" id="pricing">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-8 flex max-w-5xl flex-col gap-6 rounded-[28px] border border-blue-200 bg-white p-7 dark:border-blue-400/20 dark:bg-white/[0.04] md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-300">{isAr ? "الأسعار" : "Pricing"}</span>
            <h2 className="mt-3 text-3xl font-bold text-zinc-950 dark:text-white md:text-4xl">
              {isAr ? "اختر طبقة التشغيل المناسبة لفريقك الآن." : "Choose the operating layer that fits your team now."}
            </h2>
          </div>
          <div className="flex rounded-full bg-zinc-100 p-1 dark:bg-white/10">
            <span className="rounded-full bg-zinc-950 px-6 py-2 text-xs font-bold text-white dark:bg-white dark:text-zinc-950">{isAr ? "شهري" : "Monthly"}</span>
            <span className="px-6 py-2 text-xs font-bold text-zinc-500">{isAr ? "سنوي" : "Yearly"}</span>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article className={(plan.featured ? "border-blue-500 shadow-2xl shadow-blue-500/10 " : "border-zinc-200 ") + "rounded-[28px] border bg-white p-7 dark:border-white/10 dark:bg-white/[0.04]"} key={plan.name}>
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-zinc-950 dark:text-white">{plan.name}</h3>
                {plan.featured ? <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">{isAr ? "الأفضل" : "Popular"}</span> : null}
              </div>
              <p className="mt-4 min-h-12 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{plan.description}</p>
              <div className="my-6 rounded-2xl border border-zinc-200 p-5 dark:border-white/10">
                <span className="text-4xl font-black text-zinc-950 dark:text-white">{plan.price}</span>
                <span className="ms-2 text-sm text-zinc-400">{isAr ? "شهريا" : "monthly"}</span>
              </div>
              <a className={(plan.featured ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 " : "border border-zinc-200 text-zinc-950 dark:border-white/10 dark:text-white ") + "inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-bold"} href="#">
                {isAr ? "ابدأ الآن" : "Get started"}
              </a>
              <ul className="mt-7 space-y-3">
                {plan.features.map((feature) => (
                  <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300" key={feature}>
                    <Check className="size-4 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ isAr }: { isAr: boolean }) {
  const items = faqs[isAr ? "ar" : "en"];

  return (
    <section className="bg-white px-6 py-20 dark:bg-background md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1fr] lg:items-start">
        <div className="lg:order-last">
          <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600 dark:text-blue-300">{isAr ? "أسئلة شائعة" : "FAQ"}</span>
          <h2 className="mt-4 text-4xl font-bold leading-none tracking-tight text-zinc-950 dark:text-white md:text-6xl rtl:leading-[1.15]">
            {isAr ? "أسئلة قبل انتقال فريقك إلى مساحة العمل." : "Questions before your team moves into the workspace."}
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-7 text-zinc-500 dark:text-zinc-400">
            {isAr ? "إجابات مختصرة للمطورين والوسطاء والمديرين الذين يختبرون أنان." : "Short answers for developers, brokers, and operators evaluating Anan."}
          </p>
        </div>
        <div className="rounded-[24px] border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/[0.04]">
          {items.map(([question, answer], index) => (
            <details className="group border-b border-zinc-200 p-6 last:border-b-0 dark:border-white/10" key={question} open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-zinc-950 dark:text-white">
                {question}
                <ChevronDown className="size-4 shrink-0 text-zinc-400 transition group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-sm leading-7 text-zinc-500 dark:text-zinc-400">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ isAr, copy }: { isAr: boolean; copy: ReturnType<typeof getContent> }) {
  return (
    <section className="bg-zinc-50 px-6 py-20 dark:bg-zinc-950/50">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.16),transparent_34%),#071b4f] p-8 text-white md:p-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-200">{isAr ? "ابدأ مساحة العمل" : "Start the workspace"}</span>
            <h2 className="mt-5 text-4xl font-bold leading-none tracking-tight md:text-6xl rtl:leading-[1.15]">
              {isAr ? "ابدأ من المكان الذي يستمر فيه العمل الحقيقي." : "Start where the real work keeps going."}
            </h2>
            <p className="mt-5 text-sm leading-7 text-blue-100/80">
              {isAr ? "ادخل مساحة العمل أو تواصل مع الفريق لترتيب تشغيل أنان لفريقك." : "Open the workspace or talk with the team to set up Anan for your operation."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <a className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-bold text-zinc-950" href={copy.products[0].href}>{copy.home.primaryCta}</a>
            <a className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-bold text-white" href={copy.products[1].href}>{copy.home.secondaryCta}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomePage({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const isAr = locale === "ar";
  const principleCopy = principles[locale];

  return (
    <main className="flex-1" dir={isAr ? "rtl" : "ltr"}>
      <section className="relative overflow-hidden border-b border-zinc-200/70 pb-20 pt-28 dark:border-white/[0.08] md:pb-24 md:pt-32">
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(ellipse_at_top,rgba(11,92,255,0.24),transparent_66%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(11,92,255,0.34),transparent_68%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(11,92,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(11,92,255,0.05)_1px,transparent_1px)] bg-[size:80px_80px] opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_80%)] dark:opacity-20" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-12 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-4xl">
            <span className="inline-flex rounded-full border border-zinc-200 bg-white/60 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-blue-600 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-blue-300">
              {copy.home.eyebrow}
            </span>
            <h1 className="mt-6 text-[clamp(2.5rem,8vw,5.5rem)] font-bold leading-[0.95] tracking-tighter text-zinc-950 dark:text-white rtl:leading-[1.25] rtl:tracking-normal">
              {copy.home.title}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-xl">{copy.home.description}</p>
            <div className="mt-10 flex w-full flex-col gap-5 sm:w-auto sm:flex-row">
              <a className={buttonClass()} href={copy.products[0].href}>
                {copy.home.primaryCta}
                <ArrowRight className={isAr ? "size-4 rotate-180" : "size-4"} />
              </a>
              <a className={buttonClass("secondary")} href={copy.products[1].href}>
                {copy.home.secondaryCta}
              </a>
            </div>
          </div>
          <ProductPreview isAr={isAr} />
        </div>
      </section>

      <LogoCloud isAr={isAr} />
      <ProblemSection isAr={isAr} />
      <IntegrationsSection isAr={isAr} />
      <PricingSection isAr={isAr} />
      <FAQSection isAr={isAr} />

      <section className="px-5 py-20 md:py-32" id="products">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-zinc-200 dark:bg-white/10" />
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600 dark:text-blue-300">
                {isAr ? "منتجات أنان العامة" : "Anan public products"}
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-bold leading-none tracking-tight text-zinc-900 dark:text-white md:text-5xl">
              {isAr ? "نفس نظام أنان، بواجهات واضحة." : "One Anan system, clear product doors."}
            </h2>
            <p className="mt-5 max-w-2xl text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-base">
              {isAr
                ? "يعرض الموقع العام المنتجات التي يستخدمها العملاء والمطورون مباشرة، بدون أدوات داخلية أو تطبيقات عرض."
                : "The public site shows only the products customers and developers can use directly, without internal review tools or demo apps."}
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {copy.products.map((product) => {
              const Icon = productIcons[product.id];
              return (
                <article className="h-full overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/70 p-8 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]" key={product.id}>
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                      <Icon className="size-6" />
                    </span>
                    <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-bold text-zinc-500 dark:border-white/10 dark:text-zinc-300">{product.status}</span>
                  </div>
                  <h3 className="text-2xl font-bold">{product.name}</h3>
                  <p className="mt-3 text-base leading-7 text-zinc-500 dark:text-zinc-400">{product.description}</p>
                  <ul className="mt-6 space-y-3">
                    {product.bullets.map((bullet) => (
                      <li className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300" key={bullet}>
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-300" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <a className="mt-8 inline-flex h-12 items-center gap-2 rounded-full border border-zinc-200 px-7 text-sm font-bold text-zinc-950 transition hover:bg-zinc-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10" href={product.href}>
                    {product.cta}
                    <ArrowUpRight className="size-4 rtl:-rotate-90" />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 text-white dark:bg-background md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 md:grid-cols-3">
            {principleCopy.map((principle) => {
              const Icon = principle.icon;
              return (
                <article className="rounded-[2rem] border border-zinc-200 bg-zinc-950 p-6 text-white dark:border-white/10" key={principle.title}>
                  <Icon className="mb-4 size-7" />
                  <h3 className="text-lg font-bold">{principle.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{principle.description}</p>
                </article>
              );
            })}
          </div>
          <div className="mt-12 rounded-3xl border border-zinc-200 bg-zinc-950 p-8 dark:border-white/10">
            <Sparkles className="mb-5 size-8 text-blue-200" />
            <p className="max-w-2xl text-sm leading-7 text-zinc-300">
              {isAr
                ? "هذه الصفحة هي المدخل العام فقط. مساحة العمل تبقى مكان التشغيل، وبوابة الشركاء تبقى مكان المطورين والتكاملات."
                : "This page is only the public front door. Workspace remains the operating product, and Partners remains the developer and integration portal."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link className={buttonClass("dark")} href={`/${locale}/privacy`}>
                {copy.nav.privacy}
              </Link>
              <Link className={buttonClass("dark")} href={`/${locale}/terms`}>
                {copy.nav.terms}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FinalCTA isAr={isAr} copy={copy} />
    </main>
  );
}
