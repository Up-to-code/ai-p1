import { useLocale } from "next-intl";

export default function Integrations() {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section id="resources" className="mx-auto flex max-w-7xl flex-col px-6 py-24 sm:py-32">
      <h2 className="text-center font-bold text-4xl tracking-tight sm:text-6xl text-zinc-950 dark:text-white">
        {isAr ? "سلاسل وأتمتة مع أدواتك اليومية." : "Chains and automations for your daily tools."}
      </h2>
      <p className="mt-6 text-center text-zinc-500 dark:text-zinc-400 text-lg sm:text-xl max-w-3xl mx-auto">
        {isAr 
          ? "اربط واتساب وتيليجرام وn8n وزابيير وغيرها لتشغيل المتابعات، إرسال التنبيهات، ومزامنة البيانات تلقائياً."
          : "Connect WhatsApp, Telegram, n8n, Zapier, and more to run follow-ups, send alerts, and sync data automatically."}
      </p>
      <div className="mt-16 grid grid-cols-1 gap-6 sm:mt-24 sm:grid-cols-2 lg:grid-cols-3">
        {(isAr ? integrationsAr : integrationsEn).map((integration) => (
          <div
            className="relative flex flex-col items-start overflow-hidden border border-zinc-200 bg-white dark:border-white/5 dark:bg-zinc-900/40 rounded-[2.5rem] transition-all hover:shadow-2xl"
            key={integration.title}
          >
            <div className="absolute inset-x-0 top-7 h-9.5 border-y border-dashed border-zinc-100 dark:border-white/5" />
            <div className="absolute inset-y-0 left-7 w-9.5 border-x border-dashed border-zinc-100 dark:border-white/5" />

            <div className="relative isolate flex items-start justify-between gap-5 p-10">
              <div className="w-fit shrink-0 rounded-3xl bg-transparent p-1">
                <div className="relative h-12 w-12 flex items-center justify-center rounded-2xl border bg-white dark:bg-zinc-800 dark:border-white/10">
                  <img
                    alt={integration.title}
                    className="absolute inset-0 size-10 blur-[36px] opacity-20"
                    src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(integration.url)}&sz=128`}
                  />
                  <img
                    alt={integration.title}
                    className="size-8"
                    src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(integration.url)}&sz=128`}
                  />
                </div>
              </div>
              <div>
                <h3 className="py-2 font-bold text-xl text-zinc-950 dark:text-white">
                  {integration.title}
                </h3>
                <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                  {integration.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const integrationsEn = [
  {
    title: "WhatsApp",
    description: "Send lead updates, viewing reminders, and client follow-ups from automated chains.",
    url: "https://www.whatsapp.com/",
  },
  {
    title: "Telegram",
    description: "Route instant team alerts, bot messages, and operational approvals.",
    url: "https://telegram.org/",
  },
  {
    title: "n8n",
    description: "Build custom automation chains between Qentrah, CRMs, sheets, and internal tools.",
    url: "https://n8n.io/",
  },
  {
    title: "Zapier",
    description: "Trigger no-code automations for new leads, tasks, contacts, and pipeline updates.",
    url: "https://zapier.com",
  },
  {
    title: "Slack",
    description: "Push deal activity, inventory changes, and task alerts into team channels.",
    url: "https://slack.com",
  },
  {
    title: "Webhooks",
    description: "Connect any private system with secure event-based automation endpoints.",
    url: "https://webhook.site/",
  },
];

const integrationsAr = [
  {
    title: "واتساب",
    description: "إرسال تحديثات العملاء، تذكيرات المعاينات، والمتابعات من سلاسل تلقائية.",
    url: "https://www.whatsapp.com/",
  },
  {
    title: "تيليجرام",
    description: "تنبيهات فورية للفريق، رسائل بوت، وموافقات تشغيلية داخل المحادثات.",
    url: "https://telegram.org/",
  },
  {
    title: "n8n",
    description: "بناء سلاسل أتمتة مخصصة بين كانترا وCRM والجداول والأدوات الداخلية.",
    url: "https://n8n.io/",
  },
  {
    title: "زابيير",
    description: "تشغيل أتمتة بدون كود للعملاء الجدد والمهام وجهات الاتصال وتحديثات المسار.",
    url: "https://zapier.com",
  },
  {
    title: "سلاك",
    description: "إرسال نشاط الصفقات وتغييرات المخزون وتنبيهات المهام إلى قنوات الفريق.",
    url: "https://slack.com",
  },
  {
    title: "Webhooks",
    description: "ربط أي نظام خاص بنقاط أتمتة آمنة تعتمد على الأحداث.",
    url: "https://webhook.site/",
  },
];
