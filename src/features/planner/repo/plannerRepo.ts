import { db } from "./db";
import type { WeekPlan } from "../types";

function pk(uid: string, weekKey: string) {
  return `${uid}|${weekKey}`;
}

export async function getWeekPlan(uid: string, weekKey: string) {
  return db.weekPlans.get(pk(uid, weekKey));
}

export async function upsertWeekPlan(plan: WeekPlan) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.weekPlans.put({ ...(plan as any), pk: pk(plan.uid, plan.weekKey) });
}

export async function deleteWeekPlan(uid: string, weekKey: string) {
  await db.weekPlans.delete(pk(uid, weekKey));
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
