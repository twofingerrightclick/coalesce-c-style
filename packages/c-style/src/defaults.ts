import type { DefaultsInstance } from "vuetify";

/** Every component that renders Vuetify's text-input frame. */
const textInputs = [
  "VTextField",
  "VTextarea",
  "VSelect",
  "VAutocomplete",
  "VCombobox",
  "VFileInput",
  "VNumberInput",
  "VDateInput",
  "VColorInput",
  "VField",
] as const;

/**
 * Canon's field is a 1px frame; Vuetify's outlined variant is the one c-style
 * restyles (plan §3b). `singleLine` stops Vuetify's floating label, so
 * `_field.scss` can put the one label above the frame (decision 15).
 */
const textInput = {
  variant: "outlined",
  hideDetails: "auto",
  singleLine: true,
  persistentPlaceholder: true,
};

/** Canon's quiet in-place actions: minimal emphasis, neutral intent. */
const quietButton = { VBtn: { color: "neutral", variant: "text" } };

/**
 * Prop-level choices (plan §3b). Size and shape live in SASS, colour in the theme.
 *
 * Buttons default to Canon's medium emphasis in the accent (decisions 1b, 2).
 * Containers whose Canon counterpart uses neutral buttons get nested
 * defaults. A nested key also beats the `VBtn` defaults the container
 * provides itself (VToolbar, VCardActions), so each one is chosen here:
 * - VToolbar (incl. VAppBar), VToolbarItems, VTable, VDataTable, VField, VList,
 *   VAlert, VSnackbar: neutral minimal.
 * - VCardActions: medium emphasis at full padding (Vuetify: `text`, `slim`).
 * - VBtnGroup: low emphasis, neutral (Canon Button Group; Vuetify: `elevated`).
 * - VBtnToggle: minimal, neutral, undivided (Canon Segmented Control).
 * - VBannerActions: small high emphasis, neutral (Canon Banner).
 * - Left as Vuetify: VEmptyState,
 *   VNumberInput (inside VField), VDatePicker/VPicker (M14), VCarousel,
 *   VSpeedDial, VFileUpload, VTreeview.
 */
export const defaults: Partial<DefaultsInstance> = {
  global: {
    // Canon presses by scale, not ink (canon §2.10).
    ripple: false,
  },
  ...Object.fromEntries(textInputs.map((name) => [name, textInput])),
  // Their menus take the shared popup motion too (VMenu below).
  ...Object.fromEntries(
    (["VSelect", "VAutocomplete", "VCombobox"] as const).map((name) => [name, { ...textInput, transition: "cs-popup" }]),
  ),
  // The class opts a field into the label above; toolbar fields keep the
  // label inside, where it reads as a placeholder (Coalesce's table search).
  VField: { ...textInput, ...quietButton, class: "cs-label-above" },
  VBtn: { color: "primary", variant: "tonal" },
  // Canon form layout: fields stacked in a form sit a form gap apart
  // (_field.scss). Opt-in by form, so inputs laid out in a row elsewhere
  // (toolbars, filter bars) keep their own spacing.
  VForm: { class: "cs-form" },
  VToolbar: {
    ...quietButton,
    // An active field hides Vuetify's single-line label, and a persistent
    // placeholder keeps the field active.
    ...Object.fromEntries(textInputs.map((name) => [name, { persistentPlaceholder: false }])),
    VField: { class: "cs-label-inside" },
  },
  VToolbarItems: quietButton,
  VTable: quietButton,
  VDataTable: quietButton,
  VList: quietButton,
  // Canon toast: the bright surface, the intent only on the icon and a 4px
  // bar (_surface.scss); `color` becomes a tone, not a solid fill.
  VSnackbar: { ...quietButton, variant: "outlined" },
  VCardActions: { VBtn: { variant: "tonal", slim: false } },
  // Canon banner: a bare 20px icon, and small high-emphasis neutral actions.
  VBanner: { VAvatar: { size: 20 } },
  VBannerActions: { VBtn: { color: "neutral", variant: "flat", size: "small", slim: false } },
  // Canon has no stepper; chosen = ink (decision 7): the current and
  // completed steps' badges are the neutral solid, upcoming ones stay grey.
  VStepperItem: { color: "neutral" },
  VBtnGroup: { color: "neutral", variant: "outlined", divided: true },
  // Canon segmented control: options on a track, the chosen one a card
  // (_nav.scss, shared with inset tabs).
  VBtnToggle: { color: "neutral", variant: "text", divided: false },
  // Checked is neutral ink, not the accent (decision 7). Every checkbox,
  // radio and switch renders a VSelectionControl.
  VSelectionControl: { color: "neutral" },
  // Choices reserve no message row until they have a message, like text
  // inputs (Vuetify keeps 24px under every checkbox, switch and group).
  VCheckbox: { hideDetails: "auto" },
  VRadioGroup: { hideDetails: "auto" },
  // Vuetify paints an on switch's thumb in the track colour; Canon's stays
  // the surface (white / zinc-900).
  VSwitch: { thumbColor: "surface", hideDetails: "auto" },
  // Canon alert: a neutral surface with an edge, the intent only in a 4px
  // start bar and the icon (_surface.scss restyles outlined).
  VAlert: { ...quietButton, variant: "outlined", border: "start" },
  // Canon spinner: icon-sized ring, 1.5 stroke at 24 (canon §4 A Spinner).
  VProgressCircular: { size: 20, width: 1.5 },
  VProgressLinear: { height: 4 },
  // Canon menus: 4px panel padding and the shared popup
  // motion (`cs-popup` in _motion.scss) instead of Vuetify's grow-from-activator.
  VMenu: {
    offset: 4,
    transition: "cs-popup",
    VList: { class: "pa-1" },
  },
  // Canon list rows (menu, nav list) have the control radius wherever they
  // are; Vuetify squares them unless `rounded` is set.
  VListItem: { rounded: "md" },
  VTooltip: { openDelay: 500, closeDelay: 250, location: "top", offset: 4 },
  // Canon shell: a flat bar over a hairline and a 264px sidebar of nav lists.
  // The icon gap comes from --cs-control-gap in _nav.scss, so it inherits.
  VAppBar: { flat: true, border: true },
  // Canon md rail: 40px control + 2 × 12px shell inset. Vuetify resolves
  // railWidth numerically for layout and touch, so it cannot read a CSS token.
  VNavigationDrawer: { width: 264, railWidth: 64, VList: { nav: true } },
  VBottomNavigation: { color: "neutral", border: true, elevation: 0 },
  VFooter: { border: true },
  // Canon tabs: a segmented track whose selected tab is a raised card in
  // ink (_nav.scss paints the track and card).
  VTabs: { inset: true, color: "neutral" },
  // Chosen = ink in pickers and sliders too (decision 7). Canon's calendar
  // has a month header only, no MD title block.
  // Their day, month and arrow buttons are plain VBtns, which would take the
  // global accent; Canon's are ink.
  VDatePicker: { color: "neutral", hideHeader: true, ...quietButton },
  VColorPicker: quietButton,
  // Its unchosen period button gets no colour, so it would take the accent.
  VTimePicker: { color: "neutral", VBtn: { color: "neutral" } },
  VSlider: { color: "neutral" },
  VRangeSlider: { color: "neutral" },
  // Canon pagination is neutral: ink numbers, muted arrows (_btn.scss).
  VPagination: { color: "neutral" },
  // Canon tags are 4px-radius labels; pills are for filters and counts.
  VChip: { label: true },
};
