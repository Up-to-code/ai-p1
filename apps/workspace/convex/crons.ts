import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "recover queued notification jobs",
  { minutes: 5 },
  internal.notifications.dispatch.recoverDueJobs,
  {},
);

crons.interval(
  "process search indexing outbox",
  { minutes: 1 },
  internal.search.worker.processBatch,
  {},
);

crons.interval(
  "process search reindex jobs",
  { minutes: 1 },
  internal.search.reindex.processNextBatch,
  {},
);

crons.interval(
  "scan uploaded media for malware",
  { minutes: 1 },
  internal.search.extractionWorker.processSecurityBatch,
  {},
);

crons.interval(
  "extract authorized attachment content",
  { minutes: 1 },
  internal.search.extractionWorker.processExtractionBatch,
  {},
);

export default crons;
