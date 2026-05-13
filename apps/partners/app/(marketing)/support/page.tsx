import Link from "next/link";
import { Book, Activity, FileText } from "lucide-react";

const cards = [
  { title: "Read the docs", href: "/docs", description: "Installation, OAuth flow, token verification, and API usage.", icon: Book },
  { title: "Check app status", href: "/dashboard/status", description: "See draft, review, active, rejected, and suspended states.", icon: Activity },
  { title: "Review policies", href: "/policies", description: "Understand app review and credential handling requirements.", icon: FileText },
];

export default function SupportPage() {
  return (
    <main>
      {/* Header */}
      <section className="border-b border-border bg-white px-4 py-20 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <p className="mb-4 text-xs font-bold uppercase text-primary">Support</p>
          <h1 className="text-balance text-[53px] font-bold leading-[1.04] text-foreground">Developer support</h1>
          <p className="mt-4 max-w-2xl text-pretty text-lg font-medium leading-8 text-muted-foreground">
            Use the docs first, then include your app client ID and request ID when contacting the platform team.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="bg-background px-4 py-16 sm:px-6">
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href} className="group rounded-[15px] border border-border bg-card p-6 transition-colors hover:border-primary/50">
                <Icon className="h-8 w-8 text-primary mb-5" />
                <h2 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{card.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
