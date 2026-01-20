export const EXERCISE_NAMES: string[] = [
  // ===== 胸 Chest =====
  "臥推",
  "上斜臥推",
  "下斜臥推",
  "啞鈴臥推",
  "上斜啞鈴臥推",
  "伏地挺身",
  "滑輪夾胸",
  "啞鈴飛鳥",
  "上斜飛鳥",
  "機械式胸推",

  // ===== 肩 Shoulders =====
  "肩推（推舉）",
  "啞鈴肩推",
  "阿諾肩推",
  "側平舉",
  "前平舉",
  "反向飛鳥",
  "面拉",
  "直立划船",

  // ===== 背 Back =====
  "引體向上",
  "反手引體向上",
  "寬握引體向上",
  "滑輪下拉",
  "窄握下拉",
  "槓鈴划船",
  "啞鈴划船",
  "單手啞鈴划船",
  "坐姿滑輪划船",
  "T 槓划船",
  "高位划船",
  "直臂下拉",

  // ===== 腿 Legs =====
  "深蹲",
  "前蹲",
  "高腳杯深蹲",
  "腿推",
  "腿伸展",
  "腿彎舉",
  "羅馬尼亞硬舉",
  "硬舉",
  "相撲硬舉",
  "分腿蹲",
  "保加利亞分腿蹲",
  "弓箭步",
  "行走弓箭步",
  "臀推",
  "臀橋",
  "腿後側拉伸（腿後腱）",

  // ===== 小腿 Calves =====
  "站姿小腿抬舉",
  "坐姿小腿抬舉",
  "單腳小腿抬舉",

  // ===== 二頭 Biceps =====
  "二頭彎舉",
  "槓鈴彎舉",
  "啞鈴彎舉",
  "錘式彎舉",
  "集中彎舉",
  "斜板彎舉",

  // ===== 三頭 Triceps =====
  "雙槓撐體",
  "三頭肌下壓",
  "繩索下壓",
  "仰臥臂屈伸",
  "啞鈴過頭臂屈伸",
  "窄握臥推",

  // ===== 核心 Core =====
  "平板撐",
  "側平板撐",
  "捲腹",
  "反向捲腹",
  "仰臥起坐",
  "懸垂舉腿",
  "死蟲式",
  "俄羅斯轉體",
  "登山者",

  // ===== 有氧 / 功能性 =====
  "跑步機跑步",
  "飛輪",
  "划船機",
  "波比跳",
  "跳繩",
  "壺鈴擺盪",
  "農夫走路",
];

function norm(s: string) {
  return s.trim().toLowerCase();
}

export function searchExerciseNames(query: string, limit: number = 8) {
  const q = norm(query);
  if (!q) return [];

  const startsWith: string[] = [];
  const includes: string[] = [];

  for (const name of EXERCISE_NAMES) {
    const n = norm(name);
    if (n.startsWith(q)) startsWith.push(name);
    else if (n.includes(q)) includes.push(name);
  }

  startsWith.sort((a, b) => a.localeCompare(b));
  includes.sort((a, b) => a.localeCompare(b));

  return [...startsWith, ...includes].slice(0, limit);
}
