import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import OptionTiles, { type OptionTileItem } from "@demo/components/OptionTiles.vue";

// The demo app's OptionTiles.vue: an app component styled with the public
// API only (`@use 'c-style/tokens'` and `--cs-*`). It lives in the demo so
// that its `<style lang="scss">` compiles through an app's Vite, as an app
// author's would; the stories prove the same file compiles here.

export default {
  title: "c-style/Option tiles (app example)",
  tags: ["c-style:tokens"],
} satisfies Meta;

const plans: OptionTileItem[] = [
  { value: "starter", title: "Starter", amount: "$0", description: "Up to 3 seats." },
  { value: "team", title: "Team", amount: "$12", description: "Per seat, monthly." },
  { value: "business", title: "Business", amount: "$29", description: "SSO and audit log." },
  { value: "enterprise", title: "Enterprise", description: "Contact sales.", disabled: true },
];

const regions: OptionTileItem[] = [
  { value: "us", title: "United States" },
  { value: "eu", title: "Europe" },
  { value: "ap", title: "Asia Pacific" },
];

function story(template: string, setup: () => Record<string, unknown> = () => ({})): StoryObj {
  return { render: () => ({ components: { OptionTiles }, template, setup }) };
}

const width = 'style="max-width: 720px"';

export const Basics = story(
  `<sb-row label="selectable" stack>
    <option-tiles v-model="plan" label="Plan" hint="Hover, press, select, Tab for the focus ring." :items="plans" ${width} />
    <code>{{ plan ?? "null" }}</code>
  </sb-row>`,
  () => ({ plan: ref("team"), plans }),
);

export const Intents = story(
  `<sb-row v-for="intent in intents" :key="intent" :label="intent" stack>
    <option-tiles v-model="values[intent]" :label="intent" :intent="intent" :items="regions" ${width} />
  </sb-row>`,
  () => ({
    intents: ["primary", "neutral", "success", "warning", "error", "info"],
    values: ref({ primary: "eu", neutral: "eu", success: "eu", warning: "eu", error: "eu", info: "eu" }),
    regions,
  }),
);

export const States = story(
  `<sb-row label="nothing selected" stack><option-tiles v-model="none" label="Region" :items="regions" ${width} /></sb-row>
  <sb-row label="group disabled" stack><option-tiles model-value="eu" label="Region" :items="regions" disabled ${width} /></sb-row>`,
  () => ({ none: ref(null), regions }),
);
