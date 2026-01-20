import React from "react";
import { Layout, Typography, Space, Button } from "antd";
import { useAuth } from "../../features/auth/useAuth";

const { Header, Content } = Layout;

export default function PageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  return (
    <Layout style={{ height: "100%" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography.Title level={4} style={{ margin: 0, color: "#fff", fontSize: "clamp(15px, 4.2vw, 20px)" }}>
          {title}
        </Typography.Title>

        <Space>
          <Typography.Text
            ellipsis={{ tooltip: false }}
            style={{
              color: "#fff",
              maxWidth: "20vw",      // 你想讓它最多佔多少就調這個
              minWidth: 0,           // ✅ 關鍵：允許在 flex 裡縮
              display: "block",      // ✅ 讓寬度約束生效（比 inline 好）
              direction: "ltr",      // ✅ 保證從左到右
              textAlign: "left",     // ✅ 保證顯示開頭
            }}
          >
            {user?.displayName ?? "Unknown"}
          </Typography.Text>
          <Button onClick={logout}>Logout</Button>
        </Space>
      </Header>

      <Content style={{ padding: 16 }}>{children}</Content>
    </Layout>
  );
}
