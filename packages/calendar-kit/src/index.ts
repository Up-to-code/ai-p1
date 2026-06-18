/**
 * @qentrah/calendar-kit
 *
 * Qentrah's production calendar scheduler — Month, Week, and Day views with
 * full TypeScript support and Qentrah design-system integration.
 *
 * Based on calendarkit-basic (MIT) — extended and maintained by Qentrah Team.
 */

// Re-export everything from the compiled dist bundle.
// When building from source (npm run build), rollup compiles
// the full scheduler from src/scheduler/ into dist/.
export { BasicScheduler } from '../dist/index.esm.js';
export type { CalendarEvent, ViewType, CalendarProps } from '../dist/index.esm.js';
