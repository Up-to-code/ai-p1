import { Marquee } from "@/components/ui/marquee";

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
  return (
    <div className="w-full border-y border-[var(--q-border)] bg-[var(--q-card)] py-8 md:py-10">
      <div className="mx-auto max-w-7xl overflow-hidden">
        <div className="flex items-center justify-center overflow-hidden">
          <Marquee
            className="w-full [--duration:38s] [--gap:3rem] [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
            dir="ltr"
            pauseOnHover
            repeat={3}
          >
            {toolBrands.map((tool) => (
              <span
                key={tool.name}
                className="flex items-center gap-2.5 whitespace-nowrap text-base font-semibold text-[var(--q-text-secondary)] grayscale transition duration-200 hover:text-[var(--q-text-primary)] hover:grayscale-0"
              >
                <img
                  alt=""
                  className="h-6 w-6 object-contain"
                  src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(tool.url)}&sz=128`}
                />
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
