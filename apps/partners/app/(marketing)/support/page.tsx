import Link from "next/link";
import { Activity, Book, FileText } from "lucide-react";

const cards = [
  { title: "Read the docs", href: "/docs", description: "Installation, OAuth flow, token verification, and API usage.", icon: Book },
  { title: "Check app status", href: "/dashboard/status", description: "See draft, review, active, rejected, and suspended states.", icon: Activity },
  { title: "Review policies", href: "/policies", description: "Understand app review and credential handling requirements.", icon: FileText },
];

export default function SupportPage() {
  return (
    <main className="px-5 py-14">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase text-primary">Support</p>
        <h1 className="mt-3 text-4xl font-bold text-foreground">Developer support</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
          Use the docs first, then include your app client ID and request ID when contacting the platform team.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href} className="command-panel group p-5 transition-colors hover:border-primary/50">
                <Icon className="mb-6 h-6 w-6 text-primary" />
                <h2 className="mb-2 text-lg font-bold text-foreground transition-colors group-hover:text-primary">{card.title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">{card.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
