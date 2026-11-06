import type { Meta } from "@storybook/vue3-vite";
import { fieldStories, fruits, people, tpl } from "../../_helpers";

export default { title: "Vuetify/Text entry/VSelect", tags: ["vuetify:VSelect"] } satisfies Meta;

const stories = fieldStories("v-select", { items: fruits }, "Banana");

export const Variants = stories.Variants;
export const States = stories.States;
export const Sizes = stories.Sizes;

export const Open = tpl(
  `<div style="height: 360px; max-width: 320px"><v-select :items="items" label="Fruit" model-value="Banana" menu /></div>`,
  () => ({ items: fruits }),
);

export const Multiple = tpl(
  `<sb-row label="chips" stack><v-select :items="items" label="Fruits" multiple chips :model-value="['Apple','Fig']" /><v-select :items="items" label="Fruits" multiple :model-value="['Apple','Fig']" /></sb-row>
  <sb-row label="item subtitles" stack><v-select :items="people" label="Person" :item-props="true" :model-value="2" /></sb-row>`,
  () => ({ items: fruits, people }),
);
