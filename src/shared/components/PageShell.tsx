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
        <Typography.Title level={4} style={{ margin: 0, color: "#fff" }}>
          {title}
        </Typography.Title>

        <Space>
          <Typography.Text style={{ color: "#fff" }}>
            {user?.displayName ?? "Unknown"}
          </Typography.Text>
          <Button onClick={logout}>Logout</Button>
        </Space>
      </Header>

      <Content style={{ padding: 16 }}>{children}</Content>
    </Layout>
  );
}
