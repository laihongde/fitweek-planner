import { create } from "zustand";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

import type { WeekPlan, WeekKey, WorkoutItem } from "./types";
import { getWeekPlan, upsertWeekPlan } from "./repo/plannerRepo";
import { getWeekRangeFromWeekKey, isoWeekDates, weekKeyFromDate } from "./date";

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
};

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
    const existing = await getWeekPlan(uid, wk);
    if (existing) {
      set({ activePlan: existing });
      return;
    }
    const created = await get().ensureWeek(uid, wk, year, month);
    set({ activePlan: created });
  },

  ensureWeek: async (uid, wk, year, month) => {
    const meta = getWeekRangeFromWeekKey(wk);
    const days = isoWeekDates(wk).map((d) => ({
      dateISO: d.dateISO,
      weekday: d.weekday,
      title: "",
      items: [],
    }));

    const plan: WeekPlan = {
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

  addItem: async (uid, dayISO, payload) => {
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

    next.updatedAt = Date.now();
    await upsertWeekPlan(next);
    set({ activePlan: next });

    return id;
  },

  updateItem: async (uid, dayISO, item) => {
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

  deleteItem: async (uid, dayISO, itemId) => {
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

  setItemProgress: async (uid, dayISO, itemId, progress) => {
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
}));
