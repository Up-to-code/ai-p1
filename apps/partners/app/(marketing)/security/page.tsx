import { LockKeyhole, ShieldCheck, UserCheck } from "lucide-react";

const features = [
  { title: "OIDC claims", description: "Apps receive verifiable subject, audience, organization, and entitlement context.", icon: UserCheck },
  { title: "Scoped APIs", description: "API calls are checked against scopes and organization ownership.", icon: ShieldCheck },
  { title: "Safe clients", description: "Public apps use PKCE while confidential apps protect client secrets server-side.", icon: LockKeyhole },
];

export default function SecurityPage() {
  return (
    <main className="px-5 py-14">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase text-primary">Security</p>
        <h1 className="mt-3 text-4xl font-bold text-foreground">Security model</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
          The portal is designed around scoped authorization, review gates, and least-privilege API access.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="command-panel p-5">
                <Icon className="mb-6 h-6 w-6 text-primary" />
                <h2 className="mb-2 text-lg font-bold text-foreground">{feature.title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
