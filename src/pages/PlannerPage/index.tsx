import { useEffect, useMemo, useState } from "react";
import { Layout, message, Grid, Button, Drawer } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import PageShell from "../../shared/components/PageShell";
import { useAuth } from "../../features/auth/useAuth";
import { usePlannerStore } from "../../features/planner/store";
import { weeksInMonth } from "../../features/planner/date";
import { upsertWeekPlan, getWeekPlan } from "../../features/planner/repo/plannerRepo";
import type { CopyMode } from "../../features/planner/utils/copy";
import { cloneWeekForTarget, mergeWeekPlans } from "../../features/planner/utils/copy";
import { ensureExerciseSeed } from "../../features/planner/repo/exerciseRepo";

import WeekSelector from "./sections/WeekSelector";
import WeekSummary from "./sections/WeekSummary";
import WeekPlanEditor from "./sections/WeekPlanEditor";
import CopyWeekModal from "./sections/CopyWeekModal";
import CopyDayModal from "./sections/CopyDayModal";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

export default function PlannerPage() {
  const { user } = useAuth();
  const uid = user!.uid;

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const {
    year,
    month,
    selectedWeekKey,
    setYearMonth,
    setSelectedWeekKey,
    activePlan,
    loadWeek,
  } = usePlannerStore();

  const [copyOpen, setCopyOpen] = useState(false);
  const [weekDrawerOpen, setWeekDrawerOpen] = useState(false);
  const [copyDayOpen, setCopyDayOpen] = useState(false);
  const [copyDaySourceISO, setCopyDaySourceISO] = useState<string | null>(null);

  const weekOptions = useMemo(() => weeksInMonth(year, month), [year, month]);

  // 若 selectedWeekKey 不在此月週列表，選第一個
  useEffect(() => {
    if (!weekOptions.length) return;
    const exists = weekOptions.some((w) => w.weekKey === selectedWeekKey);
    if (!exists) setSelectedWeekKey(weekOptions[0].weekKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, weekOptions.length]);

  // 讀取/建立該週 plan
  useEffect(() => {
    loadWeek(uid, selectedWeekKey, year, month).catch(() => {
      message.error("Failed to load week plan");
    });
  }, [uid, selectedWeekKey, year, month, loadWeek]);

  useEffect(() => {
    ensureExerciseSeed(uid).catch(() => {});
  }, [uid]);

  const onCopyWeeks = async (targetWeekKeys: string[], mode: CopyMode, resetProgress: boolean) => {
    if (!activePlan) return;

    try {
      const targets = targetWeekKeys.filter((wk) => wk !== activePlan.weekKey);
      if (!targets.length) return;

      for (const wk of targets) {
        const { getWeekRangeFromWeekKey } = await import("../../features/planner/date");
        const range = getWeekRangeFromWeekKey(wk);
        const startMonth = dayjs(range.startISO).month() + 1;

        const targetMeta = {
          pk: `${uid}|${wk}`,
          uid,
          weekKey: wk,
          year: range.year,
          month: startMonth,
          weekNumber: range.weekNumber,
          startISO: range.startISO,
          endISO: range.endISO,
        };

        const incoming = cloneWeekForTarget(activePlan, targetMeta, { mode, resetProgress });

        if (mode === "overwrite") {
          await upsertWeekPlan(incoming);
        } else {
          const weekPk = `${uid}|${wk}`;
          const ex = await getWeekPlan(weekPk);
          if (ex) {
            const merged = mergeWeekPlans(ex, incoming, resetProgress);
            await upsertWeekPlan(merged);
          } else {
            await upsertWeekPlan(incoming);
          }
        }
      }

      setCopyOpen(false);
      message.success("Copied!");
    } catch {
      message.error("Copy failed");
    }
  };

  return (
    <PageShell title="我是什麼很健的人嗎">
      {/* 手機：上方工具列 */}
      {isMobile && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12, justifyContent: "space-between" }}>
          <Button icon={<MenuOutlined />} onClick={() => setWeekDrawerOpen(true)}>
            選擇週
          </Button>
          <Button onClick={() => setCopyOpen(true)} disabled={!activePlan}>
            複製本週
          </Button>
        </div>
      )}

      <Layout style={{ background: "transparent", gap: 16 }}>
        {/* 桌機：左欄常駐 */}
        {!isMobile && (
          <Sider width={340} style={{ background: "transparent" }}>
            <WeekSelector
              year={year}
              month={month}
              weekOptions={weekOptions}
              selectedWeekKey={selectedWeekKey}
              onYearMonthChange={(y, m) => setYearMonth(y, m)}
              onSelectWeek={(wk) => setSelectedWeekKey(wk)}
            />
          </Sider>
        )}

        {/* 主內容 */}
        <Content style={{ background: "transparent", display: "flex", flexDirection: "column", gap: 16 }}>
          <WeekSummary plan={activePlan} onOpenCopy={() => setCopyOpen(true)} />
          <WeekPlanEditor uid={uid} plan={activePlan} onOpenCopy={(sourceDayISO) => {
            setCopyDaySourceISO(sourceDayISO);
            setCopyDayOpen(true);
          }} />
        </Content>
      </Layout>

      {/* 手機：Drawer 選週 */}
      <Drawer
        title="選擇週"
        open={weekDrawerOpen}
        onClose={() => setWeekDrawerOpen(false)}
        width="92vw"
        bodyStyle={{ padding: 12 }}
      >
        <WeekSelector
          year={year}
          month={month}
          weekOptions={weekOptions}
          selectedWeekKey={selectedWeekKey}
          onYearMonthChange={(y, m) => setYearMonth(y, m)}
          onSelectWeek={(wk) => {
            setSelectedWeekKey(wk);
            setWeekDrawerOpen(false);
          }}
          compact // 手機 drawer 內 compact 模式
        />
      </Drawer>

      <CopyWeekModal
        open={copyOpen}
        onClose={() => setCopyOpen(false)}
        sourceWeekKey={activePlan?.weekKey ?? selectedWeekKey}
        weekOptions={weekOptions}
        onConfirm={onCopyWeeks}
      />

      <CopyDayModal
        open={copyDayOpen}
        onClose={() => setCopyDayOpen(false)}
        sourceDayISO={copyDaySourceISO}
        defaultTargetWeekKey={activePlan?.weekKey ?? selectedWeekKey}
        weekOptions={weekOptions}
        onConfirm={async ({ targetWeekKey, targetWeekday, mode, resetProgress }) => {
          if (!copyDaySourceISO) return;
          await usePlannerStore.getState().copyDayToDay(uid, copyDaySourceISO, targetWeekKey, targetWeekday, {
            mode,
            resetProgress,
          });
          setCopyDayOpen(false);
        }}
      />
    </PageShell>
  );
}
