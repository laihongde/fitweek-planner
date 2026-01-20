import { useState } from "react";
import { Button, Card, Divider, Space, Typography } from "antd";
import { GoogleOutlined, ThunderboltOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../../features/auth/useAuth";
import AnimatedGrid from "../../shared/components/AnimatedGrid";

import "./LoginPage.css";

export default function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      await login();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginRoot">
      <Card bordered={false} className="loginCard" bodyStyle={{ padding: 22 }}>
        <Space direction="vertical" size={14} style={{ width: "100%" }}>
          <div className="logoBadge">
            <ThunderboltOutlined className="logoIcon" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <AnimatedGrid />
          </div>

          {/* ===== Title Area ===== */}
          <div className="titleRow">
            <span className="swordDivider" aria-hidden />
            <span className="brandMark" title="劃山論健">
              畫山論健
            </span>
            <Typography.Title level={5} className="titleMain">
              健身計畫週表
            </Typography.Title>
          </div>

          <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
            快速建立每週訓練安排，追蹤完成度，讓訓練更有節奏。
          </Typography.Paragraph>

          <Divider style={{ margin: "6px 0" }} />

          <Button
            type="primary"
            size="large"
            block
            icon={<GoogleOutlined />}
            loading={loading}
            onClick={onLogin}
            style={{ borderRadius: 12 }}
          >
            使用 Google 登入
          </Button>

          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            <LockOutlined /> 資料僅保存在本機，不會上傳到雲端。
          </Typography.Text>
        </Space>
      </Card>
    </div>
  );
}
