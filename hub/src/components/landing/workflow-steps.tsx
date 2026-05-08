import { Building2, Briefcase, Users, Terminal, CheckCircle2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export function WorkflowSteps() {
  const t = useTranslations("Landing.workflow");

  return (
    <section className="py-24 px-6 md:px-12 w-full max-w-6xl mx-auto mt-16">
      <div className="text-center mb-24">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-text-primary mb-6">
          {t("title")}
        </h2>
        <p className="text-lg text-text-secondary max-w-3xl mx-auto leading-relaxed">
          {t("description")}
        </p>
      </div>

      <div className="flex flex-col gap-24 md:gap-32 relative">
        
        {/* Central Connecting Line */}
        <div className="hidden md:block absolute start-1/2 top-0 bottom-0 w-[1px] bg-border/40 -translate-x-1/2" />

        {/* 1. Developer */}
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 relative z-10">
          <div className="md:w-1/2 md:text-end flex flex-col items-start md:items-end order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border/60 text-xs font-medium text-text-secondary mb-4 shadow-none">
              <Building2 className="w-3 h-3" />
              {t("developer.persona")}
            </div>
            <h3 className="text-2xl font-semibold text-text-primary mb-4">{t("developer.title")}</h3>
            <p className="text-text-secondary leading-relaxed mb-6">
              <strong className="text-text-primary block mb-1">{t("painPoint")}</strong>
              {t("developer.pain")}
            </p>
            <p className="text-text-secondary leading-relaxed">
              <strong className="text-text-primary block mb-1">{t("howItWorks")}</strong>
              {t("developer.solution")}
            </p>
          </div>
          <div className="md:w-1/2 order-1 md:order-2 w-full">
            <div className="bg-surface/50 border border-border/60 rounded-xl p-6 shadow-none relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
                 <span className="text-sm font-medium text-text-primary">{t("developer.visualTitle")}</span>
                 <span className="text-xs text-text-muted">Unit A-402</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <XCircle className="w-4 h-4 text-error" />
                  <span className="line-through opacity-70">{t("developer.oldState")}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-text-primary bg-background p-2 rounded border border-border/40 shadow-none">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>{t("developer.newState")}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/40">
                <div dir="ltr" className="flex items-center gap-2 text-left text-xs font-mono text-text-muted">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {t("developer.pushing")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Broker */}
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 relative z-10">
          <div className="md:w-1/2 w-full order-1">
             <div className="bg-surface/50 border border-border/60 rounded-xl p-6 shadow-none relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
                 <span className="text-sm font-medium text-text-primary">{t("broker.visualTitle")}</span>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between bg-background p-3 rounded border border-border/40 shadow-none">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-surface border border-border/60 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-text-muted" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-text-primary">{t("broker.propertyId", { id: 9040 + i })}</span>
                        <span className="text-xs text-text-muted">{t("broker.synced")}</span>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="md:w-1/2 flex flex-col items-start order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border/60 text-xs font-medium text-text-secondary mb-4 shadow-none">
              <Briefcase className="w-3 h-3" />
              {t("broker.persona")}
            </div>
            <h3 className="text-2xl font-semibold text-text-primary mb-4">{t("broker.title")}</h3>
            <p className="text-text-secondary leading-relaxed mb-6">
              <strong className="text-text-primary block mb-1">{t("painPoint")}</strong>
              {t("broker.pain")}
            </p>
            <p className="text-text-secondary leading-relaxed">
              <strong className="text-text-primary block mb-1">{t("howItWorks")}</strong>
              {t("broker.solution")}
            </p>
          </div>
        </div>

        {/* 3. Customer */}
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 relative z-10">
          <div className="md:w-1/2 md:text-end flex flex-col items-start md:items-end order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border/60 text-xs font-medium text-text-secondary mb-4 shadow-none">
              <Users className="w-3 h-3" />
              {t("customer.persona")}
            </div>
            <h3 className="text-2xl font-semibold text-text-primary mb-4">{t("customer.title")}</h3>
            <p className="text-text-secondary leading-relaxed mb-6">
              <strong className="text-text-primary block mb-1">{t("painPoint")}</strong>
              {t("customer.pain")}
            </p>
            <p className="text-text-secondary leading-relaxed">
              <strong className="text-text-primary block mb-1">{t("howItWorks")}</strong>
              {t("customer.solution")}
            </p>
          </div>
          <div className="md:w-1/2 order-1 md:order-2 w-full">
            <div className="bg-surface/50 border border-border/60 rounded-xl p-6 shadow-none relative overflow-hidden flex flex-col items-center justify-center min-h-[200px]">
              <div className="bg-background border border-border/40 shadow-none p-4 rounded-lg flex items-center gap-4 w-full max-w-sm">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">{t("customer.verified")}</h4>
                  <p className="text-xs text-text-secondary mt-1">{t("customer.license")}</p>
                  <p className="text-xs text-success font-medium mt-1">{t("customer.availability")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Programmer */}
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 relative z-10">
          <div className="md:w-1/2 w-full order-1">
            <div dir="ltr" className="overflow-hidden rounded-xl border border-border/40 bg-[#09090B] text-left shadow-none">
              <div className="flex items-center px-4 py-3 border-b border-[#27272A] bg-[#111111]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                </div>
                <div className="mx-auto text-xs font-medium text-[#A1A1AA]">
                  integration.ts
                </div>
              </div>
              <div className="p-6">
                <pre dir="ltr" className="text-left text-xs font-mono leading-relaxed">
                  <code dir="ltr" className="text-left text-[#A1A1AA]">
<span className="text-[#3385FF]">import</span> {"{ Anand }"} <span className="text-[#3385FF]">from</span> <span className="text-[#22C55E]">'@anand/sdk'</span>;<br/><br/>
<span className="text-[#22C55E]">{"// Just one endpoint to rule them all."}</span><br/>
<span className="text-[#3385FF]">await</span> anand.webhooks.<span className="text-[#FCD34D]">listen</span>({"{"}<br/>
{"  "}events: [<span className="text-[#22C55E]">'property.state_changed'</span>],<br/>
{"  "}onFire: (event) <span className="text-[#3385FF]">{"=>"}</span> {"{"}<br/>
{"    "}<span className="text-[#3385FF]">await</span> db.properties.update(event.data);<br/>
{"  }"}<br/>
{"}"});
                  </code>
                </pre>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 flex flex-col items-start order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border/60 text-xs font-medium text-text-secondary mb-4 shadow-none">
              <Terminal className="w-3 h-3" />
              {t("programmer.persona")}
            </div>
            <h3 className="text-2xl font-semibold text-text-primary mb-4">{t("programmer.title")}</h3>
            <p className="text-text-secondary leading-relaxed mb-6">
              <strong className="text-text-primary block mb-1">{t("painPoint")}</strong>
              {t("programmer.pain")}
            </p>
            <p className="text-text-secondary leading-relaxed">
              <strong className="text-text-primary block mb-1">{t("howItWorks")}</strong>
              {t("programmer.solution")}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
