import type { Meta } from "@storybook/vue3-vite";
import { fieldStories, tpl } from "../../_helpers";

export default { title: "Vuetify/Text entry/VTextField", tags: ["vuetify:VTextField"] } satisfies Meta;

const stories = fieldStories("v-text-field", {}, "Ada Lovelace");

export const Variants = stories.Variants;
export const States = stories.States;
export const Sizes = stories.Sizes;

export const Adornments = tpl(
  `<sb-row label="prefix/suffix" stack><v-text-field label="Price" prefix="$" suffix="USD" model-value="120" /><v-text-field label="Domain" suffix=".example.com" model-value="ada" /></sb-row>
  <sb-row label="icons" stack><v-text-field label="Search" prepend-inner-icon="$search" clearable model-value="query" /><v-text-field label="Email" prepend-icon="$info" append-icon="$complete" /></sb-row>
  <sb-row label="password" stack><v-text-field label="Password" type="password" model-value="hunter2" append-inner-icon="fa fa-eye" /></sb-row>
  <sb-row label="counter" stack><v-text-field label="Code" counter="10" model-value="ABC123" /></sb-row>
  <sb-row label="single-line" stack><v-text-field single-line label="Single line" /></sb-row>
  <sb-row label="types" stack><v-text-field v-for="t in ['email','tel','url','number','color','date','time']" :key="t" :type="t" :label="t" /></sb-row>`,
);
