import type { Meta } from "@storybook/vue3-vite";
import { fieldStories } from "../../_helpers";

export default { title: "Vuetify/Text entry/VFileInput", tags: ["vuetify:VFileInput"] } satisfies Meta;

const stories = fieldStories("v-file-input", { multiple: true, chips: true }, undefined);

export const Variants = stories.Variants;
export const States = stories.States;
export const Sizes = stories.Sizes;
