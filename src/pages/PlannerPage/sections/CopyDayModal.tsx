import { useMemo, useState } from "react";
import { Modal, Radio, Select, Space, Switch, Typography } from "antd";

type WeekOption = {
  weekKey: string;
  weekNumber: number;
  startISO: string;
  endISO: string;
};

export default function CopyDayModal({
  open,
  onClose,
  sourceDayISO,
  defaultTargetWeekKey,
  weekOptions,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  sourceDayISO: string | null;
  defaultTargetWeekKey: string;
  weekOptions: WeekOption[];
  onConfirm: (args: {
    targetWeekKey: string;
    targetWeekday: number;
    mode: "overwrite" | "merge";
    resetProgress: boolean;
  }) => void;
}) {
  const [targetWeekKey, setTargetWeekKey] = useState(defaultTargetWeekKey);
  const [targetWeekday, setTargetWeekday] = useState<number>(1);
  const [mode, setMode] = useState<"overwrite" | "merge">("overwrite");
  const [resetProgress, setResetProgress] = useState(true);

  const weekdayOptions = useMemo(
    () => [
      { value: 1, label: "星期一" },
      { value: 2, label: "星期二" },
      { value: 3, label: "星期三" },
      { value: 4, label: "星期四" },
      { value: 5, label: "星期五" },
      { value: 6, label: "星期六" },
      { value: 7, label: "星期日" },
    ],
    []
  );

  return (
    <Modal
      title="複製本日至指定日期"
      open={open}
      onCancel={onClose}
      okText="複製"
      onOk={() =>
        onConfirm({
          targetWeekKey,
          targetWeekday,
          mode,
          resetProgress,
        })
      }
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Typography.Text>
          複製模板: <strong>{sourceDayISO ?? "-"}</strong>
        </Typography.Text>

        <Typography.Text strong>目標週</Typography.Text>
        <Select
          style={{ width: "100%" }}
          value={targetWeekKey}
          onChange={setTargetWeekKey}
          options={weekOptions.map((w) => ({
            value: w.weekKey,
            label: `${w.weekKey} (Week ${String(w.weekNumber).padStart(2, "0")}) ${w.startISO}~${w.endISO}`,
          }))}
        />

        <Typography.Text strong>目標星期</Typography.Text>
        <Select style={{ width: 160 }} value={targetWeekday} onChange={setTargetWeekday} options={weekdayOptions} />

        <Typography.Text strong style={{ marginTop: 8 }}>
          複製模式
        </Typography.Text>
        <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
          <Radio value="overwrite">覆蓋</Radio>
          <Radio value="merge">合併 (追加)</Radio>
        </Radio.Group>

        <Space style={{ marginTop: 8 }}>
          <Switch checked={resetProgress} onChange={setResetProgress} />
          <Typography.Text>重置進度為 0%</Typography.Text>
        </Space>
      </Space>
    </Modal>
  );
}
