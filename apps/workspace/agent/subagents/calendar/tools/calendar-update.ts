import { defineTool } from "eve/tools";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import {
  calendarUpdateToolInputSchema,
  parseCalendarUpdatePatch,
} from "../calendar-update-input";

export default defineTool({
  description: "Update an existing calendar event.",
  inputSchema: calendarUpdateToolInputSchema,
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    const { eventId, ...patch } = args;
    return fetchAuthMutation(ctx, api.calendar.write.updateFromHono, {
      organizationId,
      eventId: eventId as never,
      input: parseCalendarUpdatePatch(patch),
    });
  },
});
