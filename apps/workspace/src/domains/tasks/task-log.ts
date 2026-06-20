const DEBUG =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_QENTRAH_TASK_DEBUG === "1";

/** Lightweight structured logger for the tasks domain. */
export const taskLog = {
  info(event: string, data?: Record<string, unknown>) {
    if (!DEBUG) return;
    console.info(
      `[qentrah:tasks] ${event}`,
      data ? JSON.stringify(data) : "",
    );
  },
  warn(event: string, data?: Record<string, unknown>) {
    console.warn(
      `[qentrah:tasks] ${event}`,
      data ? JSON.stringify(data) : "",
    );
  },
  error(event: string, data?: Record<string, unknown>) {
    console.error(
      `[qentrah:tasks] ${event}`,
      data ? JSON.stringify(data) : "",
    );
  },
};
