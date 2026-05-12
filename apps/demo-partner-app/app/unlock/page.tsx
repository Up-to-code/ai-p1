export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; returnTo?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="shell">
      <div className="container" style={{ maxWidth: 520, paddingTop: 80 }}>
        <section className="panel" style={{ padding: 28 }}>
          <p className="micro">Protected partner demo</p>
          <h1 style={{ margin: "12px 0 0", fontSize: 32, letterSpacing: "-0.04em" }}>
            Unlock the Anan OAuth demo
          </h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            Enter the custom setup token before opening the demo app. OAuth still requires workspace consent inside Anan.
          </p>
          {params.error === "invalid" ? (
            <div className="error" role="alert">That setup token is not valid.</div>
          ) : null}
          <form action="/api/unlock" method="post" className="grid" style={{ marginTop: 22 }}>
            <input type="hidden" name="returnTo" value={params.returnTo ?? "/dashboard"} />
            <div className="field">
              <label htmlFor="token">Setup token</label>
              <input id="token" name="token" type="password" placeholder="Paste DEMO_ACCESS_TOKEN" required />
            </div>
            <button className="button" type="submit">Unlock demo</button>
          </form>
        </section>
      </div>
    </main>
  );
}
