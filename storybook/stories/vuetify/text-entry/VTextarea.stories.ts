import type { Meta } from "@storybook/vue3-vite";
import { fieldStories } from "../../_helpers";

export default { title: "Vuetify/Text entry/VTextarea", tags: ["vuetify:VTextarea"] } satisfies Meta;

const stories = fieldStories("v-textarea", { rows: 2, autoGrow: true }, "Wrote the first published algorithm.");

export const Variants = stories.Variants;
export const States = stories.States;
export const Sizes = stories.Sizes;
