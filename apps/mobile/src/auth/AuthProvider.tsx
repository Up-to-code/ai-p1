import { PropsWithChildren } from "react";

type AuthProviderProps = PropsWithChildren;

export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>;
}
