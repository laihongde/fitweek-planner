import { create } from "zustand";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

import type { WeekPlan, WeekKey, WorkoutItem } from "./types";
import { getWeekPlan, upsertWeekPlan } from "./repo/plannerRepo";
import { getWeekRangeFromWeekKey, isoWeekDates, weekKeyFromDate } from "./date";
import { recordExerciseName } from "./repo/exerciseRepo";

type PlannerState = {
  year: number;
  month: number; // 1..12
  selectedWeekKey: WeekKey;
  activePlan: WeekPlan | null;

  setYearMonth: (year: number, month: number) => void;
  setSelectedWeekKey: (wk: WeekKey) => void;

  loadWeek: (
    uid: string,
    wk: WeekKey,
    year: number,
    month: number,
  ) => Promise<void>;
  ensureWeek: (
    uid: string,
    wk: WeekKey,
    year: number,
    month: number,
  ) => Promise<WeekPlan>;

  addItem: (
    uid: string,
    dayISO: string,
    payload: {
      name: string;
      sets: number;
      reps: number;
      weight: number;
      note?: string;
    },
  ) => Promise<string | null>;
  updateItem: (uid: string, dayISO: string, item: WorkoutItem) => Promise<void>;
  deleteItem: (uid: string, dayISO: string, itemId: string) => Promise<void>;
  setItemProgress: (
    uid: string,
    dayISO: string,
    itemId: string,
    progress: number,
  ) => Promise<void>;
  setDayItemsProgress: (
    uid: string,
    dayISO: string,
    progress: number,
  ) => Promise<void>;
  copyDayToDay: (
    uid: string,
    sourceDayISO: string,
    targetWeekKey: string,
    targetWeekDay: number,
    opts: { mode: "overwrite" | "merge"; resetProgress: boolean },
  ) => Promise<void>;
};

function makePk(uid: string, weekKey: string) {
  return `${uid}|${weekKey}`;
}

function defaultYearMonth() {
  const now = dayjs();
  return { year: now.year(), month: now.month() + 1 };
}

function defaultWeekKey() {
  return weekKeyFromDate(dayjs());
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  ...defaultYearMonth(),
  selectedWeekKey: defaultWeekKey(),
  activePlan: null,

  setYearMonth: (year, month) => set({ year, month }),
  setSelectedWeekKey: (wk) => set({ selectedWeekKey: wk }),

  loadWeek: async (uid, wk, year, month) => {
    const planPk = makePk(uid, wk);
    const existing = await getWeekPlan(planPk);
    if (existing) {
      set({ activePlan: existing });
      return;
    }
    const created = await get().ensureWeek(uid, wk, year, month);
    set({ activePlan: created });
  },

  ensureWeek: async (uid, wk, _, month) => {
    const meta = getWeekRangeFromWeekKey(wk);
    const days = isoWeekDates(wk).map((d) => ({
      dateISO: d.dateISO,
      weekday: d.weekday,
      title: "",
      items: [],
    }));

    const plan: WeekPlan = {
      pk: `${uid}|${wk}`,
      uid,
      weekKey: wk,
      year: meta.year,
      month,
      weekNumber: meta.weekNumber,
      startISO: meta.startISO,
      endISO: meta.endISO,
      days,
      updatedAt: Date.now(),
    };

    await upsertWeekPlan(plan);
    return plan;
  },

  addItem: async (_, dayISO, payload) => {
    const plan = get().activePlan;
    if (!plan) return null;

    const name = payload.name.trim();
    if (!name) return null;

    const next = structuredClone(plan);
    const day = next.days.find((d) => d.dateISO === dayISO);
    if (!day) return null;

    const id = uuidv4();

    day.items.push({
      id,
      name,
      sets: payload.sets,
      reps: payload.reps,
      weight: payload.weight,
      note: payload.note ?? "",
      progress: 0,
    });
    await recordExerciseName(plan.uid, name);

    next.updatedAt = Date.now();
    await upsertWeekPlan(next);

    set({ activePlan: next });

    return id;
  },

  updateItem: async (_, dayISO, item) => {
    const plan = get().activePlan;
    if (!plan) return;

    const next = structuredClone(plan);
    const day = next.days.find((d) => d.dateISO === dayISO);
    if (!day) return;

    const idx = day.items.findIndex((it) => it.id === item.id);
    if (idx === -1) return;
    day.items[idx] = item;

    next.updatedAt = Date.now();
    await upsertWeekPlan(next);
    set({ activePlan: next });
  },

  deleteItem: async (_, dayISO, itemId) => {
    const plan = get().activePlan;
    if (!plan) return;

    const next = structuredClone(plan);
    const day = next.days.find((d) => d.dateISO === dayISO);
    if (!day) return;

    day.items = day.items.filter((it) => it.id !== itemId);

    next.updatedAt = Date.now();
    await upsertWeekPlan(next);
    set({ activePlan: next });
  },

  setItemProgress: async (_, dayISO, itemId, progress) => {
    const plan = get().activePlan;
    if (!plan) return;

    const next = structuredClone(plan);
    const day = next.days.find((d) => d.dateISO === dayISO);
    if (!day) return;

    const it = day.items.find((x) => x.id === itemId);
    if (!it) return;
    it.progress = Math.max(0, Math.min(100, progress));

    next.updatedAt = Date.now();
    await upsertWeekPlan(next);
    set({ activePlan: next });
  },

  setDayItemsProgress: async (_, dayISO, progress) => {
    const plan = get().activePlan;
    if (!plan) return;

    const next = structuredClone(plan);
    const day = next.days.find((d) => d.dateISO === dayISO);
    if (!day) return;

    const p = Math.max(0, Math.min(100, progress));
    day.items = day.items.map((it) => ({ ...it, progress: p }));

    next.updatedAt = Date.now();
    await upsertWeekPlan(next);
    set({ activePlan: next });
  },

  copyDayToDay: async (
    uid,
    sourceDayISO,
    targetWeekKey,
    targetWeekday,
    opts,
  ) => {
    const plan = get().activePlan;
    if (!plan) return;

    const sourceDay = plan.days.find((d) => d.dateISO === sourceDayISO);
    if (!sourceDay) return;

    // 1) 確保 target week plan 存在
    const targetPk = makePk(uid, targetWeekKey);
    let targetPlan = await getWeekPlan(targetPk);
    if (!targetPlan) {
      const meta = getWeekRangeFromWeekKey(targetWeekKey);
      const startMonth = Number(meta.startISO.slice(5, 7)); // 01..12
      const days = isoWeekDates(targetWeekKey).map((d) => ({
        dateISO: d.dateISO,
        weekday: d.weekday,
        title: "",
        items: [],
      }));

      targetPlan = {
        pk: targetPk,
        uid,
        weekKey: targetWeekKey,
        year: meta.year,
        month: startMonth,
        weekNumber: meta.weekNumber,
        startISO: meta.startISO,
        endISO: meta.endISO,
        days,
        updatedAt: Date.now(),
      };
    }

    const nextTarget: WeekPlan = structuredClone(targetPlan);
    const targetDay = nextTarget.days.find((d) => d.weekday === targetWeekday);
    if (!targetDay) return;

    const incomingItems = sourceDay.items.map((it) => ({
      ...it,
      progress: opts.resetProgress ? 0 : it.progress,
    }));

    if (opts.mode === "overwrite") {
      targetDay.items = incomingItems;
      targetDay.title = targetDay.title || sourceDay.title;
    } else {
      // merge: append items with new ids to avoid collisions
      const { v4: uuidv4 } = await import("uuid");
      const existingNames = new Set(targetDay.items.map((x) => x.name));
      const toAppend = incomingItems
        .filter((x) => !existingNames.has(x.name))
        .map((x) => ({ ...x, id: uuidv4() }));
      targetDay.items = [...targetDay.items, ...toAppend];
    }

    nextTarget.updatedAt = Date.now();
    await upsertWeekPlan(nextTarget);

    // 2) 如果複製到同一週，順便更新 activePlan 讓 UI 立即刷新
    if (plan.weekKey === targetWeekKey) {
      set({ activePlan: nextTarget });
    }
  },
}));
