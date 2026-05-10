"use client";

import Image from "next/image";
import { ArrowRight, Bot, Building2, CalendarClock, CheckCircle2, FileCheck2, MessageCircle, MessageSquareText, Search, ShieldCheck, UsersRound, Video } from "lucide-react";
import { useTranslations } from "next-intl";

import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import {
  AudiencePanel,
  CtaPanel,
  FeatureSplitPanel,
  IntegrationCards,
  LandingButton,
  PublicSection,
  SectionIntro,
  SignalCard,
  TeamGallery,
  TestimonialGrid,
  WorkspacePreview,
  type WorkspacePreviewLabels,
} from "@/components/landing/public-landing-kit";

export default function InstitutionalLanding() {
  const t = useTranslations("Landing.home");
  const preview = t.raw("preview") as WorkspacePreviewLabels;

  const audiences = [
    {
      eyebrow: "Disconnected Teams",
      title: "Your data isn't the problem, your tools are.",
      description: "Brokers and developers operate in silos. Anan creates a single source of truth.",
      href: "/dashboard",
      image: "/images/projects/business-park.png",
      stats: [{ label: "Context", value: "Lost" }, { label: "Updates", value: "Delayed" }, { label: "Truth", value: "Scattered" }]
    },
    {
      eyebrow: "Manual Updates",
      title: "Stop updating spreadsheets.",
      description: "Inventory changes instantly. Keep your team aligned without the manual work.",
      href: "/dashboard",
      image: "/images/projects/residential.png",
      stats: [{ label: "Sync", value: "Manual" }, { label: "Errors", value: "High" }, { label: "Speed", value: "Slow" }]
    }
  ];

  const testimonials = [
    { quote: "This platform is the single most valuable tool for our leadership team. We have absolute visibility.", author: "Sarah Jenkins", role: "Operations Director" },
    { quote: "Our data is finally reconciled and trustworthy. The AI insights alone save us hours every week.", author: "Michael Chen", role: "VP of Engineering" },
  ];

  const team = [
    { name: "Alex Rivera", role: "Product Design", imageTone: "bg-gradient-to-br from-blue-500/40 to-[#050505]" },
    { name: "Jamie Lee", role: "Engineering Lead", imageTone: "bg-gradient-to-br from-emerald-500/40 to-[#050505]" },
    { name: "Taylor Smith", role: "Customer Success", imageTone: "bg-gradient-to-br from-amber-500/40 to-[#050505]" },
    { name: "Jordan Davis", role: "Data Science", imageTone: "bg-gradient-to-br from-red-500/40 to-[#050505]" },
  ];

  const integrations = [
    { name: "Slack", description: "Receive real-time alerts and daily digests directly in your channels.", icon: MessageCircle, color: "bg-[#4A154B]" },
    { name: "YouTube", description: "Embed video walkthroughs and market updates effortlessly.", icon: Video, color: "bg-[#FF0000]" },
    { name: "Discord", description: "Community sync and instant operational notifications.", icon: MessageSquareText, color: "bg-[#5865F2]" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* HERO SECTION */}
        <PublicSection className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(75,85,255,0.15),transparent_50%)]" />
          <div className="relative mx-auto max-w-5xl text-center">
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-blue-500/50" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-400">B2B REAL ESTATE CLARITY</span>
                <span className="h-px w-8 bg-blue-500/50" />
              </div>
              <div className="space-y-6">
                <h1 className="text-5xl font-semibold leading-tight tracking-tight text-white md:text-7xl">
                  Leadership Deserves<br />One System of Truth.
                </h1>
                <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-zinc-400 md:text-xl">
                  Anan gives developers and brokers one trusted layer for projects, inventory, approvals, client work, and AI-assisted decisions.
                </p>
              </div>
              <div className="flex flex-col justify-center gap-4 sm:flex-row pt-4">
                <LandingButton href="/dashboard" className="h-12 px-8 text-[11px] shadow-[0_0_40px_rgba(75,85,255,0.4)]">
                  Get Anan
                </LandingButton>
                <LandingButton href="/contact" variant="secondary" className="h-12 px-8 text-[11px]">
                  Contact Us
                </LandingButton>
              </div>
            </div>
            <div className="mx-auto mt-20 max-w-5xl relative">
              <div className="absolute -inset-1 rounded-[24px] bg-gradient-to-b from-white/10 to-transparent blur-md" />
              <div className="relative z-10 scale-[1.02] md:scale-105 transition-transform duration-700 hover:scale-[1.03] md:hover:scale-[1.06]">
                <WorkspacePreview labels={preview} />
              </div>
            </div>
            
            <div className="mx-auto mt-32 max-w-4xl border-t border-white/5 pt-12">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-8">Trusted by industry leaders</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <SignalCard label="Projects" value="Active" helper="Manage properties across multiple developments" tone="blue" icon={Building2} />
                <SignalCard label="Units" value="Available" helper="Track inventory status and availability in real-time" tone="amber" icon={FileCheck2} />
                <SignalCard label="Leads" value="In progress" helper="Monitor client intent and follow-ups centrally" tone="green" icon={UsersRound} />
              </div>
            </div>
          </div>
        </PublicSection>

        {/* PAIN POINTS SECTION */}
        <PublicSection tone="muted" className="border-t border-white/5 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] mix-blend-overlay" />
          <div className="space-y-16 relative z-10">
            <SectionIntro eyebrow="The Problem" title="Where teams lose clarity." align="center" />
            <div className="grid gap-6 md:grid-cols-2">
              {audiences.map((audience) => (
                <AudiencePanel key={audience.eyebrow} {...audience} />
              ))}
            </div>
          </div>
        </PublicSection>

        {/* WORKFLOW / FEATURE SPLIT PANELS (ZIGZAG) */}
        
        {/* Panel 1: Image Left, Text Right */}
        <PublicSection className="border-t border-white/5 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_100%_50%,rgba(16,185,129,0.05),transparent_60%)]" />
          <FeatureSplitPanel
            eyebrow="One layer"
            title="One layer. Every metric. Always reconciled."
            description="Projects, units, clients, and approvals stop living in separate stories. Ready, pending, blocked, and synced are visible before handoff."
            primaryLabel="Learn More"
            href="/dashboard"
          >
            <div className="relative bg-[#080808] rounded-[20px] overflow-hidden border border-white/5 shadow-xl aspect-square md:aspect-auto md:h-[400px]">
               <Image 
                  src="/images/Dashboard%20AI.png" 
                  alt="Anan AI Dashboard" 
                  fill 
                  className="object-cover object-left-top opacity-90 transition-opacity hover:opacity-100" 
                  sizes="(max-width: 768px) 100vw, 50vw"
               />
            </div>
          </FeatureSplitPanel>
        </PublicSection>

        {/* Panel 2: Text Left, Image Right */}
        <PublicSection tone="muted" className="border-t border-white/5 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(circle_at_0%_50%,rgba(245,158,11,0.05),transparent_60%)]" />
          <FeatureSplitPanel
            eyebrow="Revenue Health"
            title="Real-time revenue health. It's not a luxury, it's a necessity."
            description="A B2B surface for teams that need clean status, not more screenshots. See the risk before it becomes a revenue event."
            primaryLabel="Explore Analytics"
            href="/dashboard"
            reverse={true}
          >
            <div className="bg-[#0A0A0A] rounded-[20px] p-6 h-[400px] border border-white/5 shadow-xl">
               <WorkspacePreview labels={preview} />
            </div>
          </FeatureSplitPanel>
        </PublicSection>

        {/* Panel 3: Image Left, Text Right */}
        <PublicSection className="border-t border-white/5 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_100%_50%,rgba(56,189,248,0.05),transparent_60%)]" />
          <FeatureSplitPanel
            eyebrow="Compliance & Trust"
            title="See the block before there was a block."
            description="Approvals and blocks are visible before work moves forward. Brokers and developers use the same operational language."
            primaryLabel="Discover Compliance"
            href="/dashboard"
          >
            <div className="bg-[#080808] rounded-[20px] p-6 h-[400px] border border-white/5 shadow-xl">
               <WorkspacePreview labels={preview} />
            </div>
          </FeatureSplitPanel>
        </PublicSection>

        {/* TESTIMONIALS SECTION */}
        <PublicSection tone="muted" className="border-t border-white/5 relative">
          <div className="space-y-16">
            <SectionIntro eyebrow="Testimonials" title="Real feedback. From real leaders." align="center" />
            <TestimonialGrid testimonials={testimonials} />
          </div>
        </PublicSection>

        {/* TEAM SECTION */}
        <PublicSection className="border-t border-white/5">
          <div className="space-y-16">
            <SectionIntro eyebrow="Our Team" title="Built by people who care deeply." align="center" />
            <TeamGallery members={team} />
          </div>
        </PublicSection>

        {/* INTEGRATIONS SECTION */}
        <PublicSection tone="muted" className="border-t border-white/5">
          <div className="space-y-16">
            <SectionIntro eyebrow="Ecosystem" title="Stay connected. Always." align="center" />
            <IntegrationCards integrations={integrations} />
          </div>
        </PublicSection>

        {/* CTA SECTION */}
        <PublicSection className="border-t border-white/5">
          <CtaPanel
            eyebrow="Ready for the workspace"
            title="Need business clarity? Get Anan."
            description="Enter the workspace, or contact the team to map Anan to your developer or brokerage workflow."
            primaryLabel="Get Anan"
            secondaryLabel="Contact team"
          />
        </PublicSection>
      </main>

      <Footer />
    </div>
  );
}

