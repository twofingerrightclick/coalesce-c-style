import type { Meta } from "@storybook/vue3-vite";
import { Bell, Building2, CircleUser, House, Mail, Settings, Sparkles, Users } from "@lucide/vue";
import { csAliases, csIcon } from "coalesce-c-style";
import { tpl } from "../_helpers";

export default {
  title: "Foundations/Icons",
  tags: ["vuetify:VIcon", "vuetify:VSvgIcon", "vuetify:VClassIcon", "vuetify:VComponentIcon", "vuetify:VLigatureIcon"],
} satisfies Meta;

// The FontAwesome strings Coalesce 6.5.1 and the Coalesce template pass to v-icon.
const faNames = [
  "asterisk", "calendar-alt", "caret-down", "caret-up", "clock", "columns", "download", "edit", "ellipsis-h",
  "external-link-alt", "eye", "eye-slash", "filter", "info-circle", "lock", "save", "search", "trash-alt", "undo",
  "clipboard-list", "cogs", "home", "lock-open", "moon", "palette",
];

const grid = `display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px`;

export const Aliases = tpl(
  `<sb-section :title="'All ' + aliases.length + ' $aliases (csAliases)'">
    <div style="${grid}">
      <div v-for="a in aliases" :key="a" class="d-flex align-center ga-2"><v-icon :icon="'$' + a" /><code style="font-size: 12px">\${{ a }}</code></div>
    </div>
  </sb-section>`,
  () => ({ aliases: Object.keys(csAliases).sort() }),
);

export const CoalesceFontAwesome = tpl(
  `<sb-section title="'fa fa-*' strings mapped to Lucide by the cs set">
    <div style="${grid}">
      <div v-for="n in faNames" :key="n" class="d-flex align-center ga-2"><v-icon :icon="'fa fa-' + n" /><code style="font-size: 12px">fa-{{ n }}</code></div>
    </div>
  </sb-section>
  <sb-section title="Unmapped strings fall back to class names" note="Raw FontAwesome (left), fa:-prefixed through Vuetify's FA set (right).">
    <sb-row label="fallback"><v-icon icon="fa fa-rocket" /><v-icon icon="fa:fas fa-rocket" /></sb-row>
  </sb-section>`,
  () => ({ faNames }),
);

export const AppIcons = tpl(
  `<sb-row label="csIcon(Lucide)"><v-icon v-for="(i, k) in icons" :key="k" :icon="i" /></sb-row>
  <sb-row label="sizes"><v-icon v-for="s in ['x-small','small','default','large','x-large']" :key="s" :size="s" :icon="icons.house" /></sb-row>
  <sb-row label="colors"><v-icon v-for="c in ['primary','success','warning','error','info']" :key="c" :color="c" icon="$info" /></sb-row>
  <sb-row label="in text"><span>Inline <v-icon icon="$info" size="small" /> icon in body copy.</span></sb-row>`,
  () => ({
    icons: Object.fromEntries(
      Object.entries({ house: House, users: Users, building: Building2, mail: Mail, bell: Bell, user: CircleUser, settings: Settings, sparkles: Sparkles }).map(([k, v]) => [k, csIcon(v)]),
    ),
  }),
);
