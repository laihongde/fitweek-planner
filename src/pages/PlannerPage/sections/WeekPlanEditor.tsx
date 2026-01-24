import { useMemo, useState } from "react";
import {
  AutoComplete,
  Button,
  Card,
  Checkbox,
  Divider,
  Drawer,
  Form,
  Grid,
  Input,
  InputNumber,
  Popconfirm,
  Progress,
  Space,
  Typography,
  message,
} from "antd";
import type { ProColumns } from "@ant-design/pro-components";
import {
  EditableProTable,
  ProForm,
  ProFormCheckbox,
  ProFormDigit,
  ProFormSlider,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";

import type { WeekPlan, WorkoutItem } from "../../../features/planner/types";
import { weekdayLabel } from "../../../features/planner/date";
import { usePlannerStore } from "../../../features/planner/store";
import { searchExerciseNames } from "../../../features/planner/exercises";

type NewExercisePayload = {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  note?: string;
};

function emptyDraft(): NewExercisePayload {
  return { name: "", sets: 3, reps: 10, weight: 0, note: "" };
}

type DrawerState = { open: false } | { open: true; dayISO: string; item: WorkoutItem };

export default function WeekPlanEditor({
  uid,
  plan,
}: {
  uid: string;
  plan: WeekPlan | null;
}) {
  const { addItem, updateItem, deleteItem, setItemProgress, setDayItemsProgress } = usePlannerStore();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // 每天一份新增草稿
  const [draftByDay, setDraftByDay] = useState<Record<string, NewExercisePayload>>({});
  // 手機：Drawer 編輯狀態
  const [drawer, setDrawer] = useState<DrawerState>({ open: false });
  const [drawerForm] = Form.useForm<WorkoutItem>();


  const baseColumnsDesktop: ProColumns<WorkoutItem>[] = useMemo(
    () => [
      {
        title: "動作",
        dataIndex: "name",
        width: 150,
        formItemProps: { rules: [{ required: true, message: "請輸入鍛鍊動作" }] },
      },
      { title: "組數", dataIndex: "sets", valueType: "digit", width: 80 },
      { title: "次數", dataIndex: "reps", valueType: "digit", width: 80 },
      { title: "重量", dataIndex: "weight", valueType: "digit", width: 90 },
      { title: "備註", dataIndex: "note", width: 150},
    ],
    []
  );

  if (!plan) return <Card size="small">載入中...</Card>;

  const ensureDraft = (dayISO: string) => draftByDay[dayISO] ?? emptyDraft();

  const setDraft = (dayISO: string, patch: Partial<NewExercisePayload>) => {
    setDraftByDay((prev) => ({
      ...prev,
      [dayISO]: { ...ensureDraft(dayISO), ...patch },
    }));
  };

  const doAdd = async (dayISO: string) => {
    const payload = ensureDraft(dayISO);
    const name = payload.name.trim();

    if (!name) {
      message.warning("請輸入鍛鍊動作名稱");
      return;
    }
    if (payload.sets <= 0 || payload.reps <= 0) {
      message.warning("組數／次數 必須至少為 1");
      return;
    }
    if (payload.weight < 0) {
      message.warning("重量不能小於 0");
      return;
    }

    await addItem(uid, dayISO, {
      name,
      sets: payload.sets,
      reps: payload.reps,
      weight: payload.weight,
      note: payload.note ?? "",
    });

    setDraftByDay((prev) => ({ ...prev, [dayISO]: emptyDraft() }));
  };

  const openDrawer = (dayISO: string, item: WorkoutItem) => {
    setDrawer({ open: true, dayISO, item });

    drawerForm.setFieldsValue({
      ...item,
      progress: item.progress ?? 0,
    });
  };

  const closeDrawer = () => setDrawer({ open: false });

  const renderMobileCards = (dayISO: string, items: WorkoutItem[]) => {
    if (!items.length) {
      return (
        <div style={{ padding: "10px 0" }}>
          <Typography.Text type="secondary">目前還沒有加入任何動作。</Typography.Text>
        </div>
      );
    }

    return (
      <Space direction="vertical" style={{ width: "100%" }} size={10}>
        {items.map((it) => {
          const sets = it.sets ?? 0;
          const reps = it.reps ?? 0;
          const weight = it.weight ?? 0;

          return (
            <div
              key={it.id}
              onClick={() => openDrawer(dayISO, it)}
              style={{
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 12,
                padding: 12,
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }} size={6}>
                <Space style={{ width: "100%", justifyContent: "space-between" }} align="start">
                  <Typography.Text strong style={{ fontSize: 14 }}>
                    {it.name}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {it.progress ?? 0}%
                  </Typography.Text>
                </Space>

                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {sets} 組 × {reps} 次 @ {weight} kg
                </Typography.Text>

                <Progress percent={it.progress ?? 0} size="small" />
              </Space>
            </div>
          );
        })}
      </Space>
    );
  };

  return (
    <Card size="small" title="每週訓練計畫">
      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        {plan.days.map((day) => {
          // 桌機 columns（完整）
          const columnsDesktop: ProColumns<WorkoutItem>[] = [
            ...baseColumnsDesktop,
            {
              title: "完成",
              dataIndex: "progress",
              width: 200,
              render: (_, r) => {
                const done = r.progress === 100;

                return (
                  <Space>
                    <Checkbox
                      checked={done}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setItemProgress(uid, day.dateISO, r.id, checked ? 100 : 0);
                      }}
                    />
                    <InputNumber
                      min={0}
                      max={100}
                      value={r.progress}
                      disabled={done}
                      onChange={(v) =>
                        setItemProgress(uid, day.dateISO, r.id, Number(v ?? 0))
                      }
                    />
                    <span>%</span>
                  </Space>
                );
              },
            },
            {
              title: "操作",
              valueType: "option",
              width: 120,
              render: (_text, record, _index, action) => [
                <a key="edit" onClick={() => action?.startEditable?.(record.id)}>
                  編輯
                </a>,
                <a key="delete" onClick={() => deleteItem(uid, day.dateISO, record.id)}>
                  刪除
                </a>,
              ],
            },
          ];

          const draft = ensureDraft(day.dateISO);
          const dayHasItems = day.items.length > 0;
          const dayDone = dayHasItems && day.items.every((it) => (it.progress ?? 0) === 100);

          return (
            <div key={day.dateISO}>
              <Space direction="vertical" style={{ width: "100%" }} size={0}>
                  <Space align="center" wrap size={"large"}>
                    <Typography.Text strong>
                      {weekdayLabel(day.weekday)} — {day.dateISO}
                    </Typography.Text>
                    <Checkbox
                      checked={dayDone}
                      disabled={!dayHasItems}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setDayItemsProgress(uid, day.dateISO, checked ? 100 : 0);
                      }}
                    >
                      全部完成
                    </Checkbox>
                  </Space>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {isMobile ? "點選卡片可在下方抽屜中編輯。" : "可直接編輯表格中的任一列。"}
                </Typography.Text>
              </Space>

              {/* 新增表單：手機自動換行 */}
              <div style={{ marginTop: 12 }}>
                <Space wrap style={{ width: "100%" }} align="start">
                  <AutoComplete
                    style={{ width: 260, maxWidth: "100%" }}
                    value={draft.name}
                    options={searchExerciseNames(draft.name).map((name) => ({
                      value: name,
                      label: name,
                    }))}
                    onChange={(v) => setDraft(day.dateISO, { name: v })}
                    onSelect={(v) => setDraft(day.dateISO, { name: v })}
                  >
                    <Input
                      placeholder="輸入或搜尋鍛鍊動作"
                      onPressEnter={() => doAdd(day.dateISO)}
                      allowClear
                    />
                  </AutoComplete>

                  <InputNumber
                    className="mobile-full"
                    min={1}
                    style={{ width: 120 }}
                    value={draft.sets}
                    onChange={(v) => setDraft(day.dateISO, { sets: Number(v ?? 1) })}
                    addonBefore="組數"
                  />

                  <InputNumber
                    className="mobile-full"
                    min={1}
                    style={{ width: 120 }}
                    value={draft.reps}
                    onChange={(v) => setDraft(day.dateISO, { reps: Number(v ?? 1) })}
                    addonBefore="次數"
                  />

                  <InputNumber
                    className="mobile-full"
                    min={0}
                    style={{ width: 140 }}
                    value={draft.weight}
                    onChange={(v) => setDraft(day.dateISO, { weight: Number(v ?? 0) })}
                    addonBefore="公斤"
                  />

                  <Input
                    className="mobile-full"
                    style={{ width: 260, maxWidth: "100%" }}
                    placeholder="備註（選填）"
                    value={draft.note}
                    onChange={(e) => setDraft(day.dateISO, { note: e.target.value })}
                  />

                  <Button type="primary" className="mobile-full" onClick={() => doAdd(day.dateISO)}>
                    新增
                  </Button>
                </Space>
              </div>

              {/* 手機：卡片；桌機：表格 */}
              <div style={{ marginTop: 12 }}>
                {isMobile ? (
                  renderMobileCards(day.dateISO, day.items)
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <EditableProTable<WorkoutItem>
                      rowKey="id"
                      value={day.items}
                      columns={columnsDesktop}
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
                )}
              </div>

              <Divider style={{ margin: "14px 0" }} />
            </div>
          );
        })}
      </Space>

      {/* 手機 Drawer：點卡片進來編輯 */}
      <Drawer
        title="編輯鍛鍊動作"
        open={drawer.open}
        onClose={closeDrawer}
        placement="bottom"
        height="78vh"
        bodyStyle={{ padding: 16 }}
        destroyOnClose
        extra={
          drawer.open ? (
            <Popconfirm
              title="確定要刪除這個動作嗎？"
              okText="刪除"
              cancelText="取消"
              onConfirm={async () => {
                await deleteItem(uid, drawer.dayISO, drawer.item.id);
                closeDrawer();
              }}
            >
              <Button danger>刪除</Button>
            </Popconfirm>
          ) : null
        }
      >
        {drawer.open && (
          <ProForm<WorkoutItem>
            form={drawerForm}
            layout="vertical"
            initialValues={drawer.item}
            submitter={{
              searchConfig: { submitText: "儲存" },
              resetButtonProps: false,
            }}
            onFinish={async (values) => {
              // 保留 id、把表單值 merge 回 item
              const next: WorkoutItem = {
                ...drawer.item,
                ...values,
                name: (values.name ?? "").trim(),
                sets: Number(values.sets ?? 0),
                reps: Number(values.reps ?? 0),
                weight: Number(values.weight ?? 0),
                progress: Number(values.progress ?? 0),
                note: values.note ?? "",
              };

              if (!next.name) {
                message.warning("請輸入鍛鍊動作名稱");
                return false;
              }

              await updateItem(uid, drawer.dayISO, next);
              closeDrawer();
              message.success("已儲存");
              return true;
            }}
          >
            <ProFormText
              name="name"
              label="鍛鍊動作名稱"
              rules={[{ required: true, message: "必填" }]}
              placeholder="例如：臥推"
            />

            <Space style={{ width: "100%" }} wrap>
              <ProFormDigit name="sets" label="組數" min={1} fieldProps={{ style: { width: 140 } }} />
              <ProFormDigit name="reps" label="次數" min={1} fieldProps={{ style: { width: 140 } }} />
              <ProFormDigit
                name="weight"
                label="重量（kg）"
                min={0}
                fieldProps={{ style: { width: 180 } }}
              />
            </Space>

            <ProFormTextArea name="note" label="備註" placeholder="選填" />

            <ProFormCheckbox
              name="__done"
              label=""
              fieldProps={{
                checked: drawer.item.progress === 100,
                onChange: (e) => {
                  const checked = e.target.checked;
                  const next = checked ? 100 : 0;

                  drawerForm.setFieldsValue({ progress: next });

                  setDrawer((d) =>
                    d.open
                      ? {
                          ...d,
                          item: { ...d.item, progress: next },
                        }
                      : d
                  );
                },
              }}
            >
              完成
            </ProFormCheckbox>
            <Form.Item shouldUpdate noStyle>
              {() => {
                const progress = Number(drawerForm.getFieldValue("progress") ?? 0);
                const done = progress === 100;

                return (
                  <ProFormSlider
                    name="progress"
                    label="完成進度 (%)"
                    min={0}
                    max={100}
                    disabled={done}
                  />
                );
              }}
            </Form.Item>
          </ProForm>
        )}
      </Drawer>
    </Card>
  );
}
