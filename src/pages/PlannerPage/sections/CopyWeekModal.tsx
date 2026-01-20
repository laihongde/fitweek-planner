import { useMemo, useState } from "react";
import { Modal, Checkbox, Radio, Space, Switch, Typography } from "antd";
import type { CopyMode } from "../../../features/planner/utils/copy";

type WeekOption = {
  weekKey: string;
  weekNumber: number;
  startISO: string;
  endISO: string;
};

export default function CopyWeekModal({
  open,
  onClose,
  sourceWeekKey,
  weekOptions,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  sourceWeekKey: string;
  weekOptions: WeekOption[];
  onConfirm: (targetWeekKeys: string[], mode: CopyMode, resetProgress: boolean) => void;
}) {
  const [targets, setTargets] = useState<string[]>([]);
  const [mode, setMode] = useState<CopyMode>("overwrite");
  const [resetProgress, setResetProgress] = useState(true);

  const checkboxOptions = useMemo(
    () =>
      weekOptions.map((w) => ({
        label: `第 ${String(w.weekNumber).padStart(2, "0")} 週 (${w.startISO}~${w.endISO})`,
        value: w.weekKey,
        disabled: w.weekKey === sourceWeekKey,
      })),
    [weekOptions, sourceWeekKey]
  );

  return (
    <Modal
      title="複製週計畫"
      open={open}
      onCancel={onClose}
      onOk={() => onConfirm(targets, mode, resetProgress)}
      okText="複製"
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Typography.Text>
          Source: <strong>{sourceWeekKey}</strong>
        </Typography.Text>

        <Typography.Text strong>Target weeks</Typography.Text>
        <Checkbox.Group
          style={{ display: "flex", flexDirection: "column", gap: 6 }}
          options={checkboxOptions}
          value={targets}
          onChange={(v) => setTargets(v as string[])}
        />

        <Typography.Text strong style={{ marginTop: 12 }}>
          Copy mode
        </Typography.Text>
        <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
          <Radio value="overwrite">Overwrite (replace target)</Radio>
          <Radio value="merge">Merge (keep existing, add missing)</Radio>
        </Radio.Group>

        <Space style={{ marginTop: 12 }}>
          <Switch checked={resetProgress} onChange={setResetProgress} />
          <Typography.Text>Reset progress to 0%</Typography.Text>
        </Space>
      </Space>
    </Modal>
  );
}
