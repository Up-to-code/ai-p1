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
      <section className="py-20 px-6 bg-muted/30 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Developer Support</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Use the docs first, then include your app client ID and request ID when contacting the platform team.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href} className="group rounded-xl border border-border bg-card p-8 hover:border-primary/50 hover:shadow-md transition-all">
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
