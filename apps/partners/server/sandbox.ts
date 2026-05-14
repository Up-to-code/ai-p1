import { sandboxStore } from "@/server/sandbox/store";

export type SandboxInfo = Awaited<ReturnType<typeof sandboxStore.get>>;

export const sandboxRepository = {
  get: sandboxStore.get,
  ensure: sandboxStore.ensure,
};
