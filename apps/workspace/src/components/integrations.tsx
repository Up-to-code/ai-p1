import { useLocale } from "next-intl";

export default function Integrations() {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section id="resources" className="mx-auto flex max-w-7xl flex-col px-6 py-24 sm:py-32">
      <h2 className="text-center font-bold text-4xl tracking-tight sm:text-6xl text-zinc-950 dark:text-white">
        {isAr ? "متكامل مع منظومتك العقارية." : "Integrated with your ecosystem."}
      </h2>
      <p className="mt-6 text-center text-zinc-500 dark:text-zinc-400 text-lg sm:text-xl max-w-3xl mx-auto">
        {isAr 
          ? "اربط كانترا مع أدواتك المفضلة ومنصات التسويق العقاري لتبسيط سير العمل ومزامنة البيانات بشكل فوري."
          : "Connect Qentrah with your favorite tools and real estate marketing platforms to streamline workflows and sync data instantly."}
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
    title: "ROSHN",
    description: "National real estate developer in Saudi Arabia.",
    url: "https://www.roshn.sa/",
  },
  {
    title: "NEOM",
    description: "The land of the future, where innovation meets sustainability.",
    url: "https://www.neom.com/",
  },
  {
    title: "Bayut",
    description: "Leading real estate portal in the region.",
    url: "https://www.bayut.sa/",
  },
  {
    title: "Property Finder",
    description: "Search for properties for sale and rent.",
    url: "https://www.propertyfinder.sa/",
  },
  {
    title: "Slack",
    description: "Real-time team communication and inventory alerts.",
    url: "https://slack.com",
  },
  {
    title: "Zapier",
    description: "Automate your lead workflows and sync with CRM.",
    url: "https://zapier.com",
  },
];

const integrationsAr = [
  {
    title: "روشن",
    description: "المطور العقاري الوطني الرائد في المملكة العربية السعودية.",
    url: "https://www.roshn.sa/",
  },
  {
    title: "نيوم",
    description: "أرض المستقبل، حيث يلتقي الابتكار بالاستدامة.",
    url: "https://www.neom.com/",
  },
  {
    title: "بيوت",
    description: "البوابة العقارية الرائدة في المنطقة.",
    url: "https://www.bayut.sa/",
  },
  {
    title: "بروبرتي فايندر",
    description: "البحث عن عقارات للبيع وللإيجار بسهولة.",
    url: "https://www.propertyfinder.sa/",
  },
  {
    title: "سلاك",
    description: "تواصل فوري للفريق وتنبيهات المخزون المباشرة.",
    url: "https://slack.com",
  },
  {
    title: "زابيير",
    description: "أتمتة سير عمل العملاء والمزامنة مع نظام CRM.",
    url: "https://zapier.com",
  },
];
