"use client";

import { createAuthClient } from "better-auth/react";
import { createWebAuthPlugins } from "./presets";

export function createWebAuthClient(): any {
  return createAuthClient({
    plugins: createWebAuthPlugins(),
  });
}
