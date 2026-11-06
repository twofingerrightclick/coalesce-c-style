import type { Meta } from "@storybook/vue3-vite";
import { fieldStories, people, tpl } from "../../_helpers";

export default { title: "Vuetify/Text entry/VAutocomplete", tags: ["vuetify:VAutocomplete"] } satisfies Meta;

const stories = fieldStories("v-autocomplete", { items: people, multiple: true, chips: true, closableChips: true }, [1, 3]);

export const Variants = stories.Variants;
export const States = stories.States;
export const Sizes = stories.Sizes;

export const Open = tpl(
  `<div style="height: 360px; max-width: 320px"><v-autocomplete :items="items" label="Person" menu auto-select-first /></div>`,
  () => ({ items: people }),
);
