import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";
import { find, pending, person, user, withMocks } from "../_support";

export default { title: "Coalesce/Inputs/c-select", tags: ["coalesce:CSelect"] } satisfies Meta;


/** Opens the first c-select on the page and waits for its menu. */
async function open({ canvasElement }: { canvasElement: HTMLElement }, search?: string) {
  await user.click(canvasElement.querySelector<HTMLElement>(".c-select .v-field")!);
  const menu = await find(".c-select__menu-content");
  if (search) await user.type(await find<HTMLInputElement>("input", menu), search);
}

export const Single = tpl(
  `<sb-row label="model + for" stack><c-select :model="person" for="company" /></sb-row>
  <sb-row label="empty" stack><c-select :model="blank" for="company" /></sb-row>
  <sb-row label="for type, v-model" stack><c-select for="Company" v-model="picked" label="Any company" /></sb-row>`,
  () => ({ person: person(1), blank: person(9), picked: ref(null) }),
);

export const Multiple = tpl(
  `<div style="max-width: 480px"><c-select for="Company" multiple v-model="picked" label="Companies" /></div>`,
  () => ({ picked: ref([]) }),
  {
    play: async (ctx) => {
      await open(ctx);
      await find(".c-select__menu-content .v-list-item:nth-child(3)");
      const items = document.querySelectorAll<HTMLElement>(".c-select__menu-content .v-list-item");
      await user.click(items[0]);
      await user.click(items[2]);
    },
  },
);

export const Options = tpl(
  `<sb-row label="clearable" stack><c-select :model="a" for="company" clearable /></sb-row>
  <sb-row label="readonly" stack><c-select :model="a" for="company" readonly /></sb-row>
  <sb-row label="disabled" stack><c-select :model="a" for="company" disabled /></sb-row>
  <sb-row label="error" stack><c-select :model="b" for="company" :error-messages="['Pick a company.']" /></sb-row>
  <sb-row label="density/variant" stack><c-select :model="a" for="company" density="compact" variant="outlined" /><c-select :model="a" for="company" variant="filled" /></sb-row>`,
  () => ({ a: person(2), b: person(9) }),
);

export const MenuOpen = tpl(`<div style="max-width: 360px; height: 420px"><c-select :model="p" for="company" /></div>`, () => ({ p: person(1) }), {
  play: (ctx) => open(ctx),
});

export const Search = tpl(`<div style="max-width: 360px; height: 420px"><c-select :model="p" for="manager" /></div>`, () => ({ p: person(9) }), {
  play: (ctx) => open(ctx, "gr"),
});

export const CreateItem = tpl(
  `<div style="max-width: 360px; height: 420px"><c-select :model="p" for="company" :create="create" /></div>`,
  () => ({
    p: person(9),
    create: {
      getLabel: (search: string) => (search ? `Create "${search}"` : false),
      getItem: async (search: string) => ({ companyId: 99, name: search }),
    },
  }),
  { play: (ctx) => open(ctx, "Initech") },
);

export const Loading = tpl(`<div style="max-width: 360px; height: 300px"><c-select :model="p" for="company" /></div>`, () => ({ p: person(9) }), {
  beforeEach: pending("/Company/list"),
  play: (ctx) => open(ctx),
});

export const Empty = tpl(`<div style="max-width: 360px; height: 300px"><c-select :model="p" for="company" /></div>`, () => ({ p: person(9) }), {
  beforeEach: withMocks({ empty: true }),
  play: (ctx) => open(ctx),
});

export const LoadError = {
  ...tpl(`<div style="max-width: 360px; height: 300px"><c-select :model="p" for="company" /></div>`, () => ({ p: person(9) }), {
    beforeEach: withMocks({ fail: /\/Company\/list/ }),
    play: (ctx) => open(ctx),
  }),
  tags: ["allow-request-errors"],
};

export const CustomSlots = tpl(
  `<div style="max-width: 360px; height: 420px">
    <c-select :model="p" for="company">
      <template #item="{ item, search }"><div class="d-flex align-center ga-2"><v-avatar size="24" :image="item.logoUrl" />{{ item.name }} <span class="text-medium-emphasis">· {{ item.city }}</span></div></template>
      <template #selected-item="{ item }"><v-chip size="small" prepend-icon="fa fa-home">{{ item.name }}</v-chip></template>
    </c-select>
  </div>`,
  () => ({ p: person(1) }),
  { play: (ctx) => open(ctx) },
);

