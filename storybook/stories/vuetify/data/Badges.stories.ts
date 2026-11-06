import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";

export default {
  title: "Vuetify/Data/VBadge and VAvatar",
  tags: ["vuetify:VBadge", "vuetify:VAvatar", "vuetify:VAvatarGroup"],
} satisfies Meta;

export const Badge = tpl(
  `<sb-row label="content"><v-badge content="3"><v-icon icon="$info" /></v-badge><v-badge content="128" max="99" color="error"><v-btn>Inbox</v-btn></v-badge><v-badge dot color="success"><v-avatar color="surface-variant">AL</v-avatar></v-badge></sb-row>
  <sb-row label="colors"><v-badge v-for="c in ['primary','secondary','success','warning','error','info']" :key="c" :color="c" content="5"><v-icon icon="$file" /></v-badge></sb-row>
  <sb-row label="inline / bordered / floating"><v-badge inline content="New" color="primary" /><v-badge bordered content="2" color="error"><v-avatar color="primary">GH</v-avatar></v-badge><v-badge floating content="9"><v-btn>Floating</v-btn></v-badge></sb-row>`,
);

export const Avatar = tpl(
  `<sb-row label="sizes"><v-avatar v-for="s in ['x-small','small','default','large','x-large']" :key="s" :size="s" color="primary">AL</v-avatar></sb-row>
  <sb-row label="variants"><v-avatar v-for="v in ['flat','tonal','outlined','text']" :key="v" :variant="v" color="primary">{{ v[0].toUpperCase() }}</v-avatar></sb-row>
  <sb-row label="content"><v-avatar :image="img" /><v-avatar icon="$info" color="surface-variant" /><v-avatar rounded="lg" color="secondary">SQ</v-avatar><v-avatar tile color="success">T</v-avatar></sb-row>
  <sb-row label="group"><v-avatar-group :items="group" /></sb-row>`,
  () => {
    const img = `data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='40' height='40' fill='#93c5fd'/></svg>")}`;
    return { img, group: ["AL", "GH", "AT", "KJ", "ED"].map((t) => ({ text: t })) };
  },
);
