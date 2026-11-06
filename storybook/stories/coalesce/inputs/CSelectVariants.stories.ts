import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";
import { find, person, user } from "../_support";

export default {
  title: "Coalesce/Inputs/c-select-many-to-many, values, string-value",
  tags: ["coalesce:CSelectManyToMany", "coalesce:CSelectValues", "coalesce:CSelectStringValue"],
} satisfies Meta;

const box = "max-width: 420px";

export const ManyToMany = tpl(
  `<sb-row label="populated" stack><c-select-many-to-many :model="a" for="personTags" style="${box}" /></sb-row>
  <sb-row label="empty" stack><c-select-many-to-many :model="b" for="personTags" style="${box}" /></sb-row>
  <sb-row label="readonly" stack><c-select-many-to-many :model="a" for="personTags" readonly style="${box}" /></sb-row>
  <sb-row label="disabled" stack><c-select-many-to-many :model="a" for="personTags" disabled style="${box}" /></sb-row>`,
  () => ({ a: person(1), b: person(4) }),
);

export const ManyToManyOpen = tpl(`<div style="${box}; height: 440px"><c-select-many-to-many :model="a" for="personTags" /></div>`, () => ({ a: person(1) }), {
  play: async ({ canvasElement }) => {
    await user.click(canvasElement.querySelector<HTMLElement>(".c-select .v-field")!);
    await find(".c-select__menu-content .v-list-item");
  },
});

export const Values = tpl(
  `<sb-row label="string[]" stack><c-select-values :model="p" for="nicknames" style="${box}" /></sb-row>
  <sb-row label="int[]" stack><c-select-values :model="p" for="luckyNumbers" style="${box}" /></sb-row>
  <sb-row label="empty" stack><c-select-values :model="q" for="nicknames" style="${box}" /></sb-row>
  <sb-row label="disabled" stack><c-select-values :model="p" for="nicknames" disabled style="${box}" /></sb-row>`,
  () => ({ p: person(1), q: person(2) }),
);

export const StringValue = tpl(
  `<sb-row label="method suggestions" stack><c-select-string-value v-model="nick" for="Person" method="nicknameSuggestions" label="Nickname" list-when-empty style="${box}" /></sb-row>`,
  () => ({ nick: ref("Ada") }),
);

export const StringValueOpen = tpl(
  `<div style="${box}; height: 420px"><c-select-string-value v-model="nick" for="Person" method="nicknameSuggestions" label="Nickname" list-when-empty /></div>`,
  () => ({ nick: ref("") }),
  {
    play: async ({ canvasElement }) => {
      const input = canvasElement.querySelector<HTMLInputElement>("input")!;
      await user.click(input);
      await user.type(input, "a");
    },
  },
);
