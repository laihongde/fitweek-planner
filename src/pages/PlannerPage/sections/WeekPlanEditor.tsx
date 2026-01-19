import { useMemo } from "react";
import { Button, Card, Space, Typography, Divider, InputNumber } from "antd";
import { EditableProTable } from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";

import type { WeekPlan, WorkoutItem } from "../../../features/planner/types";
import { weekdayLabel } from "../../../features/planner/date";
import { usePlannerStore } from "../../../features/planner/store";

export default function WeekPlanEditor({ uid, plan }: { uid: string; plan: WeekPlan | null }) {
  const { addItem, updateItem, deleteItem, setItemProgress } = usePlannerStore();

  const baseColumns: ProColumns<WorkoutItem>[] = useMemo(
    () => [
      { title: "Exercise", dataIndex: "name", width: 200, formItemProps: { rules: [{ required: true }] } },
      { title: "Sets", dataIndex: "sets", valueType: "digit", width: 90 },
      { title: "Reps", dataIndex: "reps", valueType: "digit", width: 90 },
      { title: "Weight", dataIndex: "weight", valueType: "digit", width: 110 },
      { title: "Note", dataIndex: "note", ellipsis: true },
    ],
    []
  );

  if (!plan) return <Card size="small">Loading...</Card>;

  return (
    <Card size="small" title="Week Plan">
      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        {plan.days.map((day) => {
          const columns: ProColumns<WorkoutItem>[] = [
            ...baseColumns,
            {
              title: "Progress %",
              dataIndex: "progress",
              valueType: "digit",
              width: 140,
              render: (_, r) => (
                <InputNumber
                  min={0}
                  max={100}
                  value={r.progress}
                  onChange={(v) => setItemProgress(uid, day.dateISO, r.id, Number(v ?? 0))}
                />
              ),
            },
          ];

          return (
            <div key={day.dateISO}>
              <Space style={{ justifyContent: "space-between", width: "100%" }}>
                <Space direction="vertical" size={0}>
                  <Typography.Text strong>
                    {weekdayLabel(day.weekday)} — {day.dateISO}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Add exercises and update progress 0~100.
                  </Typography.Text>
                </Space>

                <Button onClick={() => addItem(uid, day.dateISO)}>+ Add</Button>
              </Space>

              <div style={{ marginTop: 8 }}>
                <EditableProTable<WorkoutItem>
                  rowKey="id"
                  value={day.items}
                  columns={columns}
                  recordCreatorProps={false}
                  editable={{
                    type: "multiple",
                    onSave: async (_key, row) => {
                      await updateItem(uid, day.dateISO, row);
                    },
                    onDelete: async (_key, row) => {
                      await deleteItem(uid, day.dateISO, row.id);
                    },
                  }}
                />
              </div>

              <Divider style={{ margin: "14px 0" }} />
            </div>
          );
        })}
      </Space>
    </Card>
  );
}
