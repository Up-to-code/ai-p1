import type { ReadHandler, WriteHandler } from "./shared";

export const readHandlers = new Map<string, ReadHandler>();
export const writeHandlers = new Map<string, WriteHandler>();

export function registerReadHandler(tool: string, handler: ReadHandler) {
  readHandlers.set(tool, handler);
}

export function registerWriteHandler(tool: string, handler: WriteHandler) {
  writeHandlers.set(tool, handler);
}
