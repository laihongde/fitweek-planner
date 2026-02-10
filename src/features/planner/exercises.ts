export const EXERCISE_SEED: string[] = [
  "啞鈴臥推",
  "啞鈴深蹲",
  "羅馬尼亞硬舉",
  "引體向上",
  "平板撐",
];

export function norm(s: string) {
  return s.trim().toLowerCase();
}

export function searchExerciseNames(query: string, limit: number = 8) {
  const q = norm(query);
  if (!q) return [];

  const startsWith: string[] = [];
  const includes: string[] = [];

  for (const name of EXERCISE_SEED) {
    const n = norm(name);
    if (n.startsWith(q)) startsWith.push(name);
    else if (n.includes(q)) includes.push(name);
  }

  startsWith.sort((a, b) => a.localeCompare(b));
  includes.sort((a, b) => a.localeCompare(b));

  return [...startsWith, ...includes].slice(0, limit);
}
