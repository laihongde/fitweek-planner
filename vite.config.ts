import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/fitweek-planner/", // ✅ 這裡改成你的 repo 名
  plugins: [react()],
});
