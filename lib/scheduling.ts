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
