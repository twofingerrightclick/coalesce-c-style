import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";

export default { title: "Vuetify/Surfaces/VBanner", tags: ["vuetify:VBanner"] } satisfies Meta;

export const Banners = tpl(
  `<sb-section title="one line"><v-banner icon="$info" lines="one" text="A new version is available."><template #actions><v-btn>Dismiss</v-btn><v-btn color="primary">Update</v-btn></template></v-banner></sb-section>
  <sb-section title="two lines, color"><v-banner color="warning" icon="$warning" lines="two" text="Your trial ends in 3 days. Add a payment method to keep your workspace."><template #actions><v-btn>Later</v-btn></template></v-banner></sb-section>
  <sb-section title="stacked"><v-banner stacked lines="three" text="Stacked banner with actions below the text. Banners stay until dismissed."><template #actions><v-btn>OK</v-btn></template></v-banner></sb-section>`,
);

// VBanner has no title prop. Mark title and description explicitly with the
// existing typography roles instead of making all banner text medium.
export const TitleAndDescription = tpl(
  `<v-banner icon="$info"><template #text><strong class="text-label-large">A new version is available.</strong> <span class="text-body-medium text-muted">Refresh when you're ready to update.</span></template><template #actions><v-btn>Dismiss</v-btn><v-btn color="primary">Update</v-btn></template></v-banner>`,
);
