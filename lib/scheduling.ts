/** Round-trips a (dayOffset, startMin) pair — minutes from today's midnight —
 *  to/from a real `starts_at` timestamptz, in the browser's local time. */

export function toStartsAtISO(dayOffset: number, startMin: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(0, startMin, 0, 0);
  return d.toISOString();
}

export function fromStartsAt(iso: string): { dayOffset: number; startMin: number } {
  const d = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfD = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayOffset = Math.round((startOfD.getTime() - startOfToday.getTime()) / 86_400_000);
  const startMin = d.getHours() * 60 + d.getMinutes();
  return { dayOffset, startMin };
}

/* ── Business-timezone helpers (public booking page) ───────────────────────────
 * A salon's hours are in ITS timezone, whatever the visitor's browser says.
 * Dates are handled as "YYYY-MM-DD" keys in that zone. */

export const DEFAULT_TIMEZONE = "Europe/Istanbul";

function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour") % 24,
    minute: get("minute"),
    second: get("second"),
  };
}

/** Offset (ms) of `timeZone` from UTC at the given instant. */
function tzOffsetMs(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - (date.getTime() - date.getMilliseconds());
}

/** "YYYY-MM-DD" for the given instant, in `timeZone`. */
export function zonedDateKey(date: Date, timeZone: string): string {
  const p = zonedParts(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Minutes since local midnight for the given instant, in `timeZone`. */
export function zonedMinutes(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  return p.hour * 60 + p.minute;
}

/** Adds whole days to a "YYYY-MM-DD" key. */
export function addDaysToKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
}

/** Day-of-week (0 = Sunday) and day-of-month for a "YYYY-MM-DD" key. */
export function keyParts(key: string): { weekday: number; day: number; month: number; year: number } {
  const [y, m, d] = key.split("-").map(Number);
  return { weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay(), day: d, month: m, year: y };
}

/** ISO timestamp for `minutes` past local midnight of `dateKey` in `timeZone`. */
export function zonedToISO(dateKey: string, minutes: number, timeZone: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, 0, minutes);
  let ts = guess - tzOffsetMs(new Date(guess), timeZone);
  // Second pass settles DST edges where the first guess crossed a transition.
  ts = guess - tzOffsetMs(new Date(ts), timeZone);
  return new Date(ts).toISOString();
}
