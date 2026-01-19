import { useEffect, useMemo, useState } from "react";
import { Layout, message } from "antd";
import dayjs from "dayjs";

import PageShell from "../../shared/components/PageShell";
import { useAuth } from "../../features/auth/useAuth";
import { usePlannerStore } from "../../features/planner/store";
import { weeksInMonth } from "../../features/planner/date";
import { upsertWeekPlan, getWeekPlan } from "../../features/planner/repo/plannerRepo";
import type { CopyMode } from "../../features/planner/utils/copy";
import { cloneWeekForTarget, mergeWeekPlans } from "../../features/planner/utils/copy";

import WeekSelector from "./sections/WeekSelector";
import WeekSummary from "./sections/WeekSummary";
import WeekPlanEditor from "./sections/WeekPlanEditor";
import CopyWeekModal from "./sections/CopyWeekModal";

const { Sider, Content } = Layout;

export default function PlannerPage() {
  const { user } = useAuth();
  const uid = user!.uid;

  const { year, month, selectedWeekKey, setYearMonth, setSelectedWeekKey, activePlan, loadWeek } =
    usePlannerStore();

  const [copyOpen, setCopyOpen] = useState(false);

  const weekOptions = useMemo(() => weeksInMonth(year, month), [year, month]);

  // initial align: if selected week not in month, pick first
  useEffect(() => {
    if (!weekOptions.length) return;
    const exists = weekOptions.some((w) => w.weekKey === selectedWeekKey);
    if (!exists) setSelectedWeekKey(weekOptions[0].weekKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, weekOptions.length]);

  useEffect(() => {
    loadWeek(uid, selectedWeekKey, year, month).catch(() => {
      message.error("Failed to load week plan");
    });
  }, [uid, selectedWeekKey, year, month, loadWeek]);

  const onCopyWeeks = async (targetWeekKeys: string[], mode: CopyMode, resetProgress: boolean) => {
    if (!activePlan) return;

    try {
      const targets = targetWeekKeys.filter((wk) => wk !== activePlan.weekKey);
      if (!targets.length) return;

      for (const wk of targets) {
        // infer month/year for target display: use start date
        // weekKey already implies isoWeekYear; month for UI grouping not super important
        const range = (await import("../../features/planner/date")).getWeekRangeFromWeekKey(wk);
        const startMonth = dayjs(range.startISO).month() + 1;

        const targetMeta = {
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
          const ex = await getWeekPlan(uid, wk);
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

  // const monthPlansCount = useMemo(async () => {
  //   // optional: left panel badge use
  //   return (await listWeekPlansInMonth(uid, year, month)).length;
  // }, [uid, year, month]);

  return (
    <PageShell title="FitWeek Planner">
      <Layout style={{ background: "transparent", gap: 16 }}>
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

        <Content style={{ background: "transparent", display: "flex", flexDirection: "column", gap: 16 }}>
          <WeekSummary plan={activePlan} onOpenCopy={() => setCopyOpen(true)} />
          <WeekPlanEditor uid={uid} plan={activePlan} />
        </Content>
      </Layout>

      <CopyWeekModal
        open={copyOpen}
        onClose={() => setCopyOpen(false)}
        sourceWeekKey={activePlan?.weekKey ?? selectedWeekKey}
        weekOptions={weekOptions}
        onConfirm={onCopyWeeks}
      />
    </PageShell>
  );
}
