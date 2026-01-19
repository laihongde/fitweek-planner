import { useMemo } from "react";
import { Card, Select, List, Typography, Space, Tag } from "antd";

type WeekOption = {
  weekKey: string;
  weekNumber: number;
  startISO: string;
  endISO: string;
};

export default function WeekSelector({
  year,
  month,
  weekOptions,
  selectedWeekKey,
  onYearMonthChange,
  onSelectWeek,
}: {
  year: number;
  month: number;
  weekOptions: WeekOption[];
  selectedWeekKey: string;
  onYearMonthChange: (year: number, month: number) => void;
  onSelectWeek: (wk: string) => void;
}) {
  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 8 }).map((_, i) => now - 2 + i);
  }, []);

  const months = useMemo(() => Array.from({ length: 12 }).map((_, i) => i + 1), []);

  return (
    <Card title="Pick a week" size="small">
      <Space style={{ width: "100%" }} direction="vertical">
        <Space style={{ width: "100%" }}>
          <Select
            style={{ width: 140 }}
            value={year}
            options={years.map((y) => ({ value: y, label: y }))}
            onChange={(y) => onYearMonthChange(y, month)}
          />
          <Select
            style={{ width: 140 }}
            value={month}
            options={months.map((m) => ({ value: m, label: `Month ${m}` }))}
            onChange={(m) => onYearMonthChange(year, m)}
          />
        </Space>

        <List
          size="small"
          dataSource={weekOptions}
          renderItem={(w) => {
            const active = w.weekKey === selectedWeekKey;
            return (
              <List.Item
                onClick={() => onSelectWeek(w.weekKey)}
                style={{
                  cursor: "pointer",
                  borderRadius: 8,
                  padding: "8px 10px",
                  background: active ? "rgba(22, 119, 255, 0.10)" : undefined,
                }}
              >
                <Space direction="vertical" style={{ width: "100%" }} size={2}>
                  <Space style={{ justifyContent: "space-between", width: "100%" }}>
                    <Typography.Text strong>{`Week ${String(w.weekNumber).padStart(2, "0")}`}</Typography.Text>
                    <Tag color={active ? "blue" : "default"}>{w.weekKey}</Tag>
                  </Space>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {w.startISO} ~ {w.endISO}
                  </Typography.Text>
                </Space>
              </List.Item>
            );
          }}
        />
      </Space>
    </Card>
  );
}
