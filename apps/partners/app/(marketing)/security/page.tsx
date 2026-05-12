import { LockKeyhole, ShieldCheck, UserCheck } from "lucide-react";

const features = [
  { title: "OIDC Claims", description: "Apps receive verifiable subject, audience, organization, and entitlement context.", icon: UserCheck },
  { title: "Scoped APIs", description: "API calls are checked against scopes and organization ownership.", icon: ShieldCheck },
  { title: "Safe Clients", description: "Public apps use PKCE while confidential apps protect client secrets server-side.", icon: LockKeyhole },
];

export default function SecurityPage() {
  return (
    <main>
      {/* Header */}
      <section className="py-20 px-6 bg-muted/30 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Security Model</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            The portal is designed around scoped authorization, review gates, and least-privilege API access.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-xl border border-border bg-card p-8">
                <Icon className="h-8 w-8 text-primary mb-5" />
                <h2 className="text-lg font-bold text-foreground mb-2">{feature.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
