import { cp } from "node:fs/promises";

// Files the published exports point at as they are in src/. The Vite plugin
// resolves styles/settings.scss relative to itself, so the layout stays the same.
for (const path of ["styles", "fonts", "tokens.scss", "vite.mjs", "vite.d.mts", "layer-order.mjs", "layer-order.d.mts"]) {
  await cp(`src/${path}`, `dist/${path}`, { recursive: true });
}
