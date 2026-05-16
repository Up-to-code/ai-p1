"use client";

import type { ButtonHTMLAttributes } from "react";

export function SecureSignOutButton({
  redirectTo = "/signin",
  children = "Sign out",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  redirectTo?: string;
}) {
  return (
    <button
      {...props}
      type={type}
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) {
          window.location.assign(redirectTo);
        }
      }}
    >
      {children}
    </button>
  );
}
