"use client";

import { Briefcase, Mail, User } from "lucide-react";
import { AccountDataRow, BrandDataRow, Section } from "../shared/profile-settings-fields";

export function AccountTabPanel({
  labels,
}: {
  labels: {
    title: string;
    desc: string;
    name: string;
    email: string;
    organization: string;
    brand: string;
    defaultBrand: string;
    userName: string;
    userEmail: string;
    organizationName: string;
    brandColor?: string;
    organizationInitials: string;
    organizationLogo?: string | null;
  };
}) {
  return (
    <div className="max-w-3xl space-y-8">
      <Section title={labels.title} description={labels.desc}>
        <div className="divide-y divide-border border-y border-border dark:divide-border dark:border-border">
          <AccountDataRow icon={User} label={labels.name} value={labels.userName} />
          <AccountDataRow icon={Mail} label={labels.email} value={labels.userEmail} />
          <AccountDataRow icon={Briefcase} label={labels.organization} value={labels.organizationName} />
          <BrandDataRow
            label={labels.brand}
            value={labels.brandColor || labels.defaultBrand}
            name={labels.organizationName}
            initials={labels.organizationInitials}
            logo={labels.organizationLogo}
            brandColor={labels.brandColor}
          />
        </div>
      </Section>
    </div>
  );
}
