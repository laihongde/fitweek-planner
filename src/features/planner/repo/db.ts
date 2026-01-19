import Dexie, { type Table } from "dexie";
import type { WeekPlan } from "../types";

export class FitWeekDB extends Dexie {
  weekPlans!: Table<WeekPlan, string>;

  constructor() {
    super("fitweek_planner");
    this.version(1).stores({
      // primary key: uid|weekKey
      weekPlans: "&pk, uid, weekKey, year, month, updatedAt",
    });

    this.weekPlans.mapToClass(Object);
  }
}

export const db = new FitWeekDB();
