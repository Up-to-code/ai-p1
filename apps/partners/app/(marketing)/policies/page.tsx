export default function PoliciesPage() {
  return (
    <main>
      {/* Header */}
      <section className="border-b border-border bg-white px-4 py-20 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <p className="mb-4 text-xs font-bold uppercase text-primary">Policies</p>
          <h1 className="text-balance text-[53px] font-bold leading-[1.04] text-foreground">Partner policies</h1>
          <p className="mt-4 max-w-2xl text-pretty text-lg font-medium leading-8 text-muted-foreground">
            These policies keep partner apps safe for organizations, developers, and end users.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-background px-4 py-16 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <article className="rounded-[15px] border border-border bg-card p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Data Access</h2>
            <p className="text-muted-foreground leading-relaxed">
              Apps may only request scopes required for the user-facing workflow. Organization data must not be copied into unrelated systems without explicit user consent.
            </p>
          </article>
          <article className="rounded-[15px] border border-border bg-card p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Review and Revocation</h2>
            <p className="text-muted-foreground leading-relaxed">
              Qentrah may reject, suspend, or revoke apps that misuse scopes, redirect users deceptively, or fail to protect credentials.
            </p>
          </article>
          <article className="rounded-[15px] border border-border bg-card p-6">
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
