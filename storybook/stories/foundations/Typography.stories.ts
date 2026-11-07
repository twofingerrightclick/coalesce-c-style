import type { Meta } from "@storybook/vue3-vite";
import { fontPresets } from "@/fonts";
import { tpl } from "../_helpers";

export default { title: "Foundations/Typography" } satisfies Meta;

const ramp = ["display", "headline", "title", "body", "label"].flatMap((role) =>
  ["large", "medium", "small"].map((size) => `text-${role}-${size}`),
);

const fontNote = `
  <sb-section title="Font" note="The Font toolbar switches the body and heading font with applyCStyleFont(useTheme(), family); the choice stays as you move between stories. Public Sans (default) ships with c-style and Inter is its opt-in import (coalesce-c-style/fonts/inter); the Google Fonts and Fontshare presets load on demand and are for preview only.">
    <sb-row label="presets"><span v-for="(p, key) in fontPresets" :key="key"><code>{{ key }}</code> {{ p.title }}</span></sb-row>
    <sb-row label="any font"><span>Add <code>&amp;globals=font:Space+Grotesk</code> to the URL for any Google Fonts family, or <code>&amp;globals=font:fontshare+cabinet-grotesk</code> for a Fontshare slug.</span></sb-row>
    <sb-row label="features"><span>Inter's alternates (ss01 cv11 cv04 cv03 cv02) apply only to Inter; other fonts get <code>font-feature-settings: normal</code>. Canon's negative tracking is scaled by <code>--v-font-tracking</code>: 1 for Inter, 0.5 for Public Sans, 0 for other fonts.</span></sb-row>
  </sb-section>`;

export const Ramp = tpl(
  `${fontNote}
  <sb-row v-for="c in ramp" :key="c" :label="c">
    <sb-measure :props="['font-family', 'font-size', 'line-height', 'font-weight', 'letter-spacing']"><div :class="c">The quick brown fox, 0123456789</div></sb-measure>
  </sb-row>`,
  () => ({ ramp, fontPresets }),
);

export const Body = tpl(
  `<sb-row label="body"><sb-measure :props="['font-family', 'font-size', 'line-height', 'font-feature-settings']"><p style="max-width: 60ch">Body copy in the selected font. Inter's alternates show in: 1 l I 0 O a g — ss01 cv11 cv04.</p></sb-measure></sb-row>
  <sb-row label="weights"><span v-for="w in ['thin','light','regular','medium','bold','black']" :key="w" :class="'font-weight-' + w">{{ w }}</span></sb-row>
  <sb-row label="muted"><span class="text-medium-emphasis">medium emphasis</span><span class="text-disabled">disabled</span><span class="text-high-emphasis">high emphasis</span></sb-row>
  <sb-row label="code"><code>inline code</code><v-kbd>Ctrl</v-kbd></sb-row>
  <sb-row label="decoration"><a href="#">A link</a><span class="text-decoration-line-through">struck</span><span class="text-uppercase">uppercase</span><span class="font-italic">italic</span></sb-row>`,
);
