"use client";

import { useState } from "react";

export function SafeWritePanel() {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitCreate(formData: FormData) {
    setBusy(true);
    setMessage(null);
    const response = await fetch("/api/qentrah/clients", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        source: "qentrah-partner-demo",
      }),
    });
    setBusy(false);
    setMessage(response.ok ? "Client create request sent to Workspace." : await response.text());
  }

  async function submitUpdate(formData: FormData) {
    const clientId = String(formData.get("clientId") ?? "");
    if (!clientId) return setMessage("Enter a client id to update.");
    setBusy(true);
    setMessage(null);
    const response = await fetch(`/api/qentrah/clients/${encodeURIComponent(clientId)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        source: "qentrah-partner-demo",
      }),
    });
    setBusy(false);
    setMessage(response.ok ? "Client update request sent to Workspace." : await response.text());
  }

  return (
    <section className="panel" style={{ padding: 20 }}>
      <p className="micro">Safe writes</p>
      <h2 style={{ margin: "8px 0 4px", fontSize: 22 }}>Create or update clients</h2>
      <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
        These forms call this demo backend first. The backend then calls Workspace Hono APIs with the stored bearer token.
      </p>
      <div className="grid two" style={{ marginTop: 16 }}>
        <form action={submitCreate} className="grid panel" style={{ padding: 16 }}>
          <strong>Create client</strong>
          <div className="field">
            <label htmlFor="create-name">Name</label>
            <input id="create-name" name="name" placeholder="Demo Buyer" required />
          </div>
          <div className="field">
            <label htmlFor="create-email">Email</label>
            <input id="create-email" name="email" type="email" placeholder="buyer@example.com" />
          </div>
          <button className="button" disabled={busy} type="submit">Create client</button>
        </form>
        <form action={submitUpdate} className="grid panel" style={{ padding: 16 }}>
          <strong>Update client</strong>
          <div className="field">
            <label htmlFor="update-id">Client id</label>
            <input id="update-id" name="clientId" placeholder="client_..." required />
          </div>
          <div className="field">
            <label htmlFor="update-name">New name</label>
            <input id="update-name" name="name" placeholder="Updated Demo Buyer" required />
          </div>
          <button className="button secondary" disabled={busy} type="submit">Update client</button>
        </form>
      </div>
      {message ? <pre className="panel" style={{ marginTop: 16, padding: 12, whiteSpace: "pre-wrap" }}>{message}</pre> : null}
    </section>
  );
}
