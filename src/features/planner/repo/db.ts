import Dexie, { type Table } from "dexie";
import type { WeekPlan, ExerciseNameRecord } from "../types";

const DB_NAME = import.meta.env.PROD
  ? "fitweek_planner"
  : "fitweek_planner_dev";

export class FitWeekDB extends Dexie {
  weekPlans!: Table<WeekPlan, string>;
  exerciseNames!: Table<ExerciseNameRecord, string>;

  constructor() {
    super(DB_NAME);

    this.version(1).stores({
      weekPlans: "&pk, uid, weekKey, year, month, updatedAt",
    });

    this.version(2).stores({
      weekPlans: "&pk, uid, weekKey, year, month, updatedAt",
      exerciseNames: "&pk, uid, nameNorm, count, lastUsedAt",
    });
  }
}

export const db = new FitWeekDB();
