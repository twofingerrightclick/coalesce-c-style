import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.spec.ts"],
    // The `c-style` entry exports components built on Vuetify's, whose
    // modules import their CSS; Node can't load that unless Vite does.
    server: { deps: { inline: ["vuetify"] } },
  },
});
