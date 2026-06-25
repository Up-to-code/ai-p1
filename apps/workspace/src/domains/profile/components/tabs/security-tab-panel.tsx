"use client";

import { Mail, Phone, ShieldCheck, User } from "lucide-react";
import { Section, SecurityRow } from "../shared/profile-settings-fields";

export function SecurityTabPanel({
  labels,
}: {
  labels: {
    accountIdentityTitle: string;
    accountIdentityDesc: string;
    fullName: string;
    fullNameNote: string;
    emailAddress: string;
    emailNote: string;
    phoneNumber: string;
    phoneNote: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    accessSecurityTitle: string;
    accessSecurityDesc: string;
    authMethod: string;
    googleAuth: string;
    googleNote: string;
    manageBtn: string;
    oauthSafetyNote: string;
    activeSessionsTitle: string;
    activeSessionsDesc: string;
    thisDevice: string;
    deviceDetail: string;
    current: string;
  };
}) {
  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Section title={labels.accountIdentityTitle} description={labels.accountIdentityDesc}>
        <div className="divide-y divide-border border-y border-border dark:divide-border dark:border-border">
          <SecurityRow icon={User} label={labels.fullName} value={labels.userName} note={labels.fullNameNote} />
          <SecurityRow icon={Mail} label={labels.emailAddress} value={labels.userEmail} note={labels.emailNote} />
          <SecurityRow icon={Phone} label={labels.phoneNumber} value={labels.userPhone} note={labels.phoneNote} />
        </div>
      </Section>

      <div className="space-y-8 border-t border-border pt-8 dark:border-border xl:border-t-0 xl:border-s xl:pt-0 xl:ps-8">
        <Section title={labels.accessSecurityTitle} description={labels.accessSecurityDesc}>
          <div className="space-y-4">
            <SecurityRow
              icon={ShieldCheck}
              label={labels.authMethod}
              value={labels.googleAuth}
              note={labels.googleNote}
              action={{
                label: labels.manageBtn,
                onClick: () => window.open("https://myaccount.google.com/security", "_blank"),
              }}
            />
            <div className="border-s border-blue-300 px-4 py-2 dark:border-blue-500/40">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <p className="text-[10px] font-medium leading-relaxed text-blue-800 dark:text-blue-300">
                  {labels.oauthSafetyNote}
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section title={labels.activeSessionsTitle} description={labels.activeSessionsDesc}>
          <div className="flex items-center justify-between gap-4 border-y border-border py-4 dark:border-border">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground dark:text-foreground">
                {labels.thisDevice}
              </p>
              <p className="mt-0.5 text-[9px] font-medium text-muted-foreground">
                {labels.deviceDetail}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {labels.current}
            </span>
          </div>
        </Section>
      </div>
    </div>
  );
}
