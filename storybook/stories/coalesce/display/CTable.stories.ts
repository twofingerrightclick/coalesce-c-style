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

export const CardComposition = tpl(
  `<div class="d-flex flex-column ga-4">
    <v-card data-composition="direct">
      <v-toolbar><v-toolbar-title>Direct table</v-toolbar-title></v-toolbar>
      <c-table :list="list" :props="columns" />
      <v-divider /><c-list-pagination :list="list" />
    </v-card>
    <v-card data-composition="loader">
      <v-toolbar><v-toolbar-title>Table with loader</v-toolbar-title></v-toolbar>
      <c-loader-status :loaders="list.$load"><c-table :list="list" :props="columns" /></c-loader-status>
      <v-divider /><c-list-pagination :list="list" />
    </v-card>
    <v-card data-composition="native">
      <v-toolbar><v-toolbar-title>Vuetify table</v-toolbar-title></v-toolbar>
      <v-table><thead><tr><th>Name</th><th>Email</th></tr></thead><tbody><tr><td>Ada Lovelace</td><td>ada@example.com</td></tr></tbody></v-table>
      <v-divider /><c-list-pagination :list="list" />
    </v-card>
    <v-card data-composition="padded"><v-card-text><c-table :list="list" :props="columns" /></v-card-text></v-card>
    <div data-composition="standalone"><c-table :list="list" :props="columns" /></div>
  </div>`,
  () => ({ list: people({ pageSize: 2 }), columns: ["name", "email"] }),
);
