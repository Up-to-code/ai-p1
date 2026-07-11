import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  CircleCheck,
  FileText,
  Inbox,
  Layers3,
  LockKeyhole,
  MessageSquareText,
  Network,
  Play,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

import { Link } from "@/i18n/routing";
import { type Locale, productUrls } from "@/lib/content";

type LandingCopy = {
  eyebrow: string;
  headline: string;
  highlight: string;
  intro: string;
  primary: string;
  secondary: string;
  proof: string[];
  trusted: string;
  systemEyebrow: string;
  systemTitle: string;
  systemBody: string;
  aiEyebrow: string;
  aiTitle: string;
  aiBody: string;
  aiPoints: string[];
  workflowEyebrow: string;
  workflowTitle: string;
  workflowBody: string;
  securityTitle: string;
  securityBody: string;
  finalTitle: string;
  finalBody: string;
};

const copy: Record<Locale, LandingCopy> = {
  en: {
    eyebrow: "The operating system for client work",
    headline: "Run the work.",
    highlight: "Keep the context.",
    intro: "Qentrah brings projects, clients, conversations, documents, and AI agents into one connected workspace—so your team can move without losing the thread.",
    primary: "Start building for free",
    secondary: "See how it works",
    proof: ["Free to start", "No credit card", "Built for real teams"],
    trusted: "One shared context for every team that delivers client work",
    systemEyebrow: "One connected system",
    systemTitle: "Your business should not live in twelve tabs.",
    systemBody: "Plan the work, serve clients, share knowledge, and automate handoffs from one source of truth.",
    aiEyebrow: "AI that works inside the work",
    aiTitle: "Give every team an agent that understands the assignment.",
    aiBody: "Qentrah agents inherit the right context and permissions. They can find answers, create work, update records, and move a process forward without becoming another disconnected chatbot.",
    aiPoints: ["Permission-aware by design", "Connected through MCP", "Auditable actions and scope"],
    workflowEyebrow: "From signal to shipped",
    workflowTitle: "A clear operating loop for every client engagement.",
    workflowBody: "Turn a request into coordinated work, keep the conversation attached, and give everyone—human or agent—the same current picture.",
    securityTitle: "Control the doorway, not just the dashboard.",
    securityBody: "Organization, space, and project boundaries carry through to agents and integrations. Share only the tools and data each workflow needs.",
    finalTitle: "Bring your work back together.",
    finalBody: "Start with one project. Connect the rest when you are ready.",
  },
  ar: {
    eyebrow: "نظام التشغيل لأعمال العملاء",
    headline: "أنجز العمل.",
    highlight: "واحتفظ بالسياق.",
    intro: "تجمع كانترا المشاريع والعملاء والمحادثات والمستندات ووكلاء الذكاء الاصطناعي في مساحة عمل واحدة مترابطة—ليتحرك فريقك دون أن يفقد خيط العمل.",
    primary: "ابدأ مجاناً",
    secondary: "شاهد كيف تعمل",
    proof: ["ابدأ مجاناً", "لا بطاقة ائتمانية", "مصممة للفرق الحقيقية"],
    trusted: "سياق مشترك واحد لكل فريق يقدّم عملاً للعملاء",
    systemEyebrow: "نظام واحد مترابط",
    systemTitle: "لا ينبغي لعملك أن يعيش في اثنتي عشرة علامة تبويب.",
    systemBody: "خطط للعمل، اخدم العملاء، شارك المعرفة، وأتمت التسليمات من مصدر حقيقة واحد.",
    aiEyebrow: "ذكاء اصطناعي يعمل داخل العمل",
    aiTitle: "امنح كل فريق وكيلاً يفهم المهمة.",
    aiBody: "يرث وكلاء كانترا السياق والصلاحيات المناسبة. يمكنهم إيجاد الإجابات وإنشاء العمل وتحديث السجلات ودفع العمليات للأمام دون أن يصبحوا روبوت محادثة منفصلاً آخر.",
    aiPoints: ["صلاحيات مدمجة في التصميم", "اتصال عبر MCP", "إجراءات ونطاقات قابلة للمراجعة"],
    workflowEyebrow: "من الإشارة إلى الإنجاز",
    workflowTitle: "حلقة تشغيل واضحة لكل تعامل مع عميل.",
    workflowBody: "حوّل الطلب إلى عمل منسق، وأبقِ المحادثة مرتبطة به، وامنح الجميع—الإنسان والوكيل—الصورة الحالية نفسها.",
    securityTitle: "تحكم في بوابة الدخول، لا في لوحة التحكم فقط.",
    securityBody: "تمتد حدود المؤسسة والمساحة والمشروع إلى الوكلاء والتكاملات. شارك فقط الأدوات والبيانات التي يحتاجها كل سير عمل.",
    finalTitle: "اجمع عملك من جديد.",
    finalBody: "ابدأ بمشروع واحد، واربط الباقي عندما تكون مستعداً.",
  },
  fr: {
    eyebrow: "Le système d’exploitation du travail client",
    headline: "Faites avancer le travail.",
    highlight: "Gardez le contexte.",
    intro: "Qentrah réunit projets, clients, conversations, documents et agents IA dans un espace connecté, pour que votre équipe avance sans perdre le fil.",
    primary: "Commencer gratuitement",
    secondary: "Voir comment ça marche",
    proof: ["Gratuit au départ", "Sans carte bancaire", "Conçu pour les vraies équipes"],
    trusted: "Un contexte partagé pour chaque équipe qui livre du travail client",
    systemEyebrow: "Un système connecté",
    systemTitle: "Votre entreprise ne devrait pas vivre dans douze onglets.",
    systemBody: "Planifiez, servez vos clients, partagez le savoir et automatisez les passages de relais depuis une source unique.",
    aiEyebrow: "L’IA au cœur du travail",
    aiTitle: "Donnez à chaque équipe un agent qui comprend la mission.",
    aiBody: "Les agents Qentrah héritent du bon contexte et des bonnes autorisations. Ils trouvent des réponses, créent du travail et font avancer les processus sans devenir un chatbot isolé de plus.",
    aiPoints: ["Autorisations intégrées", "Connexion via MCP", "Actions et périmètres auditables"],
    workflowEyebrow: "Du signal à la livraison",
    workflowTitle: "Une boucle opérationnelle claire pour chaque mission client.",
    workflowBody: "Transformez une demande en travail coordonné, gardez la conversation attachée et donnez à chacun la même vision à jour.",
    securityTitle: "Contrôlez la porte d’entrée, pas seulement le tableau de bord.",
    securityBody: "Les limites d’organisation, d’espace et de projet s’appliquent aussi aux agents et intégrations. Ne partagez que les outils et données nécessaires.",
    finalTitle: "Réunissez enfin votre travail.",
    finalBody: "Commencez par un projet. Connectez le reste quand vous êtes prêt.",
  },
};

const featureCards = [
  { icon: Layers3, title: "Projects", body: "Plans, owners, timelines, and delivery views that stay aligned." },
  { icon: Users, title: "Clients", body: "Relationships, opportunities, requests, and delivery in one history." },
  { icon: MessageSquareText, title: "Conversations", body: "Decisions stay attached to the work they change." },
  { icon: FileText, title: "Documents", body: "Living knowledge connected to projects and customers." },
  { icon: Workflow, title: "Automations", body: "Reliable handoffs that remove repetitive coordination." },
  { icon: Bot, title: "Agents", body: "Scoped teammates that can read context and take approved action." },
];

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-[radial-gradient(circle_at_50%_50%,rgba(79,128,255,.2),transparent_68%)] blur-2xl" />
      <div className="overflow-hidden rounded-[1.35rem] border border-white/12 bg-[#0c0d10] shadow-[0_40px_120px_rgba(0,0,0,.45)]">
        <div className="flex h-11 items-center gap-2 border-b border-white/10 px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" /><span className="h-2.5 w-2.5 rounded-full bg-white/20" /><span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <div className="mx-auto flex h-6 w-48 items-center justify-center rounded-md bg-white/6 text-[9px] font-medium text-white/35">workspace.qentrah.com</div>
        </div>
        <div className="grid min-h-[420px] grid-cols-[54px_1fr] md:grid-cols-[64px_230px_1fr]">
          <aside className="border-e border-white/8 bg-white/[.025] p-3">
            <div className="mb-7 grid h-8 w-8 place-items-center rounded-lg bg-white text-xs font-black text-black">Q</div>
            <div className="space-y-4 text-white/35">{[Inbox, Layers3, Users, FileText, Bot].map((Icon, index) => <Icon key={index} className={`h-4 w-4 ${index === 1 ? "text-white" : ""}`} />)}</div>
          </aside>
          <aside className="hidden border-e border-white/8 p-5 md:block">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/35">Northstar Studio</p>
            <p className="mt-6 text-sm font-semibold text-white">Client delivery</p>
            <div className="mt-4 space-y-1 text-xs text-white/45">
              {['Overview', 'Projects', 'Clients', 'Documents', 'Team'].map((item, index) => <div key={item} className={`rounded-lg px-3 py-2.5 ${index === 1 ? "bg-white/8 text-white" : ""}`}>{item}</div>)}
            </div>
            <div className="mt-10 rounded-xl border border-white/8 bg-white/[.03] p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-white"><Sparkles className="h-3.5 w-3.5 text-violet-400" />Qentrah agent</div>
              <p className="mt-2 text-[10px] leading-4 text-white/40">3 tasks prepared from the client call.</p>
            </div>
          </aside>
          <div className="p-5 md:p-7">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs text-white/35">Monday, July 11</p><h3 className="mt-1 text-xl font-semibold text-white">Good morning, team.</h3></div><button className="rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-black">New project</button></div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[['Active work','12'],['Due this week','08'],['At risk','02']].map(([label,value]) => <div key={label} className="rounded-xl border border-white/8 bg-white/[.035] p-4"><p className="text-[10px] text-white/35">{label}</p><p className="mt-3 text-2xl font-semibold text-white">{value}</p></div>)}
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-[1.3fr_.7fr]">
              <div className="rounded-xl border border-white/8 bg-white/[.035] p-4"><div className="flex justify-between"><p className="text-xs font-semibold text-white">Delivery pulse</p><p className="text-[10px] text-emerald-400">+18% this month</p></div><div className="mt-8 flex h-28 items-end gap-2">{[42,58,47,72,63,88,82,100].map((height,index)=><div key={index} className="flex-1 rounded-t bg-gradient-to-t from-blue-500/25 to-blue-400" style={{height:`${height}%`}} />)}</div></div>
              <div className="rounded-xl border border-white/8 bg-white/[.035] p-4"><p className="text-xs font-semibold text-white">Next actions</p><div className="mt-4 space-y-3">{['Approve campaign brief','Send client update','Review launch checklist'].map((item,index)=><div key={item} className="flex gap-2 text-[10px] leading-4 text-white/55"><CircleCheck className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${index===0?'text-emerald-400':'text-white/20'}`} />{item}</div>)}</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QentrahLandingPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <div className="overflow-hidden bg-[var(--marketing-canvas)] text-[var(--q-text-primary)]">
      <section className="relative isolate min-h-screen px-6 pb-24 pt-36 md:pt-44">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_0%,rgba(79,128,255,.15),transparent_38%)]" />
        <div className="absolute inset-0 -z-10 opacity-35 [background-image:linear-gradient(var(--marketing-grid)_1px,transparent_1px),linear-gradient(90deg,var(--marketing-grid)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--q-border)] bg-[var(--q-card)]/75 px-4 py-2 text-[10px] font-bold uppercase tracking-[.22em] text-[var(--q-text-secondary)] shadow-sm backdrop-blur"><Sparkles className="h-3.5 w-3.5 text-[var(--q-info)]" />{t.eyebrow}</div>
          <h1 className="mx-auto mt-8 max-w-5xl text-balance text-5xl font-black tracking-[-.055em] md:text-7xl lg:text-[6.3rem] lg:leading-[.95] rtl:tracking-normal rtl:leading-[1.1]">{t.headline}<br/><span className="bg-gradient-to-r from-[#4f80ff] via-[#8a5cff] to-[#00a3ff] bg-clip-text text-transparent">{t.highlight}</span></h1>
          <p className="mx-auto mt-7 max-w-2xl text-balance text-base font-medium leading-8 text-[var(--q-text-secondary)] md:text-lg">{t.intro}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={productUrls.workspace} className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--q-text-primary)] px-6 text-xs font-black uppercase tracking-[.13em] text-[var(--q-bg)] transition hover:scale-[1.02]">{t.primary}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" /></Link>
            <a href="#platform" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[var(--q-border)] bg-[var(--q-card)] px-6 text-xs font-bold text-[var(--q-text-primary)] transition hover:bg-[var(--q-card-hover)]"><Play className="h-3.5 w-3.5 fill-current" />{t.secondary}</a>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] font-medium text-[var(--q-text-muted)]">{t.proof.map(item=><span key={item} className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" />{item}</span>)}</div>
          <div className="mt-16"><ProductPreview /></div>
        </div>
      </section>

      <section className="border-y border-[var(--q-border)] bg-[var(--q-bg-secondary)] px-6 py-10"><p className="mx-auto max-w-7xl text-center text-xs font-bold uppercase tracking-[.22em] text-[var(--q-text-muted)]">{t.trusted}</p><div className="mx-auto mt-7 flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-5 text-lg font-black tracking-tight text-[var(--q-text-primary)]/40"><span>STUDIO</span><span>NORTHSTAR</span><span>MERIDIAN</span><span>FORM</span><span>OCTAVE</span></div></section>

      <section id="platform" className="px-6 py-24 md:py-36"><div className="mx-auto max-w-7xl"><div className="max-w-3xl"><p className="text-[10px] font-black uppercase tracking-[.28em] text-[var(--q-info)]">{t.systemEyebrow}</p><h2 className="mt-5 text-balance text-4xl font-black tracking-[-.04em] md:text-6xl rtl:tracking-normal">{t.systemTitle}</h2><p className="mt-5 max-w-2xl text-base leading-8 text-[var(--q-text-secondary)]">{t.systemBody}</p></div><div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[var(--q-border)] bg-[var(--q-border)] md:grid-cols-2 lg:grid-cols-3">{featureCards.map(({icon:Icon,title,body})=><article key={title} className="group bg-[var(--q-card)] p-7 transition hover:bg-[var(--q-card-hover)] md:p-9"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--q-bg-secondary)]"><Icon className="h-5 w-5" /></div><h3 className="mt-7 text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-7 text-[var(--q-text-secondary)]">{body}</p><ChevronRight className="mt-7 h-4 w-4 text-[var(--q-text-muted)] transition group-hover:translate-x-1 rtl:rotate-180" /></article>)}</div></div></section>

      <section className="bg-[#0a0a0c] px-6 py-24 text-white md:py-36"><div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2"><div><p className="text-[10px] font-black uppercase tracking-[.28em] text-violet-400">{t.aiEyebrow}</p><h2 className="mt-5 text-balance text-4xl font-black tracking-[-.04em] md:text-6xl rtl:tracking-normal">{t.aiTitle}</h2><p className="mt-6 text-base leading-8 text-white/55">{t.aiBody}</p><div className="mt-8 space-y-3">{t.aiPoints.map(item=><div key={item} className="flex items-center gap-3 text-sm font-semibold text-white/80"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400/10"><Check className="h-3.5 w-3.5 text-emerald-400" /></span>{item}</div>)}</div></div><div className="relative rounded-2xl border border-white/10 bg-white/[.035] p-5 shadow-2xl md:p-7"><div className="flex items-center gap-3 border-b border-white/10 pb-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15"><Bot className="h-5 w-5 text-violet-400" /></div><div><p className="text-sm font-semibold">Delivery agent</p><p className="text-[10px] text-emerald-400">Active · Project scoped</p></div></div><div className="mt-6 space-y-4"><div className="ms-auto max-w-[85%] rounded-2xl rounded-ee-sm bg-white px-4 py-3 text-xs leading-5 text-black">Prepare the launch plan from today’s client feedback.</div><div className="max-w-[90%] rounded-2xl rounded-es-sm bg-white/7 px-4 py-3 text-xs leading-5 text-white/65">I found 6 decisions in the call notes. I created the launch milestone, drafted 4 tasks, and flagged one timeline risk for approval.</div><div className="grid gap-2 sm:grid-cols-2">{['Launch milestone created','4 tasks ready to review'].map(item=><div key={item} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.025] p-3 text-[10px] text-white/55"><CircleCheck className="h-3.5 w-3.5 text-emerald-400" />{item}</div>)}</div></div></div></div></section>

      <section className="px-6 py-24 md:py-36"><div className="mx-auto max-w-7xl"><div className="grid items-end gap-8 md:grid-cols-2"><div><p className="text-[10px] font-black uppercase tracking-[.28em] text-[var(--q-info)]">{t.workflowEyebrow}</p><h2 className="mt-5 text-balance text-4xl font-black tracking-[-.04em] md:text-6xl rtl:tracking-normal">{t.workflowTitle}</h2></div><p className="text-base leading-8 text-[var(--q-text-secondary)] md:pb-2">{t.workflowBody}</p></div><div className="mt-14 grid gap-4 md:grid-cols-4">{[[Inbox,'01','Capture'],[Sparkles,'02','Understand'],[Network,'03','Coordinate'],[CircleCheck,'04','Deliver']].map(([Icon,num,label],index)=><div key={String(label)} className="relative rounded-2xl border border-[var(--q-border)] bg-[var(--q-card)] p-6"><span className="text-[10px] font-bold text-[var(--q-text-muted)]">{String(num)}</span><div className="mt-10 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--q-bg-secondary)]"><Icon className="h-4 w-4" /></div><h3 className="mt-5 text-lg font-bold">{String(label)}</h3>{index<3&&<ArrowRight className="absolute -end-3 top-1/2 z-10 hidden h-5 w-5 text-[var(--q-text-muted)] md:block rtl:rotate-180" />}</div>)}</div></div></section>

      <section className="px-6 pb-24 md:pb-36"><div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-[var(--q-border)] bg-[var(--q-bg-secondary)] lg:grid-cols-[.8fr_1.2fr]"><div className="p-8 md:p-12"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--q-text-primary)] text-[var(--q-bg)]"><LockKeyhole className="h-6 w-6" /></div><h2 className="mt-8 text-3xl font-black tracking-tight md:text-4xl">{t.securityTitle}</h2><p className="mt-5 text-sm leading-7 text-[var(--q-text-secondary)]">{t.securityBody}</p></div><div className="grid gap-px bg-[var(--q-border)] sm:grid-cols-3">{[['Organization','Your company boundary'],['Space','Your team boundary'],['Project','Your delivery boundary']].map(([title,body],index)=><div key={title} className="flex min-h-52 flex-col justify-between bg-[var(--q-card)] p-7"><span className="text-5xl font-black text-[var(--q-text-primary)]/8">0{index+1}</span><div><p className="font-bold">{title}</p><p className="mt-2 text-xs leading-5 text-[var(--q-text-muted)]">{body}</p></div></div>)}</div></div></section>

      <section className="px-6 pb-24"><div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[var(--q-text-primary)] px-7 py-16 text-center text-[var(--q-bg)] md:px-12 md:py-24"><div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_20%_20%,#4f80ff,transparent_35%),radial-gradient(circle_at_80%_80%,#8a5cff,transparent_35%)]" /><div className="relative"><h2 className="mx-auto max-w-3xl text-balance text-4xl font-black tracking-[-.04em] md:text-6xl rtl:tracking-normal">{t.finalTitle}</h2><p className="mx-auto mt-5 max-w-xl text-sm leading-7 opacity-60">{t.finalBody}</p><Link href={productUrls.workspace} className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-[var(--q-bg)] px-6 text-xs font-black uppercase tracking-[.13em] text-[var(--q-text-primary)] transition hover:scale-[1.02]">{t.primary}<ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link></div></div></section>
    </div>
  );
}
