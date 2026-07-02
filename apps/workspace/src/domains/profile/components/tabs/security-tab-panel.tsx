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
          </div>
        </Section>

        <Section title={labels.activeSessionsTitle} description={labels.activeSessionsDesc}>
          <div className="flex items-center justify-between gap-4 border-y border-border py-4 dark:border-border">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {labels.thisDevice}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {labels.deviceDetail}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {labels.current}
            </span>
          </div>
        </Section>
      </div>
    </div>
  );
}
