import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/fitweek-planner/",
  plugins: [react()],
});
