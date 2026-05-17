import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const plans = [
  { name: "Build", price: "Free", description: "Create apps, verify OAuth flows, and submit for review.", items: ["Developer portal", "Programmer organization", "SDK documentation", "Review submission"] },
  { name: "Launch", price: "Approved apps", description: "Production access is enabled after security and tenant review.", items: ["Production credentials", "Scoped API access", "OIDC token verification", "Review notes and lifecycle"] },
];

export default function PricingPage() {
  return (
    <main className="px-5 py-14">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase text-primary">Pricing</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-foreground">Start building free. Launch after review.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
          Partner app access is gated by review, not surprise pricing. Production commercial terms are handled during approval.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {plans.map((plan) => (
            <article key={plan.name} className="command-panel p-5">
              <h2 className="text-xl font-bold text-foreground">{plan.name}</h2>
              <p className="mt-2 font-mono text-2xl font-bold text-primary">{plan.price}</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan.description}</p>
              <ul className="mt-6 space-y-3 text-sm font-medium text-foreground">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <Link href="/signup" className="mt-8 inline-flex h-11 items-center rounded-[6px] bg-primary px-5 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-primary/90">
          Create developer account
        </Link>
      </div>
    </main>
  );
}
