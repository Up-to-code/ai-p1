"use client";

import type { ButtonHTMLAttributes } from "react";
import { useAuth } from "@anan/auth-sdk/react";

export function SecureSignOutButton({
  redirectTo = "/signin",
  children = "Sign out",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  redirectTo?: string;
}) {
  const auth = useAuth();
  return (
    <button
      {...props}
      type={type}
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) {
          auth.signOut(redirectTo);
        }
      }}
    >
      {children}
    </button>
  );
}
