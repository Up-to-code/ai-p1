import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "recover queued notification jobs",
  { minutes: 5 },
  internal.notifications.dispatch.recoverDueJobs,
  {},
);

export default crons;
