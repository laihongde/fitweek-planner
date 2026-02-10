import type { WeekPlan } from "../types";

export type CopyMode = "overwrite" | "merge";

export function cloneWeekForTarget(
  source: WeekPlan,
  targetMeta: Pick<
    WeekPlan,
    | "pk"
    | "uid"
    | "weekKey"
    | "year"
    | "month"
    | "weekNumber"
    | "startISO"
    | "endISO"
  >,
  opts: { mode: CopyMode; resetProgress: boolean },
): WeekPlan {
  const now = Date.now();

  const clonedDays = source.days.map((d) => ({
    ...d,
    items: d.items.map((it) => ({
      ...it,
      progress: opts.resetProgress ? 0 : it.progress,
    })),
  }));

  return {
    ...targetMeta,
    days: clonedDays,
    updatedAt: now,
  };
}

export function mergeWeekPlans(
  existing: WeekPlan,
  incoming: WeekPlan,
  resetProgress: boolean,
): WeekPlan {
  // merge by dateISO; merge items by id (append if missing)
  const byDate = new Map(existing.days.map((d) => [d.dateISO, d]));
  const mergedDays = incoming.days.map((d) => {
    const ex = byDate.get(d.dateISO);
    if (!ex) return d;

    const existingItemIds = new Set(ex.items.map((it) => it.id));
    const extra = d.items.filter((it) => !existingItemIds.has(it.id));
    const mergedItems = [...ex.items, ...extra].map((it) => ({
      ...it,
      progress: resetProgress ? 0 : it.progress,
    }));

    return {
      ...ex,
      title: ex.title ?? d.title,
      items: mergedItems,
    };
  });

  return {
    ...existing,
    days: mergedDays,
    updatedAt: Date.now(),
  };
}
