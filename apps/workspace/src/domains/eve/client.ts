"use client";

import { Client } from "eve/client";

const clients = new Map<string, Client>();

export function getEveClient(orgId: string): Client {
  const existing = clients.get(orgId);
  if (existing) return existing;
  const client = new Client({
    host: "",
    headers: () => ({ "X-Organization-Id": orgId }),
  });
  clients.set(orgId, client);
  return client;
}
