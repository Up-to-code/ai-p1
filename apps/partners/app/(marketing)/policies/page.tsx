export default function PoliciesPage() {
  return (
    <main>
      {/* Header */}
      <section className="py-20 px-6 bg-muted/30 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Partner Policies</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            These policies keep partner apps safe for organizations, developers, and end users.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-4xl mx-auto space-y-12">
          <article>
            <h2 className="text-xl font-bold text-foreground mb-3">Data Access</h2>
            <p className="text-muted-foreground leading-relaxed">
              Apps may only request scopes required for the user-facing workflow. Organization data must not be copied into unrelated systems without explicit user consent.
            </p>
          </article>
          <article>
            <h2 className="text-xl font-bold text-foreground mb-3">Review and Revocation</h2>
            <p className="text-muted-foreground leading-relaxed">
              Anan may reject, suspend, or revoke apps that misuse scopes, redirect users deceptively, or fail to protect credentials.
            </p>
          </article>
          <article>
            <h2 className="text-xl font-bold text-foreground mb-3">Credential Handling</h2>
            <p className="text-muted-foreground leading-relaxed">
              Confidential client secrets must remain server-side. Public apps must use PKCE and never persist access tokens in browser storage.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
