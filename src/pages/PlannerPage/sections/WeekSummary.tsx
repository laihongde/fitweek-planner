import { useMemo } from "react";
import { Button, Card, Progress, Space, Typography } from "antd";
import type { WeekPlan } from "../../../features/planner/types";
import { calcWeekProgress } from "../../../features/planner/utils/progress";

export default function WeekSummary({
  plan,
  onOpenCopy,
}: {
  plan: WeekPlan | null;
  onOpenCopy: () => void;
}) {
  const pct = useMemo(() => calcWeekProgress(plan), [plan]);

  return (
    <Card
      size="small"
      title="本週概覽"
      extra={
        <Button onClick={onOpenCopy} disabled={!plan}>
          Copy to other weeks
        </Button>
      }
    >
      {plan ? (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Typography.Text>
            <strong>{plan.weekKey}</strong> ({plan.startISO} ~ {plan.endISO})
          </Typography.Text>
          <Progress percent={pct} />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            進度目前完成計算 (0~100%)
          </Typography.Text>
        </Space>
      ) : (
        <Typography.Text type="secondary">Loading...</Typography.Text>
      )}
    </Card>
  );
}
