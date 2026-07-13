import { defineHook } from "eve/hooks";
import { getWorkspaceActor } from "../lib/workspace-actor";

export default defineHook({
  events: {
    "actions.requested"(event, ctx) {
      const actor = getWorkspaceActor(ctx);
      for (const action of event.data.actions) {
        if (action.kind === "tool-call") {
          console.log(
            `[QentrahAI] tool=${action.toolName} user=${actor?.userId ?? "unknown"} role=${actor?.role ?? "unknown"} org=${actor?.organizationId ?? "unknown"}`,
          );
        }
      }
    },
  },
});
