import type { Meta } from "@storybook/vue3-vite";
import { parity, staticPopover } from "./_parity";

export default { title: "Parity/Overlays" } satisfies Meta;

export const Menu = parity(
  "Menu: items, disabled, separator, heading",
  `<div style="min-height:260px"><v-menu :model-value="true" attach persistent no-click-animation location="bottom start" max-width="240">
    <template #activator="{ props }"><v-btn v-bind="props">Open</v-btn></template>
    <v-list data-parity="menu">
      <v-list-item title="Back" data-parity="menu-item"><template #append><v-kbd>⌘[</v-kbd></template></v-list-item>
      <v-list-item title="Forward" disabled data-parity="menu-disabled" />
      <v-list-item title="Reload" />
      <v-divider class="my-1" />
      <v-list-subheader data-parity="menu-heading">People</v-list-subheader>
      <v-list-item title="Pedro Duarte" />
    </v-list>
  </v-menu></div>`,
  `<div class="canon-menu" popover role="menu" style="max-width:240px" data-parity="menu">
    <button type="button" class="canon-menu-item" role="menuitem" data-parity="menu-item"><span class="canon-menu-label">Back</span><kbd class="canon-kbd" aria-hidden="true">⌘[</kbd></button>
    <button type="button" class="canon-menu-item" role="menuitem" aria-disabled="true" data-parity="menu-disabled"><span class="canon-menu-label">Forward</span></button>
    <button type="button" class="canon-menu-item" role="menuitem"><span class="canon-menu-label">Reload</span></button>
    <hr class="canon-separator">
    <div class="canon-menu-group" role="group"><div class="canon-menu-heading" data-parity="menu-heading">People</div>
      <button type="button" class="canon-menu-item" role="menuitem"><span class="canon-menu-label">Pedro Duarte</span></button></div>
  </div>`,
  staticPopover,
);

export const Tooltip = parity(
  "Tooltip",
  `<div style="padding:48px 24px"><v-tooltip :model-value="true" text="Label" location="bottom" attach :content-props="{ 'data-parity': 'tooltip' }"><template #activator="{ props }"><v-btn v-bind="props">Hover</v-btn></template></v-tooltip></div>`,
  `<div style="padding:48px 24px"><div class="canon-tooltip" popover="manual" role="tooltip" data-parity="tooltip">Label</div></div>`,
  staticPopover,
);

export const Dialog = parity(
  "Dialog: header, body, footer",
  `<div style="position:relative;min-height:320px"><v-dialog :model-value="true" attach contained persistent no-click-animation max-width="480">
    <v-card data-parity="dialog">
      <v-card-item><v-card-title data-parity="dialog-title">Edit event</v-card-title><template #append><v-btn icon="$close" color="neutral" variant="text" aria-label="Close" /></template></v-card-item>
      <v-card-text><v-text-field label="Title" model-value="Hackweek" hide-details /></v-card-text>
      <v-card-actions data-parity="dialog-footer"><v-btn color="neutral" variant="outlined">Cancel</v-btn><v-spacer /><v-btn variant="flat" color="primary">Save</v-btn></v-card-actions>
    </v-card>
  </v-dialog></div>`,
  `<dialog class="canon-dialog" open style="max-width:480px" data-parity="dialog"><form method="dialog">
    <header class="canon-dialog-header"><h2 class="canon-dialog-title" data-parity="dialog-title">Edit event</h2><button type="button" class="canon-button" data-emphasis="minimal" data-intent="neutral" data-display="icon"><span class="canon-icon" data-icon="close" aria-hidden="true"></span><span class="canon-button-label">Close</span></button></header>
    <div class="canon-dialog-body"><div class="canon-field"><div class="canon-label"><label class="canon-label-text" for="t">Title</label></div><div class="canon-text-input"><input id="t" type="text" value="Hackweek" placeholder></div></div></div>
    <footer class="canon-dialog-footer" data-parity="dialog-footer"><button type="button" class="canon-button" data-emphasis="low" data-intent="neutral"><span class="canon-button-label">Cancel</span></button><button type="button" class="canon-button" data-emphasis="high" data-align="end"><span class="canon-button-label">Save</span></button></footer>
  </form></dialog>`,
  staticPopover,
);
