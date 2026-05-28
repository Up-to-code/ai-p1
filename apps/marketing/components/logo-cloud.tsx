import { Marquee } from "@/components/ui/marquee";
import { useLocale } from "next-intl";

const toolBrands = [
  { name: "WhatsApp", url: "https://www.whatsapp.com/" },
  { name: "Telegram", url: "https://telegram.org/" },
  { name: "n8n", url: "https://n8n.io/" },
  { name: "Zapier", url: "https://zapier.com" },
  { name: "Slack", url: "https://slack.com" },
  { name: "HubSpot", url: "https://www.hubspot.com/" },
  { name: "Google Sheets", url: "https://www.google.com/sheets/about/" },
  { name: "Airtable", url: "https://airtable.com/" },
  { name: "Notion", url: "https://www.notion.so/" },
  { name: "Webhooks", url: "https://webhook.site/" },
];

const LogoCloud = () => {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="w-full border-b border-zinc-200/70 px-6 py-12 dark:border-white/[0.08] md:py-16">
      <div className="mx-auto max-w-7xl overflow-hidden">
        <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 md:text-base">
          {isAr ? "يعمل مع أدواتك المفضلة" : "Works with your favorite tools"}
        </p>

        <div className="mt-8 flex items-center justify-center overflow-hidden">
          <Marquee
            className="w-full [--duration:34s] [--gap:1rem] [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]"
            dir="ltr"
            pauseOnHover
            repeat={4}
          >
            {toolBrands.map((tool) => (
              <span
                key={tool.name}
                className="flex h-12 items-center gap-3 rounded-full border border-zinc-200/80 bg-white px-4 text-sm font-bold text-zinc-700 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-zinc-950">
                  <img
                    alt=""
                    className="h-5 w-5"
                    src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(tool.url)}&sz=128`}
                  />
                </span>
                <span>{tool.name}</span>
              </span>
            ))}
          </Marquee>
        </div>
      </div>
    </div>
  );
};

export default LogoCloud;
