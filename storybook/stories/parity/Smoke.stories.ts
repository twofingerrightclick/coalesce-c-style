import type { Meta } from "@storybook/vue3-vite";
import { parity } from "./_parity";

export default { title: "Parity/Smoke" } satisfies Meta;

/** Harness check: one plain Vuetify button beside one Canon button. */
export const Smoke = parity(
  "Button, default props",
  `<v-btn data-parity="btn">Save</v-btn>`,
  `<button type="button" class="canon-button" data-parity="btn"><span class="canon-button-label">Save</span></button>`,
);
