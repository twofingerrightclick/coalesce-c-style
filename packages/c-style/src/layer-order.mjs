/**
 * Vuetify 4's cascade-layer order (`vuetify/lib/styles/layers.css`) plus
 * c-style's `vuetify-utilities.c-style` sublayer, ranked last among the utility
 * sublayers so its custom-property re-points beat Vuetify's theme classes. It
 * has to be the first CSS a page parses, or bundled CSS order can rank the
 * layers wrongly (vuetify#22752). `styles/index.scss` repeats it; a test keeps
 * the two equal and the rest equal to Vuetify's.
 */
export const layerOrderCss =
  "@layer vuetify-core{@layer reset,base;}" +
  "@layer vuetify-components;" +
  "@layer vuetify-overrides;" +
  "@layer vuetify-utilities{@layer theme-base,typography,helpers,theme-background,theme-foreground,c-style;}" +
  "@layer vuetify-final{@layer transitions,trumps;}";

/** `layerOrderCss` wrapped in a `<style>` tag, for `<head>` injection (e.g. Storybook `previewHead`). */
export const layerOrderStyle = `<style>${layerOrderCss}</style>`;
