import { Cloud, Code2, Database, LayoutGrid, MonitorSmartphone, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function IntegrationsMarquee() {
  const t = useTranslations("Landing.integrations");

  const partners = [
    { icon: Database, label: t("localCrms") },
    { icon: LayoutGrid, label: t("marketplaces") },
    { icon: Cloud, label: t("enterpriseErps") },
    { icon: MonitorSmartphone, label: t("consumerApps") },
    { icon: Share2, label: t("partnerApis") },
    { icon: Code2, label: t("customSdks") },
  ];

  return (
    <section className="py-16 bg-white w-full overflow-hidden border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-8 mb-12">
        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] text-center">
          {t("eyebrow")}
        </p>
      </div>
      
      <div className="relative flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
        <div className="flex w-max gap-20 px-8 mx-auto items-center opacity-40 hover:opacity-60 transition-opacity duration-500">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="flex gap-20 items-center">
              {partners.map((partner) => {
                const Icon = partner.icon;
                return (
                  <div key={partner.label} className="flex items-center gap-3 font-bold text-lg text-zinc-900 whitespace-nowrap">
                    <Icon className="w-5 h-5 text-zinc-400" />
                    <span>{partner.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
