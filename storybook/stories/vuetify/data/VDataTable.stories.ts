import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";
import { headers, rows } from "./_data";

export default {
  title: "Vuetify/Data/VDataTable",
  tags: ["vuetify:VDataTable", "vuetify:VDataTableServer", "vuetify:VDataTableVirtual"],
} satisfies Meta;

export const Default = tpl(
  `<v-data-table :headers="headers" :items="rows" :items-per-page="5" />`,
  () => ({ headers, rows }),
);

export const SelectSortGroup = tpl(
  `<sb-section title="show-select, sorted by age desc">
    <v-data-table v-model="selected" :headers="headers" :items="rows" show-select :sort-by="[{ key: 'age', order: 'desc' }]" :items-per-page="5" item-value="id" />
  </sb-section>
  <sb-section title="grouped by company">
    <v-data-table :headers="headers" :items="rows.slice(0, 8)" :group-by="[{ key: 'company' }]" :items-per-page="-1" hide-default-footer />
  </sb-section>`,
  () => ({ headers, rows, selected: ref([2, 3]) }),
);

export const States = tpl(
  `<sb-section title="loading"><v-data-table :headers="headers" :items="[]" loading loading-text="Loading people…" /></sb-section>
  <sb-section title="empty"><v-data-table :headers="headers" :items="[]" no-data-text="No people match." /></sb-section>
  <sb-section title="density compact, hover"><v-data-table :headers="headers" :items="rows" density="compact" hover :items-per-page="5" /></sb-section>`,
  () => ({ headers, rows }),
);

export const Server = tpl(
  `<v-data-table-server :headers="headers" :items="page" :items-length="rows.length" :items-per-page="5" @update:options="load" />`,
  () => {
    const page = ref(rows.slice(0, 5));
    const load = ({ page: p, itemsPerPage }: { page: number; itemsPerPage: number }) =>
      (page.value = rows.slice((p - 1) * itemsPerPage, p * itemsPerPage));
    return { headers, rows, page, load };
  },
);

export const Virtual = tpl(
  `<v-data-table-virtual :headers="headers" :items="many" height="300" item-value="id" />`,
  () => ({ headers, many: Array.from({ length: 300 }, (_, i) => ({ ...rows[i % rows.length], id: i })) }),
);
