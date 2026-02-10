import { db } from "./db";
import type { WeekPlan } from "../types";

export async function getWeekPlan(pk: string) {
  return db.weekPlans.get(pk);
}

export async function upsertWeekPlan(plan: WeekPlan) {
  await db.weekPlans.put(plan);
}

export async function deleteWeekPlan(pk: string) {
  await db.weekPlans.delete(pk);
}

export async function listWeekPlansInMonth(
  uid: string,
  year: number,
  month: number,
) {
  // using indexed fields year/month
  const all = await db.weekPlans.where({ uid, year, month }).toArray();

  // ensure stable ordering
  return all.sort((a, b) => (a.startISO < b.startISO ? -1 : 1));
}
