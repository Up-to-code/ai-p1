"use client";

import { Client } from "eve/client";

let client: Client | null = null;

export function getEveClient(): Client {
  if (client) return client;
  client = new Client({ host: "" });
  return client;
}
