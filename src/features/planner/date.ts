import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat);

export function weekKeyFromDate(d: dayjs.Dayjs) {
  const y = d.isoWeekYear();
  const w = String(d.isoWeek()).padStart(2, "0");
  return `${y}-W${w}`;
}

export function getWeekRangeFromWeekKey(weekKey: string) {
  // weekKey: YYYY-Wxx
  const [yStr, wStr] = weekKey.split("-W");
  const year = Number(yStr);
  const week = Number(wStr);

  const start = dayjs().isoWeekYear(year).isoWeek(week).startOf("isoWeek");
  const end = start.endOf("isoWeek");

  return {
    year,
    weekNumber: week,
    startISO: start.format("YYYY-MM-DD"),
    endISO: end.format("YYYY-MM-DD"),
  };
}

export function weeksInMonth(year: number, month: number) {
  // month: 1..12
  const first = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
  const last = first.endOf("month");

  // collect week keys that overlap this month
  const set = new Map<
    string,
    { weekKey: string; weekNumber: number; startISO: string; endISO: string }
  >();

  // iterate day-by-day (fast enough; max 31)
  for (
    let d = first;
    d.isBefore(last) || d.isSame(last, "day");
    d = d.add(1, "day")
  ) {
    const wk = weekKeyFromDate(d);
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

  // stable sort by start date
  return Array.from(set.values()).sort((a, b) =>
    a.startISO < b.startISO ? -1 : 1,
  );
}

export function isoWeekDates(weekKey: string) {
  const { startISO } = getWeekRangeFromWeekKey(weekKey);
  const start = dayjs(startISO);
  return Array.from({ length: 7 }).map((_, i) => {
    const d = start.add(i, "day");
    return { dateISO: d.format("YYYY-MM-DD"), weekday: d.isoWeekday() };
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
