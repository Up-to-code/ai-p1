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
      <section className="border-b border-border bg-white px-4 py-20 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <p className="mb-4 text-xs font-bold uppercase text-primary">Security</p>
          <h1 className="text-balance text-[53px] font-bold leading-[1.04] text-foreground">Security model</h1>
          <p className="mt-4 max-w-2xl text-pretty text-lg font-medium leading-8 text-muted-foreground">
            The portal is designed around scoped authorization, review gates, and least-privilege API access.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background px-4 py-16 sm:px-6">
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-[15px] border border-border bg-card p-6">
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
