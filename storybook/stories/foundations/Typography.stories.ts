import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../_helpers";

export default { title: "Foundations/Typography" } satisfies Meta;

const ramp = ["display", "headline", "title", "body", "label"].flatMap((role) =>
  ["large", "medium", "small"].map((size) => `text-${role}-${size}`),
);

export const Ramp = tpl(
  `<sb-row v-for="c in ramp" :key="c" :label="c">
    <sb-measure :props="['font-family', 'font-size', 'line-height', 'font-weight', 'letter-spacing']"><div :class="c">The quick brown fox, 0123456789</div></sb-measure>
  </sb-row>`,
  () => ({ ramp }),
);

export const Body = tpl(
  `<sb-row label="body"><sb-measure :props="['font-family', 'font-size', 'line-height', 'font-feature-settings']"><p style="max-width: 60ch">Body copy at the application default. Inter's stylistic sets: 1 l I 0 O a g — ss01 cv11 cv04.</p></sb-measure></sb-row>
  <sb-row label="weights"><span v-for="w in ['thin','light','regular','medium','bold','black']" :key="w" :class="'font-weight-' + w">{{ w }}</span></sb-row>
  <sb-row label="muted"><span class="text-medium-emphasis">medium emphasis</span><span class="text-disabled">disabled</span><span class="text-high-emphasis">high emphasis</span></sb-row>
  <sb-row label="code"><code>inline code</code><v-kbd>Ctrl</v-kbd></sb-row>
  <sb-row label="decoration"><a href="#">A link</a><span class="text-decoration-line-through">struck</span><span class="text-uppercase">uppercase</span><span class="font-italic">italic</span></sb-row>`,
);
