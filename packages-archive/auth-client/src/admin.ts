"use client";

import { createAuthClient } from "better-auth/react";
import { createAdminAuthPlugins } from "./presets";

export function createAdminAuthClient(): any {
  return createAuthClient({
    plugins: createAdminAuthPlugins(),
  });
}
