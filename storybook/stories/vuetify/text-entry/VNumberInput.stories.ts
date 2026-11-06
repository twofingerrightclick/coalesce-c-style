import type { Meta } from "@storybook/vue3-vite";
import { fieldStories } from "../../_helpers";

export default { title: "Vuetify/Text entry/VNumberInput", tags: ["vuetify:VNumberInput"] } satisfies Meta;

const stories = fieldStories("v-number-input", { min: 0, max: 100 }, 42);

export const Variants = stories.Variants;
export const States = stories.States;
export const Sizes = stories.Sizes;
