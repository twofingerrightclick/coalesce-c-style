import type { Meta } from "@storybook/vue3-vite";
import { fieldStories, fruits } from "../../_helpers";

export default { title: "Vuetify/Text entry/VCombobox", tags: ["vuetify:VCombobox"] } satisfies Meta;

const stories = fieldStories("v-combobox", { items: fruits }, "Cherry");

export const Variants = stories.Variants;
export const States = stories.States;
export const Sizes = stories.Sizes;
