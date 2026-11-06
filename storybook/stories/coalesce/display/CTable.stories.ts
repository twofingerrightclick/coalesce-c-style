import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";
import { people } from "../_support";

export default {
  title: "Coalesce/Display/c-table",
  tags: ["coalesce:CTable"],
} satisfies Meta;

const props = ["name", "email", "company", "status", "isActive", "age", "birthDate"];

export const ReadOnly = tpl(`<c-table :list="list" :props="props" />`, () => ({ list: people(), props }));

export const Sorted = tpl(`<c-table :list="list" :props="props" />`, () => ({ list: people({ orderByDescending: "Age" }), props }));

export const Editable = tpl(`<c-table :list="list" :props="props" editable />`, () => ({ list: people({ pageSize: 5 }), props }));

export const Admin = tpl(`<c-table :list="list" :props="props" admin />`, () => ({ list: people({ pageSize: 5 }), props }));

/** All columns plus an actions column, wide enough to scroll and pin it. */
export const WideWithFixedActions = tpl(
  `<c-table :list="list" admin :extra-headers="[{ header: 'Actions', isFixed: true }]">
    <template #item-append="{ item }"><td class="fixed-column-right"><v-btn icon="$edit" variant="text" size="small" aria-label="Edit" /></td></template>
  </c-table>`,
  () => ({ list: people({ pageSize: 5 }) }),
);

export const Empty = tpl(`<c-table :list="list" :props="props" />`, () => ({ list: people({ search: "zzz-no-match" }), props }));
