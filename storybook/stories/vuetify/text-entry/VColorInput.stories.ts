import type { Meta } from "@storybook/vue3-vite";
import { fieldStories } from "../../_helpers";

export default { title: "Vuetify/Text entry/VColorInput", tags: ["vuetify:VColorInput"] } satisfies Meta;

const stories = fieldStories("v-color-input", {}, "#2563eb");

export const Variants = stories.Variants;
export const States = stories.States;
export const Sizes = stories.Sizes;
