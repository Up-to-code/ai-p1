import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const plans = [
  { name: "Build", price: "Free", description: "Create apps, verify OAuth flows, and submit for review.", items: ["Developer portal", "Programmer organization", "SDK documentation", "Review submission"] },
  { name: "Launch", price: "Approved apps", description: "Production access is enabled after security and tenant review.", items: ["Production credentials", "Scoped API access", "OIDC token verification", "Review notes and lifecycle"] },
];

export default function PricingPage() {
  return (
    <main>
      {/* Header */}
      <section className="py-20 px-6 bg-muted/30 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-4">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Start building free. Launch after review.</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Partner app access is gated by review, not surprise pricing. Production commercial terms are handled during approval.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <article key={plan.name} className="rounded-xl border border-border bg-card p-8">
                <h2 className="text-2xl font-bold text-foreground">{plan.name}</h2>
                <p className="mt-2 text-3xl font-bold text-primary">{plan.price}</p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
                <ul className="mt-6 space-y-3 text-sm font-medium text-foreground">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <Link href="/signup" className="mt-10 inline-flex h-12 items-center rounded-md bg-primary px-8 text-sm font-bold text-primary-foreground transition-transform hover:scale-105">
            Create developer account
          </Link>
        </div>
      </section>
    </main>
  );
}
