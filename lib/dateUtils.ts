import { format, parseISO } from "date-fns";

// Workout/diet dates only ever represent a calendar day, not a moment in
// time, but the API returns them as ISO strings like
// "2026-08-10T00:00:00.000Z" (Prisma DateTime, always stored at UTC
// midnight for these date-only fields).
//
// If we parsed that with the "Z" intact and then formatted it in the
// browser's local timezone, the day could shift backwards for anyone west
// of UTC. So instead we always take the "YYYY-MM-DD" prefix as the source
// of truth and re-parse it as *local* midnight (no "Z") before formatting -
// that round-trips through the same timezone both times, so it can't shift.
function toLocalMidnight(date: string) {
  return parseISO(`${date.slice(0, 10)}T00:00:00`);
}

// For <input type="date"> values and API query params: "2026-08-10".
export function toDateInputValue(date: string): string {
  return date.slice(0, 10);
}

export function todayInputValue(): string {
  return format(new Date(), "yyyy-MM-dd");
}

// For display in the UI: "Aug 10, 2026".
export function formatDisplayDate(date: string): string {
  return format(toLocalMidnight(date), "MMM d, yyyy");
}
