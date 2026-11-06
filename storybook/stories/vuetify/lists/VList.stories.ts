import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Lists/VList", tags: ["vuetify:VList"] } satisfies Meta;

export const Items = tpl(
  `<sb-row label="lines" stack>
    <v-list border rounded lines="one"><v-list-subheader>One line</v-list-subheader><v-list-item v-for="p in people" :key="p" :title="p" prepend-icon="$info" /></v-list>
    <v-list border rounded lines="two"><v-list-subheader>Two lines</v-list-subheader><v-list-item v-for="p in people" :key="p" :title="p" subtitle="Engineer"><template #prepend><v-avatar color="primary" variant="tonal">{{ p[0] }}</v-avatar></template></v-list-item></v-list>
    <v-list border rounded lines="three"><v-list-item v-for="p in people.slice(0,2)" :key="p" :title="p" subtitle="A longer subtitle that wraps across two lines to show three-line items in a list." /></v-list>
  </sb-row>`,
  () => ({ people: ["Ada Lovelace", "Grace Hopper", "Alan Turing"] }),
);

export const States = tpl(
  `<sb-row label="states" stack>
    <v-list border rounded v-model:selected="sel" color="primary">
      <v-list-item title="Selected" value="a" />
      <v-list-item title="Active (link)" value="b" active />
      <v-list-item title="Hoverable link" value="c" link />
      <v-list-item title="Disabled" value="d" disabled />
      <v-list-item title="With actions" value="e"><template #append><v-btn icon="$edit" variant="text" size="small" aria-label="Edit" /></template></v-list-item>
    </v-list>
    <v-list border rounded nav density="compact"><v-list-item title="Nav, compact" prepend-icon="fa fa-home" active /><v-list-item title="Settings" prepend-icon="fa fa-cogs" /></v-list>
  </sb-row>
  <sb-row label="density" stack><v-list v-for="d in ['default','comfortable','compact']" :key="d" :density="d" border rounded><v-list-item :title="d" prepend-icon="$info" /><v-list-item title="Second" prepend-icon="$info" /></v-list></sb-row>`,
  () => ({ sel: ref(["a"]) }),
);

export const Groups = tpl(
  `<v-list border rounded v-model:opened="open" style="max-width: 320px">
    <v-list-group value="admin"><template #activator="{ props }"><v-list-item v-bind="props" title="Admin" prepend-icon="fa fa-cogs" /></template>
      <v-list-item title="People" /><v-list-item title="Companies" /><v-list-item title="Audit log" />
    </v-list-group>
    <v-list-group value="reports"><template #activator="{ props }"><v-list-item v-bind="props" title="Reports" prepend-icon="fa fa-clipboard-list" /></template><v-list-item title="Monthly" /></v-list-group>
  </v-list>`,
  () => ({ open: ref(["admin"]) }),
);
