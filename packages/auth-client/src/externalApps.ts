"use client";

import { createAuthClient } from "better-auth/react";
import { createExternalAppAuthPlugins } from "./presets";

export function createExternalAppAuthClient(): any {
  return createAuthClient({
    plugins: createExternalAppAuthPlugins(),
  });
}
