export function normalizeRedirectUris(values: string[]) {
  const normalized = [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
  if (normalized.length === 0) {
    throw new Error("At least one redirect URI is required");
  }

  for (const value of normalized) {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new Error("Redirect URI must be a valid URL");
    }
    if (url.username || url.password || url.hash) {
      throw new Error("Redirect URI must not include fragments or credentials");
    }
    const isLoopback = ["localhost", "127.0.0.1"].includes(url.hostname);
    if (url.protocol !== "https:" && !(isLoopback && url.protocol === "http:")) {
      throw new Error("Redirect URI must use HTTPS except localhost loopback.");
    }
  }

  return normalized;
}

export function normalizeScopes(values: string[]) {
  const normalized = [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
  if (normalized.length === 0) {
    throw new Error("At least one scope is required");
  }
  return normalized;
}

export function assertPartnerOwnsApp(app: { partnerAuthSubject: string } | null, authSubject: string) {
  if (!app || app.partnerAuthSubject !== authSubject) {
    throw new Error("Partner app not found");
  }
}

export function assertPartnerAppEditable(status: string) {
  if (!["draft", "rejected"].includes(status)) {
    throw new Error("Only draft or rejected apps can be edited");
  }
}

