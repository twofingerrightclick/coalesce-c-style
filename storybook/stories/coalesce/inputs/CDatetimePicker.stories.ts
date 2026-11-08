import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";
import { find, person, user } from "../_support";

export default { title: "Coalesce/Inputs/c-datetime-picker", tags: ["coalesce:CDatetimePicker", "coalesce:CTimePicker"] } satisfies Meta;

const box = "max-width: 320px";

export const Kinds = tpl(
  `<sb-row label="DateTimeOffset" stack><c-datetime-picker :model="p" for="lastLogin" style="${box}" /></sb-row>
  <sb-row label="DateTime" stack><c-datetime-picker :model="p" for="createdAt" style="${box}" /></sb-row>
  <sb-row label="DateOnly" stack><c-datetime-picker :model="p" for="birthDate" style="${box}" /></sb-row>
  <sb-row label="TimeOnly" stack><c-datetime-picker :model="p" for="startTime" style="${box}" /></sb-row>
  <sb-row label="v-model, date-kind" stack><c-datetime-picker v-model="d" date-kind="datetime" label="Due" style="${box}" /><c-datetime-picker v-model="d" date-kind="date" date-format="MMM d, yyyy" label="Custom format" style="${box}" /></sb-row>`,
  () => ({ p: person(1), d: ref(new Date(2026, 10, 5, 9, 30)) }),
);

export const NativeAndStates = tpl(
  `<sb-row label="native" stack><c-datetime-picker :model="p" for="lastLogin" native style="${box}" /><c-datetime-picker :model="p" for="birthDate" native style="${box}" /><c-datetime-picker :model="p" for="startTime" native style="${box}" /></sb-row>
  <sb-row label="min/max + today" stack><c-datetime-picker v-model="d" date-kind="date" :min="min" :max="max" show-today-button label="Nov 3 – 20" style="${box}" /></sb-row>
  <sb-row label="readonly / disabled" stack><c-datetime-picker :model="p" for="lastLogin" readonly style="${box}" /><c-datetime-picker :model="p" for="lastLogin" disabled style="${box}" /></sb-row>
  <sb-row label="error" stack><c-datetime-picker v-model="d" date-kind="datetime" label="Due" :error-messages="['Must be in the future.']" style="${box}" /></sb-row>`,
  () => ({ p: person(1), d: ref(new Date(2026, 10, 5)), min: new Date(2026, 10, 3), max: new Date(2026, 10, 20) }),
);

async function openPicker({ canvasElement }: { canvasElement: HTMLElement }) {
  await user.click(canvasElement.querySelector<HTMLElement>(".c-datetime-picker .v-field__append-inner .v-icon")!);
  await find(".c-datetime-picker__menu");
}

export const OpenDateTime = tpl(`<div style="${box}; height: 560px"><c-datetime-picker :model="p" for="lastLogin" /></div>`, () => ({ p: person(1) }), {
  play: openPicker,
});
export const OpenDate = tpl(`<div style="${box}; height: 520px"><c-datetime-picker :model="p" for="birthDate" show-today-button /></div>`, () => ({ p: person(1) }), {
  play: openPicker,
});
export const OpenTime = tpl(`<div style="${box}; height: 460px"><c-datetime-picker :model="p" for="startTime" /></div>`, () => ({ p: person(1) }), {
  play: openPicker,
});
export const NarrowViewport = tpl(`<div style="height: 620px"><c-datetime-picker :model="p" for="lastLogin" /></div>`, () => ({ p: person(1) }), {
  play: openPicker,
  globals: { viewport: { value: "mobile1" } },
  parameters: { canonComparison: false },
});

export const NarrowDate = tpl(`<div style="height: 520px"><c-datetime-picker :model="p" for="birthDate" show-today-button /></div>`, () => ({ p: person(1) }), {
  play: openPicker,
  globals: { viewport: { value: "mobile1" } },
  parameters: { canonComparison: false },
});
