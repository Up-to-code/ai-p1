"use client";

import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function Footer() {
    const t = useTranslations("Landing.footer");

    return (
        <footer className="bg-slate-900 border-t border-slate-800 pt-24 pb-12 px-6">
            <div className="max-w-5xl mx-auto space-y-24">

                {/* Top Section: Brand (Left) | Links (Right) */}
                <div className="flex flex-col lg:flex-row justify-between gap-16">
                    {/* Brand & Tagline */}
                    <div className="space-y-6 max-w-sm ltr:text-left rtl:text-right">
                        <div className="flex items-center gap-4 rtl:flex-row-reverse">
                            <Link href="/" className="inline-block">
                                <Image
                                    src="/brand-logo.svg"
                                    alt="Anan"
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 brightness-0 invert"
                                />
                            </Link>
                            <div className="space-y-1">
                                <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">ANAN</div>
                                <div className="text-sm font-black text-white leading-[1.1]">{t("tagline")}</div>
                            </div>
                        </div>
                        <p className="text-slate-400 font-bold text-sm leading-relaxed max-w-xs">
                            {t("description")}
                        </p>
                    </div>

                    {/* Link Columns */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 ltr:text-left rtl:text-right">
                        <div className="space-y-6">
                            <h4 className="text-white font-black text-[10px] uppercase tracking-widest">{t("platform")}</h4>
                            <ul className="space-y-3">
                                <li><Link href="/developer" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{t("developers")}</Link></li>
                                <li><Link href="/broker" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{t("brokers")}</Link></li>
                                <li><Link href="/about" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{t("about")}</Link></li>
                                <li><Link href="/pricing" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{t("pricing")}</Link></li>
                                <li><Link href="/docs" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{t("documentation")}</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-white font-black text-[10px] uppercase tracking-widest">{t("community")}</h4>
                            <ul className="space-y-3">
                                <li><Link href="/team" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{t("team")}</Link></li>
                                <li><Link href="/careers" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{t("careers")}</Link></li>
                                <li><Link href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{t("twitter")}</Link></li>
                                <li><Link href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{t("linkedin")}</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-white font-black text-[10px] uppercase tracking-widest">{t("legal")}</h4>
                            <ul className="space-y-3">
                                <li><Link href="/policy" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{t("timesOfContact")}</Link></li>
                                <li><Link href="/terms" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{t("timesAndPrivacy")}</Link></li>
                                <li><Link href="/contact" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{t("contacts")}</Link></li>
                                <li><Link href="/faq" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{t("faq")}</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Tagline (Left) | Copyright (Right) */}
                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        {t("tagline")}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-60 transition-opacity hover:opacity-100 dark:text-slate-400">
                        {t("copyright")}
                    </p>
                </div>
            </div>
        </footer>
    );
}
