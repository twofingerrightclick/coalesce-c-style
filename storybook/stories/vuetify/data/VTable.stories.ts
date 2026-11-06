import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";
import { rows } from "./_data";

export default { title: "Vuetify/Data/VTable", tags: ["vuetify:VTable"] } satisfies Meta;

const table = (attrs: string) => `
  <v-table ${attrs}>
    <thead><tr><th>Name</th><th>Email</th><th>Company</th><th class="text-end">Age</th></tr></thead>
    <tbody><tr v-for="r in rows" :key="r.id"><td>{{ r.name }}</td><td>{{ r.email }}</td><td>{{ r.company }}</td><td class="text-end">{{ r.age }}</td></tr></tbody>
  </v-table>`;

export const Densities = tpl(
  `<sb-section v-for="d in ['default','comfortable','compact']" :key="d" :title="d">${table(`:density="d"`)}</sb-section>`,
  () => ({ rows: rows.slice(0, 4) }),
);

export const Options = tpl(
  `<sb-section title="hover + striped (even)">${table(`hover striped="even"`)}</sb-section>
  <sb-section title="fixed header, height 240">${table(`fixed-header height="240"`)}</sb-section>`,
  () => ({ rows: rows.slice(0, 10) }),
);
