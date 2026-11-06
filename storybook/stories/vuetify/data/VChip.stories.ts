import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { colors, sizes, tpl } from "../../_helpers";

export default { title: "Vuetify/Data/VChip", tags: ["vuetify:VChip", "vuetify:VChipGroup"] } satisfies Meta;

export const VariantsByColor = tpl(
  `<sb-row v-for="v in ['tonal','flat','outlined','text','elevated']" :key="v" :label="v">
    <v-chip v-for="c in colors" :key="c ?? 'default'" :variant="v" :color="c">{{ c ?? 'default' }}</v-chip>
  </sb-row>`,
  () => ({ colors }),
);

export const Features = tpl(
  `<sb-row label="icons"><v-chip prepend-icon="$info">Info</v-chip><v-chip append-icon="$dropdown">Menu</v-chip><v-chip closable>Closable</v-chip><v-chip><template #prepend><v-avatar color="primary" start>A</v-avatar></template>Ada</v-chip></sb-row>
  <sb-row label="states"><v-chip link>Link</v-chip><v-chip disabled>Disabled</v-chip><v-chip label>Label (square)</v-chip><v-chip filter :model-value="true">Filter</v-chip></sb-row>
  <sb-row label="sizes"><v-chip v-for="s in sizes" :key="s" :size="s">{{ s }}</v-chip></sb-row>
  <sb-row label="density"><v-chip v-for="d in ['default','comfortable','compact']" :key="d" :density="d">{{ d }}</v-chip></sb-row>`,
  () => ({ sizes }),
);

export const ChipGroup = tpl(
  `<sb-row label="filter, multiple"><v-chip-group v-model="sel" multiple filter selected-class="text-primary"><v-chip v-for="t in tags" :key="t" :value="t">{{ t }}</v-chip></v-chip-group></sb-row>
  <sb-row label="mandatory"><v-chip-group v-model="one" mandatory color="primary" variant="outlined"><v-chip v-for="t in tags" :key="t" :value="t">{{ t }}</v-chip></v-chip-group></sb-row>
  <sb-row label="column"><div style="width: 320px"><v-chip-group column><v-chip v-for="(t, i) in tags.concat(tags)" :key="i">{{ t }}</v-chip></v-chip-group></div></sb-row>`,
  () => ({ tags: ["Mentor", "Remote", "On call", "Part time", "New hire"], sel: ref(["Remote"]), one: ref("Mentor") }),
);
