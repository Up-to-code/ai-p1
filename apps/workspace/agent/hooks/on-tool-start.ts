import { defineHook } from "eve/hooks";

export default defineHook({
  events: {
    "actions.requested"(event, ctx) {
      const orgId = ctx.session.auth.current?.attributes?.organizationId;
      const userId = ctx.session.auth.current?.attributes?.userId;
      const role = ctx.session.auth.current?.attributes?.role ?? "unknown";
      for (const action of event.data.actions) {
        if (action.kind === "tool-call") {
          console.log(
            `[QentrahAI] tool=${action.toolName} user=${userId} role=${role} org=${orgId}`,
          );
        }
      }
    },
  },
});
