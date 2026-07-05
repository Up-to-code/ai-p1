import { logger } from "@/lib/logger";

const DEBUG =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_QENTRAH_TASK_DEBUG === "1";

const taskLogger = logger.withModule('tasks');

/** Lightweight structured logger for the tasks domain. */
export const taskLog = {
  info(event: string, data?: Record<string, unknown>) {
    if (!DEBUG) return;
    taskLogger.info(event, data);
  },
  warn(event: string, data?: Record<string, unknown>) {
    taskLogger.warn(event, data);
  },
  error(event: string, data?: Record<string, unknown>) {
    taskLogger.error(event, data);
  },
};
