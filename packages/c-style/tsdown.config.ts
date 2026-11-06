import { defineConfig } from "tsdown";

// Bundles the TypeScript entries. Sass, CSS and the Vite plugin are copied as
// they are by scripts/copy-assets.mjs.
export default defineConfig({
  entry: { index: "src/index.ts", icons: "src/icons/lucide.ts" },
  format: "esm",
  platform: "browser",
  dts: true,
  clean: true,
});
