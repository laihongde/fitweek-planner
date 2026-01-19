import type { WeekPlan } from "../types";

export function calcDayProgress(day: WeekPlan["days"][number]) {
  const items = day.items;
  if (!items.length) return 0;
  const sum = items.reduce((acc, it) => acc + clamp(it.progress), 0);
  return Math.round(sum / items.length);
}

export function calcWeekProgress(plan: WeekPlan | null | undefined) {
  if (!plan) return 0;
  const daysWithItems = plan.days.filter((d) => d.items.length > 0);
  if (!daysWithItems.length) return 0;
  const sum = daysWithItems.reduce((acc, d) => acc + calcDayProgress(d), 0);
  return Math.round(sum / daysWithItems.length);
}

export function clamp(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}
