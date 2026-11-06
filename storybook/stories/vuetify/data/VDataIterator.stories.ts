import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";
import { rows } from "./_data";

export default { title: "Vuetify/Data/VDataIterator", tags: ["vuetify:VDataIterator"] } satisfies Meta;

export const Cards = tpl(
  `<v-data-iterator :items="rows" :items-per-page="6">
    <template #default="{ items }">
      <v-row><v-col v-for="i in items" :key="i.raw.id" cols="12" sm="6" md="4"><v-card :title="i.raw.name" :subtitle="i.raw.company" :text="i.raw.email" /></v-col></v-row>
    </template>
    <template #footer="{ page, pageCount, prevPage, nextPage }">
      <div class="d-flex align-center justify-end ga-2 mt-4"><v-btn icon="$prev" :disabled="page == 1" @click="prevPage" aria-label="Previous" /><span>{{ page }} / {{ pageCount }}</span><v-btn icon="$next" :disabled="page >= pageCount" @click="nextPage" aria-label="Next" /></div>
    </template>
  </v-data-iterator>`,
  () => ({ rows }),
);
