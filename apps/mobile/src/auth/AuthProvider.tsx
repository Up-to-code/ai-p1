import type { PropsWithChildren } from "react";

/** Better Auth's Expo client owns session restoration through SecureStore. */
export function AuthProvider({ children }: PropsWithChildren) {
  return children;
}
