// Throwaway harness for the R4 label-above spike: plain Vuetify fields with c-style.
import { execSync } from "node:child_process";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { cStyle } from "c-style/vite";

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: import.meta.dirname + "/.vite",
  plugins: [vue(), cStyle()],
  server: {
    port: 23001,
    strictPort: true,
    fs: { allow: [import.meta.dirname, execSync("pnpm store path", { encoding: "utf8" }).trim()] },
  },
});
