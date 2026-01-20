import { Button, Card, Typography } from "antd";
import { useAuth } from "../../features/auth/useAuth";

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div style={{ height: "100%", display: "grid", placeItems: "center", padding: 16 }}>
      <Card style={{ width: 420, maxWidth: "100%" }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          健身計畫週表
        </Typography.Title>
        <Typography.Paragraph style={{ marginBottom: 24 }}>
          請使用 Google 登入後開始安排每週健身計畫（資料會保存在你的裝置上）。
        </Typography.Paragraph>
        <Button type="primary" block onClick={login}>
          Continue with Google
        </Button>
      </Card>
    </div>
  );
}
