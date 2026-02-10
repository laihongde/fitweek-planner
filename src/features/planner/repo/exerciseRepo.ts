import { db } from "./db";
import type { ExerciseNameRecord } from "../types";
import { EXERCISE_SEED, norm } from "../exercises";

function pk(uid: string, nameNorm: string) {
  return `${uid}|${nameNorm}`;
}

export async function ensureExerciseSeed(uid: string) {
  const existing = await db.exerciseNames.where({ uid }).limit(1).toArray();
  if (existing.length > 0) return;

  const now = Date.now();
  const records: ExerciseNameRecord[] = EXERCISE_SEED.map((name) => {
    const nameNorm = norm(name);
    return {
      pk: pk(uid, nameNorm),
      uid,
      name,
      nameNorm,
      count: 0,
      lastUsedAt: now,
    };
  });

  await db.exerciseNames.bulkPut(records);
}

/** 使用者每次新增/輸入動作時，寫入/累加 */
export async function recordExerciseName(uid: string, name: string) {
  const nameNorm = norm(name);
  if (!nameNorm) return;

  const id = pk(uid, nameNorm);
  const now = Date.now();

  const ex = await db.exerciseNames.get(id);
  if (ex) {
    await db.exerciseNames.put({
      ...ex,
      name: name.trim(),
      count: (ex.count ?? 0) + 1,
      lastUsedAt: now,
    });
  } else {
    await db.exerciseNames.put({
      pk: id,
      uid,
      name: name.trim(),
      nameNorm,
      count: 1,
      lastUsedAt: now,
    });
  }
}

/** 搜尋：startsWith 優先，再 includes；同時依 count/lastUsedAt 排序 */
export async function searchExerciseNames(
  uid: string,
  query: string,
  limit = 8,
) {
  const q = norm(query);
  if (!q) {
    // 沒輸入時回傳最常用
    const top = await db.exerciseNames.where({ uid }).sortBy("count"); // Dexie sortBy 是升序
    return top
      .reverse()
      .slice(0, limit)
      .map((r) => r.name);
  }

  // Dexie 不支援複雜 contains index 查詢，這裡用 uid 範圍取回後在前端做過濾
  // 因為你的資料量預期不大（用戶習慣），這樣最簡單穩定。
  const all = await db.exerciseNames.where({ uid }).toArray();

  const starts: ExerciseNameRecord[] = [];
  const includes: ExerciseNameRecord[] = [];

  for (const r of all) {
    if (r.nameNorm.startsWith(q)) starts.push(r);
    else if (r.nameNorm.includes(q)) includes.push(r);
  }

  const scoreSort = (a: ExerciseNameRecord, b: ExerciseNameRecord) => {
    // count 大優先；同 count 則 lastUsedAt 新優先；再字典序
    if ((b.count ?? 0) !== (a.count ?? 0))
      return (b.count ?? 0) - (a.count ?? 0);
    if ((b.lastUsedAt ?? 0) !== (a.lastUsedAt ?? 0))
      return (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0);
    return a.name.localeCompare(b.name);
  };

  starts.sort(scoreSort);
  includes.sort(scoreSort);

  return [...starts, ...includes].slice(0, limit).map((r) => r.name);
}
