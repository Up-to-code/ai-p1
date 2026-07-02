import type { ReactNode } from "react";
import { Search } from "lucide-react";
import type { PartnerCatalogApp } from "../store/integrations.types";

export type IntegrationAppDetails = {
  category: string;
  valueProp: string;
  screenshotImgUrl: string;
  scopesExplained: Array<{ scope: string; desc: string }>;
  videoTitle: string;
  videoDuration: string;
  screenshotTitle: string;
  screenshotHtml: ReactNode;
  screenshot2Title: string;
  screenshot2Html: ReactNode;
};

type BuildIntegrationAppDetailsContext = {
  t: (key: string, values?: Record<string, string | number>) => string;
  isRtl: boolean;
};

export function buildIntegrationAppDetails(
  app: PartnerCatalogApp,
  { t, isRtl }: BuildIntegrationAppDetailsContext,
): IntegrationAppDetails {
  switch (app.id) {
      case "mac-icloud-sync":
        return {
          category: t('detail.appDetails.icloud.category'),
          valueProp: t('detail.appDetails.icloud.valueProp'),
          screenshotImgUrl: "/images/icloud_screenshot1.png",
          scopesExplained: [
            { 
              scope: "icloud.files.read", 
              desc: t('detail.appDetails.icloud.scopes.read')
            },
            { 
              scope: "icloud.files.write", 
              desc: t('detail.appDetails.icloud.scopes.write')
            }
          ],
          videoTitle: t('detail.appDetails.icloud.videoTitle'),
          videoDuration: t('detail.appDetails.icloud.videoDuration'),
          screenshotTitle: t('detail.appDetails.icloud.screenshotTitle'),
          screenshotHtml: (
            <div className="space-y-3 font-sans text-xs" dir={isRtl ? "rtl" : "ltr"}>
              <div className="flex items-center justify-between border-b border-border dark:border-white/[0.04] pb-2">
                <span className="font-semibold text-foreground/30">{t('detail.appDetails.icloud.screenshot.connection')}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('detail.appDetails.icloud.screenshot.status')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-[8px] bg-muted/50 dark:bg-white/[0.01] p-2.5 border border-border dark:border-white/[0.04]">
                  <span className="block text-[10px] text-muted-foreground mb-0.5">{t('detail.appDetails.icloud.screenshot.folder')}</span>
                  <span className="font-mono text-muted-foreground/40">/iCloud/Qentrah/Al_Manar</span>
                </div>
                <div className="rounded-[8px] bg-muted/50 dark:bg-white/[0.01] p-2.5 border border-border dark:border-white/[0.04]">
                  <span className="block text-[10px] text-muted-foreground mb-0.5">{t('detail.appDetails.icloud.screenshot.files')}</span>
                  <span className="font-semibold text-foreground/30">{t('detail.appDetails.icloud.screenshot.filesCount')}</span>
                </div>
              </div>
              <div className="rounded-[8px] bg-muted/50 dark:bg-white/[0.01] p-2.5 border border-border dark:border-white/[0.04] space-y-1.5">
                <span className="block text-[10px] font-semibold text-muted-foreground">{t('detail.appDetails.icloud.screenshot.syncLog')}</span>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">📄 Floorplan_Block_A.pdf</span>
                  <span className="text-muted-foreground font-mono">{t('webhooks.justNow')}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">📸 Exterior_Facade_Sunset.png</span>
                  <span className="text-muted-foreground font-mono">{t('webhooks.minsAgo', { count: 2 })}</span>
                </div>
              </div>
            </div>
          ),
          screenshot2Title: t('detail.appDetails.icloud.screenshot2Title'),
          screenshot2Html: (
            <div className="space-y-3 font-sans text-xs text-start" dir={isRtl ? "rtl" : "ltr"}>
              <div className="flex items-center justify-between border-b border-border dark:border-white/[0.04] pb-2">
                <span className="font-semibold text-foreground/30">{t('detail.appDetails.icloud.screenshot.filesBackups')}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {t('detail.appDetails.icloud.screenshot.status')}
                </span>
              </div>
              <div className="space-y-2">
                <div className="rounded-[8px] bg-muted/50 dark:bg-white/[0.01] p-2.5 border border-border dark:border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">📁</span>
                    <span className="font-semibold text-foreground/40">/Blueprints_Manar</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">14 {t('detail.fields.events')}</span>
                </div>
                <div className="rounded-[8px] bg-muted/50 dark:bg-white/[0.01] p-2.5 border border-border dark:border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 font-bold">📄</span>
                    <span className="font-semibold text-foreground/40">Contract_Heights_Signed.pdf</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{t('detail.appDetails.icloud.screenshot.filesCountBackups')}</span>
                </div>
              </div>
            </div>
          )
        };
      case "mac-calendar-sync":
        return {
          category: t('detail.appDetails.calendar.category'),
          valueProp: t('detail.appDetails.calendar.valueProp'),
          screenshotImgUrl: "/images/calendar_screenshot1.png",
          scopesExplained: [
            { 
              scope: "calendar.events.read", 
              desc: t('detail.appDetails.calendar.scopes.read')
            },
            { 
              scope: "calendar.events.write", 
              desc: t('detail.appDetails.calendar.scopes.write')
            }
          ],
          videoTitle: t('detail.appDetails.calendar.videoTitle'),
          videoDuration: t('detail.appDetails.calendar.videoDuration'),
          screenshotTitle: t('detail.appDetails.calendar.screenshotTitle'),
          screenshotHtml: (
            <div className="space-y-3 font-sans text-xs" dir={isRtl ? "rtl" : "ltr"}>
              <div className="flex items-center justify-between border-b border-border dark:border-white/[0.04] pb-2">
                <span className="font-semibold text-foreground/30">{t('detail.appDetails.calendar.screenshot.status')}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('detail.appDetails.calendar.screenshot.synced')}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-[8px] bg-blue-50/50 dark:bg-blue-950/10 p-2.5 border border-blue-100/30 dark:border-blue-900/20">
                  <div className="flex flex-col items-center justify-center h-9 w-9 rounded-md bg-blue-500 text-white font-semibold">
                    <span className="text-[9px] uppercase font-black">{t('detail.appDetails.calendar.screenshot.may')}</span>
                    <span className="text-sm font-bold mt-[-3px]">28</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-blue-955 dark:text-blue-200 truncate">{t('detail.appDetails.calendar.screenshot.showing')}</span>
                    <span className="block text-[10px] text-blue-600 dark:text-blue-400">{t('detail.appDetails.calendar.screenshot.showingDetails')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-[8px] bg-indigo-50/50 dark:bg-indigo-950/10 p-2.5 border border-indigo-100/30 dark:border-indigo-900/20">
                  <div className="flex flex-col items-center justify-center h-9 w-9 rounded-md bg-indigo-550 text-white font-semibold">
                    <span className="text-[9px] uppercase font-black">{t('detail.appDetails.calendar.screenshot.may')}</span>
                    <span className="text-sm font-bold mt-[-3px]">29</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-indigo-955 dark:text-indigo-200 truncate">{t('detail.appDetails.calendar.screenshot.contract')}</span>
                    <span className="block text-[10px] text-indigo-600 dark:text-indigo-400">{t('detail.appDetails.calendar.screenshot.contractDetails')}</span>
                  </div>
                </div>
              </div>
            </div>
          ),
          screenshot2Title: t('detail.appDetails.calendar.screenshot2Title'),
          screenshot2Html: (
            <div className="space-y-3 font-sans text-xs text-start" dir={isRtl ? "rtl" : "ltr"}>
              <div className="flex items-center justify-between border-b border-border dark:border-white/[0.04] pb-2">
                <span className="font-semibold text-foreground/30">{t('detail.appDetails.calendar.screenshot.showingSlots')}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-650 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('detail.appDetails.calendar.screenshot.synced')}
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-[8px] bg-muted/50 dark:bg-white/[0.01] border border-border dark:border-white/[0.04] flex items-center justify-between">
                  <span className="font-semibold text-foreground/40">{t('detail.appDetails.calendar.screenshot.slot1')}</span>
                  <span className="rounded bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">{t('detail.available')}</span>
                </div>
                <div className="p-2.5 rounded-[8px] bg-muted/50 dark:bg-white/[0.01] border border-border dark:border-white/[0.04] flex items-center justify-between">
                  <span className="font-semibold text-foreground/40">{t('detail.appDetails.calendar.screenshot.slot2')}</span>
                  <span className="rounded bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">{t('detail.available')}</span>
                </div>
              </div>
            </div>
          )
        };
      case "mac-contacts-gateway":
        return {
          category: t('detail.appDetails.contacts.category'),
          valueProp: t('detail.appDetails.contacts.valueProp'),
          screenshotImgUrl: "/images/contacts_screenshot1.png",
          scopesExplained: [
            { 
              scope: "contacts.read", 
              desc: t('detail.appDetails.contacts.scopes.read')
            },
            { 
              scope: "contacts.write", 
              desc: t('detail.appDetails.contacts.scopes.write')
            }
          ],
          videoTitle: t('detail.appDetails.contacts.videoTitle'),
          videoDuration: t('detail.appDetails.contacts.videoDuration'),
          screenshotTitle: t('detail.appDetails.contacts.screenshotTitle'),
          screenshotHtml: (
            <div className="space-y-3 font-sans text-xs" dir={isRtl ? "rtl" : "ltr"}>
              <div className="flex items-center justify-between border-b border-border dark:border-white/[0.04] pb-2">
                <span className="font-semibold text-foreground/30">{t('detail.appDetails.contacts.screenshot.sync')}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                  {t('detail.appDetails.contacts.screenshot.pending')}
                </span>
              </div>
              <div className="divide-y divide-border dark:divide-white/[0.04]">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="block font-semibold text-foreground/30">{t('detail.appDetails.contacts.screenshot.mockAhmed')}</span>
                    <span className="block text-[10px] text-muted-foreground">ahmed@qentrah.com • +20 100 123 4567</span>
                  </div>
                  <span className="rounded bg-muted dark:bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">{t('detail.appDetails.contacts.screenshot.buyer')}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="block font-semibold text-foreground/30">{t('detail.appDetails.contacts.screenshot.mockSarah')}</span>
                    <span className="block text-[10px] text-muted-foreground">sarah@gmail.com • +20 122 987 6543</span>
                  </div>
                  <span className="rounded bg-muted dark:bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">{t('detail.appDetails.contacts.screenshot.tenant')}</span>
                </div>
              </div>
            </div>
          ),
          screenshot2Title: t('detail.appDetails.contacts.screenshot2Title'),
          screenshot2Html: (
            <div className="space-y-3 font-sans text-xs text-start" dir={isRtl ? "rtl" : "ltr"}>
              <div className="flex items-center justify-between border-b border-border dark:border-white/[0.04] pb-2">
                <span className="font-semibold text-foreground/30">{t('detail.appDetails.contacts.screenshot.syncRules')}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                  {t('detail.appDetails.contacts.screenshot.sync')}
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-[8px] bg-muted/50 dark:bg-white/[0.01] border border-border dark:border-white/[0.04] flex items-center justify-between">
                  <span className="font-medium text-foreground/40">{t('detail.appDetails.contacts.screenshot.rule1')}</span>
                  <span className="text-[10px] text-muted-foreground/60">{t('detail.ruleStatusActive')}</span>
                </div>
                <div className="p-2.5 rounded-[8px] bg-muted/50 dark:bg-white/[0.01] border border-border dark:border-white/[0.04] flex items-center justify-between">
                  <span className="font-medium text-foreground/40">{t('detail.appDetails.contacts.screenshot.rule2')}</span>
                  <span className="text-[10px] text-muted-foreground/60">{t('detail.ruleStatusActive')}</span>
                </div>
              </div>
            </div>
          )
        };
      case "mac-spotlight-indexer":
        return {
          category: t('detail.appDetails.spotlight.category'),
          valueProp: t('detail.appDetails.spotlight.valueProp'),
          screenshotImgUrl: "/images/spotlight_screenshot1.png",
          scopesExplained: [
            { 
              scope: "spotlight.index.write", 
              desc: t('detail.appDetails.spotlight.scopes.write')
            }
          ],
          videoTitle: t('detail.appDetails.spotlight.videoTitle'),
          videoDuration: t('detail.appDetails.spotlight.videoDuration'),
          screenshotTitle: t('detail.appDetails.spotlight.screenshotTitle'),
          screenshotHtml: (
            <div className="space-y-3 font-sans text-xs" dir={isRtl ? "rtl" : "ltr"}>
              <div className="flex items-center justify-between border-b border-border dark:border-white/[0.04] pb-2">
                <span className="font-semibold text-foreground/30">{t('detail.appDetails.spotlight.screenshot.status')}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {t('detail.appDetails.spotlight.screenshot.ready')}
                </span>
              </div>
              <div className="rounded-[10px] bg-foreground p-3 text-white border border-white/10 space-y-2 font-sans" dir="ltr">
                <div className="flex items-center gap-2 border-b border-white/10 pb-1.5 text-[10px] font-mono text-muted-foreground">
                  <Search className="h-3 w-3" />
                  <span>Spotlight search: "Al Manar"</span>
                </div>
                <div className="space-y-2 text-start">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="min-w-0">
                      <span className="block font-semibold truncate text-muted-foreground">{t('detail.appDetails.spotlight.screenshot.complex')}</span>
                      <span className="block text-[9px] text-muted-foreground truncate">{t('detail.appDetails.spotlight.screenshot.complexDesc')}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{t('detail.appDetails.spotlight.screenshot.open')}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="min-w-0">
                      <span className="block font-semibold truncate text-muted-foreground">{t('detail.appDetails.spotlight.screenshot.apt')}</span>
                      <span className="block text-[9px] text-muted-foreground truncate">{t('detail.appDetails.spotlight.screenshot.aptDesc')}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{t('detail.appDetails.spotlight.screenshot.open')}</span>
                  </div>
                </div>
              </div>
            </div>
          ),
          screenshot2Title: t('detail.appDetails.spotlight.screenshot2Title'),
          screenshot2Html: (
            <div className="space-y-3 font-sans text-xs text-start" dir={isRtl ? "rtl" : "ltr"}>
              <div className="flex items-center justify-between border-b border-border dark:border-white/[0.04] pb-2">
                <span className="font-semibold text-foreground/30">{t('detail.appDetails.spotlight.screenshot.indexTelemetry')}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {t('detail.appDetails.spotlight.screenshot.ready')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-[8px] bg-muted/50 dark:bg-white/[0.01] p-2.5 border border-border dark:border-white/[0.04]">
                  <span className="block text-[10px] text-muted-foreground mb-0.5">{t('detail.appDetails.spotlight.screenshot.rebuildTime')}</span>
                  <span className="font-mono text-muted-foreground/40">12ms</span>
                </div>
                <div className="rounded-[8px] bg-muted/50 dark:bg-white/[0.01] p-2.5 border border-border dark:border-white/[0.04]">
                  <span className="block text-[10px] text-muted-foreground mb-0.5">{t('detail.appDetails.spotlight.screenshot.totalIndexed')}</span>
                  <span className="font-semibold text-foreground/30">{t('detail.appDetails.spotlight.screenshot.totalIndexed')}</span>
                </div>
              </div>
            </div>
          )
        };
      default:
        return {
          category: t('detail.appDetails.default.category'),
          valueProp: app.description,
          screenshotImgUrl: "/images/data-machine-sync.png",
          scopesExplained: app.allowedScopes.map(sc => ({ 
            scope: sc, 
            desc: t('detail.appDetails.default.scopeDesc', { scope: sc }) 
          })),
          videoTitle: t('detail.appDetails.default.videoTitle', { name: app.name }),
          videoDuration: t('detail.appDetails.default.videoDuration'),
          screenshotTitle: t('detail.appDetails.default.screenshotTitle', { name: app.name }),
          screenshotHtml: (
            <div className="flex min-h-[120px] items-center justify-center text-xs text-muted-foreground italic">
              {t('detail.appDetails.default.screenshotHtml')}
            </div>
          ),
          screenshot2Title: t('detail.appDetails.default.screenshot2Title', { name: app.name }),
          screenshot2Html: (
            <div className="flex min-h-[120px] items-center justify-center text-xs text-muted-foreground italic">
              {t('detail.appDetails.default.screenshotHtml')}
            </div>
          )
        };
  }
}
