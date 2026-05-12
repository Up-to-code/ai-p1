export type QueuePriority = "low" | "normal" | "high" | "critical";

export interface QueueJobEnvelope {
  readonly jobType: string;
  readonly priority: QueuePriority;
  readonly correlationId?: string;
}
