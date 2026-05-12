"use client";

import { AuthProvider } from "../react";
import { createMockSessionPayload } from "./factories";
import type { ReactNode } from "react";

export function MockAuthProvider({
  children,
  session = createMockSessionPayload(),
}: {
  children: ReactNode;
  session?: ReturnType<typeof createMockSessionPayload>;
}) {
  return <AuthProvider initialSession={session}>{children}</AuthProvider>;
}
