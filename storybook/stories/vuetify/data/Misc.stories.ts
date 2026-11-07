import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { tpl } from "../../_helpers";
import { rows } from "./_data";

export default {
  title: "Vuetify/Data/More",
  tags: ["vuetify:VCode", "vuetify:VVirtualScroll", "vuetify:VInfiniteScroll", "vuetify:VTreeview", "vuetify:VTimeline", "vuetify:VHighlight"],
} satisfies Meta;

export const Code = tpl(
  `<p>Inline <v-code>createVuetify({ blueprint })</v-code> in a sentence.</p>
  <v-code tag="pre" class="mt-4">import { cStyle } from "coalesce-c-style/vite";
export default { plugins: [cStyle()] };</v-code>`,
);

export const Highlight = tpl(
  `<p><v-highlight text="Grace Hopper popularized machine-independent languages" query="machine" /></p>`,
);

export const VirtualScroll = tpl(
  `<v-virtual-scroll :items="many" height="240" item-height="40" style="max-width: 360px" class="border rounded">
    <template #default="{ item }"><v-list-item :title="item.name" :subtitle="item.email" /></template>
  </v-virtual-scroll>`,
  () => ({ many: Array.from({ length: 500 }, (_, i) => ({ ...rows[i % rows.length], id: i })) }),
);

export const InfiniteScroll = tpl(
  `<v-infinite-scroll height="240" style="max-width: 360px" class="border rounded" @load="load">
    <div v-for="i in items" :key="i" class="pa-2">Item {{ i }}</div>
  </v-infinite-scroll>`,
  () => {
    const items = ref(Array.from({ length: 12 }, (_, i) => i + 1));
    const load = ({ done }: { done: (s: string) => void }) => {
      if (items.value.length >= 36) return done("empty");
      items.value.push(...Array.from({ length: 12 }, (_, i) => items.value.length + i + 1));
      done("ok");
    };
    return { items, load };
  },
);

export const Treeview = tpl(
  `<v-treeview :items="tree" item-value="id" :opened="[1, 2]" activatable open-on-click style="max-width: 360px" />
  <v-treeview :items="tree" item-value="id" selectable select-strategy="classic" :opened="[1]" density="compact" style="max-width: 360px" class="mt-4" />`,
  () => ({
    tree: [
      { id: 1, title: "src", children: [{ id: 2, title: "domain", children: [{ id: 3, title: "metadata.g.ts" }, { id: 4, title: "viewmodels.g.ts" }] }, { id: 5, title: "mocks" }] },
      { id: 6, title: "stories", children: [{ id: 7, title: "vuetify" }] },
    ],
  }),
);

export const Timeline = tpl(
  `<sb-row label="vertical" stack>
    <v-timeline side="end" density="compact" align="start">
      <v-timeline-item v-for="(e, i) in events" :key="i" :dot-color="e.color" size="small"><div class="text-body-2"><strong>{{ e.title }}</strong><div>{{ e.when }}</div></div></v-timeline-item>
    </v-timeline>
    <v-timeline>
      <v-timeline-item v-for="(e, i) in events" :key="i" :dot-color="e.color" :icon="e.icon"><template #opposite>{{ e.when }}</template>{{ e.title }}</v-timeline-item>
    </v-timeline>
  </sb-row>
  <sb-row label="horizontal"><v-timeline direction="horizontal" line-inset="12"><v-timeline-item v-for="(e, i) in events" :key="i" :dot-color="e.color">{{ e.title }}</v-timeline-item></v-timeline></sb-row>`,
  () => ({
    events: [
      { title: "Created", when: "Nov 1", color: "primary", icon: "$plus" },
      { title: "Edited", when: "Nov 2", color: "info", icon: "$edit" },
      { title: "Deleted", when: "Nov 4", color: "error", icon: "$delete" },
    ],
  }),
);
