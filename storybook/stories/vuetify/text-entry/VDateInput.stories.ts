import type { Meta } from "@storybook/vue3-vite";
import { fieldStories } from "../../_helpers";

export default { title: "Vuetify/Text entry/VDateInput", tags: ["vuetify:VDateInput"] } satisfies Meta;

const stories = fieldStories("v-date-input", {}, new Date(2026, 10, 5));

export const Variants = stories.Variants;
export const States = stories.States;
export const Sizes = stories.Sizes;
