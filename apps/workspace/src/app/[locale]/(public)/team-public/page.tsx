"use client";

import { ShieldCheck, Sparkles, UsersRound } from "lucide-react";

import { FeatureGrid, MetricCard, PublicHero, PublicSection, SectionHeader } from "@/components/landing/public-page-shell";

const TEAM = [
  { name: "Ahmed Mansour", role: "Founder & CEO", initials: "AM" },
  { name: "Sara Al-Rashid", role: "Head of Engineering", initials: "SR" },
  { name: "Khalid Nasser", role: "Head of Compliance", initials: "KN" },
  { name: "Noura Al-Otaibi", role: "Head of Partnerships", initials: "NO" },
];

export default function TeamPublicPage() {
  return (
    <>
      <PublicHero
        eyebrow="Team"
        title="The people building qentrah."
        description="A focused team shaping workspace infrastructure for property teams, project operations, broker coordination, and trusted real estate data."
      >
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <MetricCard icon={UsersRound} label="Operating model" value="Lean" helper="Product, engineering, and market operations stay close to the workflow." tone="blue" />
          <MetricCard icon={ShieldCheck} label="Trust layer" value="Verified" helper="Data quality, approvals, and workspace access are treated as core product." tone="green" />
          <MetricCard icon={Sparkles} label="Focus" value="Real work" helper="Built around practical property workflows rather than generic dashboards." tone="amber" />
        </div>
      </PublicHero>

      <PublicSection muted>
        <div className="space-y-10">
          <SectionHeader eyebrow="Leadership" title="Small team, clear ownership." description="Each function owns the details that keep the platform useful, trusted, and fast for real estate operators." />
          <div className="grid gap-4 sm:grid-cols-2">
            {TEAM.map((member) => (
              <article key={member.name} className="flex items-center gap-5 rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_24px_90px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-sm font-black text-white dark:bg-white dark:text-zinc-950">
                  {member.initials}
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-zinc-950 dark:text-white">{member.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{member.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </PublicSection>

      <PublicSection>
        <FeatureGrid
          items={[
            { title: "Product discipline", description: "Every surface is designed around fewer clicks, clearer ownership, and cleaner operational handoffs.", icon: Sparkles },
            { title: "Operational trust", description: "Approvals, audit trails, and data integrity are part of the daily workflow, not afterthoughts.", icon: ShieldCheck },
            { title: "Market proximity", description: "The team stays close to developers, brokers, and operators using the workspace every day.", icon: UsersRound },
          ]}
        />
      </PublicSection>
    </>
  );
}
