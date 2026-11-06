import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Data/VPagination", tags: ["vuetify:VPagination"] } satisfies Meta;

export const Pagination = tpl(
  `<sb-row label="default"><v-pagination v-model="page" :length="12" /></sb-row>
  <sb-row label="total-visible 5"><v-pagination v-model="page" :length="12" :total-visible="5" /></sb-row>
  <sb-row label="variants"><v-pagination v-for="v in ['text','outlined','tonal','flat']" :key="v" :variant="v" active-color="primary" :model-value="2" :length="4" /></sb-row>
  <sb-row label="rounded"><v-pagination rounded="circle" :model-value="2" :length="4" /></sb-row>
  <sb-row label="density"><v-pagination v-for="d in ['default','comfortable','compact']" :key="d" :density="d" :model-value="2" :length="3" /></sb-row>
  <sb-row label="disabled"><v-pagination disabled :model-value="2" :length="4" /></sb-row>
  <sb-row label="first/last"><v-pagination show-first-last-page :model-value="5" :length="10" :total-visible="3" /></sb-row>`,
  () => ({ page: ref(4) }),
);
