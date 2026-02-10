export type WeekKey = string; // e.g. "2026-W04"

export type WorkoutItem = {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  note?: string;
  progress: number; // 0..100
};

export type DayPlan = {
  dateISO: string; // YYYY-MM-DD
  weekday: number; // 1..7
  title?: string; // Push / Pull / Legs...
  items: WorkoutItem[];
};

export type WeekPlan = {
  pk: string; // `${uid}|${weekKey}`
  uid: string;
  weekKey: WeekKey;
  year: number;
  month: number; // 1..12
  weekNumber: number; // ISO week number
  startISO: string; // YYYY-MM-DD
  endISO: string; // YYYY-MM-DD
  days: DayPlan[];
  updatedAt: number;
};

export type ExerciseNameRecord = {
  pk: string;
  uid: string;
  name: string;
  nameNorm: string;
  count: number;
  lastUsedAt: number;
};
