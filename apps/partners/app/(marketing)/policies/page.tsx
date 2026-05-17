const policies = [
  ["Data access", "Apps may only request scopes required for the user-facing workflow. Organization data must not be copied into unrelated systems without explicit user consent."],
  ["Review and revocation", "Qentrah may reject, suspend, or revoke apps that misuse scopes, redirect users deceptively, or fail to protect credentials."],
  ["Credential handling", "Confidential client secrets must remain server-side. Public apps must use PKCE and never persist access tokens in browser storage."],
];

export default function PoliciesPage() {
  return (
    <main className="px-5 py-14">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold uppercase text-primary">Policies</p>
        <h1 className="mt-3 text-4xl font-bold text-foreground">Partner policies</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
          These policies keep partner apps safe for organizations, developers, and end users.
        </p>
        <div className="command-panel mt-8 divide-y divide-border">
          {policies.map(([title, description], index) => (
            <article key={title} className="grid gap-4 p-5 sm:grid-cols-[56px_minmax(0,1fr)]">
              <span className="font-mono text-sm font-bold text-primary">0{index + 1}</span>
              <div>
                <h2 className="text-xl font-bold text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
