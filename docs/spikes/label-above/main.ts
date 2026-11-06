import { createApp } from "vue";
import { createVuetify } from "vuetify";
import { cStyleBlueprint } from "c-style";
import "vuetify/styles";
import "c-style/styles";
import Fields from "./Fields.vue";

if (location.search.includes("spike")) await import("./label-above.scss");

const blueprint = cStyleBlueprint();
const vuetify = createVuetify({
  blueprint,
  defaults: {
    ...blueprint.defaults,
    // Candidate blueprint defaults for text inputs (plan §3b).
    ...Object.fromEntries(
      ["VTextField", "VTextarea", "VSelect", "VAutocomplete", "VCombobox"].map((c) => [
        c,
        { variant: "outlined", persistentPlaceholder: true, hideDetails: "auto", ...(location.search.includes("spike") ? { singleLine: true } : {}) },
      ]),
    ),
  },
});
createApp(Fields).use(vuetify).mount("#app");
