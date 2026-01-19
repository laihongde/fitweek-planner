import React from "react";
import { Spin } from "antd";
import { useAuth } from "./useAuth";
import LoginPage from "../../pages/LoginPage";

export default function Guard({ children }: { children: React.ReactNode }) {
  const { ready, user } = useAuth();

  if (!ready) {
    return (
      <div style={{ height: "100%", display: "grid", placeItems: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return <>{children}</>;
}
