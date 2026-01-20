import dayjs from "dayjs";

/**
 * ISO week algorithm (no dayjs plugins required)
 * ISO week starts Monday, Week 1 is the week with Jan 4th.
 */

function toUTCDate(y: number, m: number, d: number) {
  // m: 1..12
  return new Date(Date.UTC(y, m - 1, d));
}

function cloneDateUTC(dt: Date) {
  return new Date(dt.getTime());
}

function addDaysUTC(dt: Date, days: number) {
  const x = cloneDateUTC(dt);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

function formatISODateUTC(dt: Date) {
  // YYYY-MM-DD
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getISODayUTC(dt: Date) {
  // Monday=1..Sunday=7
  const day = dt.getUTCDay(); // 0..6 (Sun..Sat)
  return day === 0 ? 7 : day;
}

export function getISOWeekInfoFromDate(dateISO: string): {
  isoYear: number;
  isoWeek: number;
} {
  // dateISO: YYYY-MM-DD
  const d = new Date(`${dateISO}T00:00:00Z`);
  // shift date to Thursday of this week
  const isoDay = getISODayUTC(d);
  const thursday = addDaysUTC(d, 4 - isoDay);

  const isoYear = thursday.getUTCFullYear();

  // week 1 is the week with Jan 4
  const jan4 = toUTCDate(isoYear, 1, 4);
  const jan4IsoDay = getISODayUTC(jan4);
  const week1Monday = addDaysUTC(jan4, -(jan4IsoDay - 1));

  const diffDays = Math.floor(
    (thursday.getTime() - week1Monday.getTime()) / 86400000,
  );
  const isoWeek = 1 + Math.floor(diffDays / 7);

  return { isoYear, isoWeek };
}

export function weekKeyFromDate(d: dayjs.Dayjs) {
  const iso = d.format("YYYY-MM-DD");
  const { isoYear, isoWeek } = getISOWeekInfoFromDate(iso);
  const w = String(isoWeek).padStart(2, "0");
  return `${isoYear}-W${w}`;
}

export function getWeekRangeFromWeekKey(weekKey: string) {
  // weekKey: YYYY-Wxx
  const [yStr, wStr] = weekKey.split("-W");
  const isoYear = Number(yStr);
  const isoWeek = Number(wStr);

  // week 1 Monday
  const jan4 = toUTCDate(isoYear, 1, 4);
  const jan4IsoDay = getISODayUTC(jan4);
  const week1Monday = addDaysUTC(jan4, -(jan4IsoDay - 1));

  // target week Monday
  const start = addDaysUTC(week1Monday, (isoWeek - 1) * 7);
  const end = addDaysUTC(start, 6);

  return {
    year: isoYear,
    weekNumber: isoWeek,
    startISO: formatISODateUTC(start),
    endISO: formatISODateUTC(end),
  };
}

export function weeksInMonth(year: number, month: number) {
  // month: 1..12
  const first = toUTCDate(year, month, 1);
  const last = toUTCDate(
    year,
    month,
    new Date(Date.UTC(year, month, 0)).getUTCDate(),
  ); // last day of month

  const set = new Map<
    string,
    { weekKey: string; weekNumber: number; startISO: string; endISO: string }
  >();

  for (let dt = first; dt.getTime() <= last.getTime(); dt = addDaysUTC(dt, 1)) {
    const iso = formatISODateUTC(dt);
    const { isoYear, isoWeek } = getISOWeekInfoFromDate(iso);
    const wk = `${isoYear}-W${String(isoWeek).padStart(2, "0")}`;

    if (!set.has(wk)) {
      const r = getWeekRangeFromWeekKey(wk);
      set.set(wk, {
        weekKey: wk,
        weekNumber: r.weekNumber,
        startISO: r.startISO,
        endISO: r.endISO,
      });
    }
  }

  return Array.from(set.values()).sort((a, b) =>
    a.startISO < b.startISO ? -1 : 1,
  );
}

export function isoWeekDates(weekKey: string) {
  const { startISO } = getWeekRangeFromWeekKey(weekKey);
  const start = new Date(`${startISO}T00:00:00Z`);

  return Array.from({ length: 7 }).map((_, i) => {
    const d = addDaysUTC(start, i);
    const dateISO = formatISODateUTC(d);
    const weekday = getISODayUTC(d);
    return { dateISO, weekday };
  });
}

export function weekdayLabel(weekday: number) {
  const map: Record<number, string> = {
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
    7: "Sun",
  };
  return map[weekday] ?? String(weekday);
}
