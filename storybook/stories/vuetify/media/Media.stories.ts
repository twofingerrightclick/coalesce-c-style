import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { placeholderImage, tpl } from "../../_helpers";

export default {
  title: "Vuetify/Media/Images and motion",
  tags: [
    "vuetify:VImg", "vuetify:VCarousel", "vuetify:VParallax", "vuetify:VResponsive", "vuetify:VSparkline",
    "vuetify:VPullToRefresh", "vuetify:VHover", "vuetify:VLazy", "vuetify:VNoSsr",
  ],
} satisfies Meta;

const img = (h: number, l = "") => placeholderImage(h, l);

export const Img = tpl(
  `<sb-row label="cover / contain / aspect" stack>
    <v-img :src="a" height="160" cover />
    <v-img :src="a" height="160" contain class="border" />
    <v-img :src="a" :aspect-ratio="1" width="160" rounded="lg" />
  </sb-row>
  <sb-row label="gradient + content" stack><v-img :src="b" height="160" cover gradient="to bottom, rgba(0,0,0,0), rgba(0,0,0,.6)" class="align-end"><div class="pa-4 text-white">Caption over image</div></v-img></sb-row>`,
  () => ({ a: img(220, "cover"), b: img(20) }),
);

export const Carousel = tpl(
  `<v-carousel height="260" show-arrows="hover" hide-delimiter-background style="max-width: 640px">
    <v-carousel-item v-for="(s, i) in slides" :key="i" :src="s" cover />
  </v-carousel>`,
  () => ({ slides: [img(200, "One"), img(280, "Two"), img(340, "Three")] }),
);

export const Parallax = tpl(
  `<v-parallax :src="a" height="220" style="max-width: 640px"><div class="d-flex fill-height align-center justify-center text-h5 text-white">Parallax</div></v-parallax>`,
  () => ({ a: img(160) }),
);

export const Responsive = tpl(
  `<v-responsive :aspect-ratio="16 / 9" max-width="400" class="border rounded"><div class="d-flex fill-height align-center justify-center">16 / 9</div></v-responsive>`,
);

export const Sparkline = tpl(
  `<sb-row label="trend" stack><v-sparkline :model-value="values" line-width="2" smooth color="primary" /><v-sparkline :model-value="values" type="bar" color="success" auto-line-width /><v-sparkline :model-value="values" fill :gradient="['#2563eb', '#93c5fd']" smooth /></sb-row>`,
  () => ({ values: [2, 6, 3, 8, 5, 9, 4, 7, 10, 6] }),
);

export const HoverLazyNoSsr = tpl(
  `<sb-row label="v-hover"><v-hover v-slot="{ isHovering, props }"><v-card v-bind="props" :elevation="isHovering ? 5 : 1" width="200" title="Hover me" :text="isHovering ? 'Hovering' : 'Resting'" /></v-hover></sb-row>
  <sb-row label="v-lazy"><v-lazy min-height="60" :options="{ threshold: 0.5 }"><v-card width="200" title="Lazy" text="Rendered when visible" /></v-lazy></sb-row>
  <sb-row label="v-no-ssr"><v-no-ssr><v-chip>Client only</v-chip></v-no-ssr></sb-row>
  <sb-row label="v-pull-to-refresh"><div style="height: 160px; width: 320px; overflow: auto" class="border rounded"><v-pull-to-refresh @load="({ done }) => setTimeout(done, 500)"><v-list><v-list-item v-for="n in 6" :key="n" :title="'Row ' + n" /></v-list></v-pull-to-refresh></div></sb-row>`,
  () => ({ setTimeout: (f: () => void, ms: number) => window.setTimeout(f, ms), n: ref(0) }),
);
