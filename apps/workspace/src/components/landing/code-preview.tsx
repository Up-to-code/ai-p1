import { useTranslations } from "next-intl";

export function CodePreview() {
  const t = useTranslations("Landing.codePreview");

  return (
    <section className="py-16 px-6 md:px-12 w-full max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-start space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight text-text-primary">
            {t("title")}
          </h2>
          <p className="text-lg text-text-secondary leading-relaxed">
            {t("description")}
          </p>
          <ul className="space-y-3 text-sm text-text-secondary">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t("api")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t("sdk")}
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t("webhooks")}
            </li>
          </ul>
        </div>
        
        <div className="flex-1 w-full">
          <div dir="ltr" className="overflow-hidden rounded-xl border border-border/40 bg-[#09090B] text-left shadow-none">
            <div className="flex items-center px-4 py-3 border-b border-[#27272A] bg-[#111111]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
              </div>
              <div className="mx-auto text-xs font-medium text-[#A1A1AA]">
                sync-property.ts
              </div>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre dir="ltr" className="text-left text-sm font-mono leading-relaxed">
                <code dir="ltr" className="text-left text-[#A1A1AA]">
<span className="text-[#3385FF]">import</span> {"{ AnandClient }"} <span className="text-[#3385FF]">from</span> <span className="text-[#22C55E]">'@anand/sdk'</span>;<br/><br/>
<span className="text-[#3385FF]">const</span> anand = <span className="text-[#3385FF]">new</span> AnandClient({"{"}<br/>
{"  "}apiKey: process.env.<span className="text-[#F4F4F5]">ANAND_API_KEY</span>,<br/>
{"}"});<br/><br/>
<span className="text-[#3385FF]">await</span> anand.properties.<span className="text-[#FCD34D]">submitClaim</span>({"{"}<br/>
{"  "}referenceId: <span className="text-[#22C55E]">'ryd-tw-402'</span>,<br/>
{"  "}city: <span className="text-[#22C55E]">'Riyadh'</span>,<br/>
{"  "}type: <span className="text-[#22C55E]">'Residential'</span>,<br/>
{"  "}details: {"{"}<br/>
{"    "}price: <span className="text-[#F4F4F5]">1200000</span>,<br/>
{"    "}areaSqM: <span className="text-[#F4F4F5]">145</span><br/>
{"  }"}<br/>
{"}"});
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
