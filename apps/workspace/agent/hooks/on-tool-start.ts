import { defineHook } from "eve/hooks";

export default defineHook({
  events: {
    "actions.requested"(event, ctx) {
      const orgId = ctx.session.auth.current?.attributes?.organizationId;
      const userId = ctx.session.auth.current?.attributes?.userId;
      for (const action of event.data.actions) {
        if (action.kind === "tool-call") {
          console.log(
            `[Agent] Tool ${action.toolName} invoked by user ${userId} in org ${orgId}`,
          );
        }
      }
    },
  },
});
