# Component parity checklist template

## General known issues and audit limits

- [ ] **Size support is incomplete across the library.** Shared small/medium/large size contexts were removed; the shared tokens are based on medium. Some components support named sizes and have focused tests, including chips and time inputs, but there has been no general small/large parity sweep. Check each applicable size and record unsupported or unverified cases. See [historical size decision](archive/progress-milestones.md#review-fixes-docsreviewfidelity-reviewmd) and [size guidance](../packages/c-style/docs/components.md#sizes).
- [ ] **Cross-variant parity needs review.** Storybook exercises more than the default presentation: [button stories](../storybook/stories/vuetify/buttons/VBtn.stories.ts) include flat, tonal, outlined, text, elevated and plain; [shared field stories](../storybook/stories/_helpers.ts) include seven field variants and three densities. Their existence establishes examples, not a passing parity result. Do not infer that only medium emphasis works or that other variants pass without observations.
- [ ] **The automated gate covers a subset.** [The parity suite](../verify/parity/parity.spec.ts) selects `Parity/` stories except Smoke and compares marked pairs in light/dark. The complete Storybook inventory below is wider. A clean render or an unmarked component is not evidence of visual parity.
- [ ] **Computed root styles can conceal visible differences.** The gate accepts root padding, inline-size and some container typography differences because frameworks place styles on different elements. [Measured properties](../verify/lib/measure.ts) do not cover every visual property or interaction. Inspect rendered text children, outlines, overlays, icons and screenshots, including font smoothing. [The font investigation](research/font-weight-parity.md) records an actual smoothing mismatch and subsequent fixes; those fixed findings are regression cases, not presumed current defects.
- [ ] **Accepted deviations require an explicit disposition.** The gate documents neutral/disabled color differences, pagination height, choice hints and navigation spacing, among other exceptions. Review them against [acceptance criteria](parity-acceptance.md) before adopting them for a new audit; an existing test exemption is not blanket approval for a visible mismatch.
- [ ] **Source and target models differ.** [Known deviations](../packages/c-style/docs/canon-differences.md) retain framework behavior and note that explicit application props affect results. Many Canon recipes have no one-to-one target component; mappings below are review starting points, not implemented-equivalence claims.
- [ ] **Story tags can describe internal components.** Coalesce tags include three names absent from its public component barrel. Review them through their containing public components; do not assume they are registered standalone by [Storybook setup](../storybook/.storybook/preview.ts).

## How to use a copy

Copy this file to a dated or task-specific document, preserving this baseline with all boxes unchecked. Record the commit, installed versions, reviewer, date, browser/OS, viewport, themes, accent palettes and fonts. Follow [parity acceptance criteria](parity-acceptance.md) for the actual pass conditions.

Every unchecked box means **not yet reviewed to completion**, including items with stories. It does not mean a confirmed defect. Check an item only after all applicable criteria have evidence and a disposition. Record `PASS`, `PASS WITH ACCEPTED DIFFERENCES`, `FAIL`, `BLOCKED` or `N/A — reason`, a completion date, and a link to the evidence beside the item in the copy. Keep FAIL and BLOCKED unchecked. N/A requires an explicit scope/mapping reason and reviewer disposition rather than silently deleting the item. Add issue links and retest evidence when fixing a mismatch. An entire review has a completion date only when all items are resolved or explicitly dispositioned.

For each component, expand this reusable review record:

- [ ] Identify the Canon counterpart, or document an approved framework-only/no-counterpart disposition.
- [ ] Inspect default and every supported applicable variant, emphasis, size, density and semantic color; record unsupported combinations explicitly.
- [ ] Inspect rest, hover, focus-visible, active/selected, disabled, readonly, loading, error, empty and populated states where applicable.
- [ ] Verify light/dark and the selected font/accent matrix, typography roles and smoothing, spacing, geometry, surface, borders, shadows and icons.
- [ ] Exercise keyboard/pointer behavior, validation, open/closed overlays, responsive/overflow behavior and composed usage where applicable.
- [ ] Attach matching Canon/target stories or fixtures, measurements/screenshots, acceptance decisions, remaining issue links and retest results.

Use a per-component table when needed: `Case | Canon reference | Target fixture | Context | Observation | Status | Evidence/issue`. A family story link below is a discovery aid; it does not establish coverage of every compound child or state. Add a dedicated fixture when the existing story does not isolate the item.

## Inventory provenance

Snapshot: 2026-11-07. Inventory totals: 71 Canon references, 195 public Vuetify component exports, 24 public Coalesce components, 3 internal Coalesce story-tag names and 3 public c-style components. Storybook pins Vuetify **4.3.2** and Coalesce Vue Vuetify **6.5.1** in [its manifest](../storybook/package.json). This inventory follows the installed `storybook/node_modules/vuetify/lib/components/index.js` re-exports (including compound parts and transitions), installed `coalesce-vue-vuetify3/dist/components/index.d.ts`, [c-style's component barrel](../packages/c-style/src/components/index.ts), every Markdown file in [Canon's component references](../canon/docs/components), and `vuetify:*` / `coalesce:*` tags in Storybook source files. These are source-inventory checks, not a live Storybook index or a browser audit. Regenerate/reconcile exports and stories after dependency upgrades; do not rely on a component directory name alone (for example VGrid exports VContainer/VRow/VCol/VSpacer).

Noncomponent helpers, types, directives and experimental/labs entry points not exported by the registered `vuetify/components` entry point are outside this baseline. Canon recipes remain in scope even when no matching export exists. Storybook-only internal tags are listed separately rather than misrepresented as public exports.

## Canon source components and recipes

Each source reference is independently unchecked. Candidate targets indicate a place to investigate; a composition or unmapped item needs an explicit mapping decision and fixture.

- [ ] [Accordion](../canon/docs/components/accordion.md) — VExpansionPanels / VExpansionPanel
- [ ] [Alert](../canon/docs/components/alert.md) — VAlert
- [ ] [App Shell](../canon/docs/components/app-shell.md) — VApp / VLayout / VMain composition
- [ ] [Avatar Group](../canon/docs/components/avatar-group.md) — VAvatarGroup
- [ ] [Avatar](../canon/docs/components/avatar.md) — VAvatar
- [ ] [Banner](../canon/docs/components/banner.md) — VBanner
- [ ] [Breadcrumb](../canon/docs/components/breadcrumb.md) — VBreadcrumbs
- [ ] [Button Group](../canon/docs/components/button-group.md) — VBtnGroup
- [ ] [Button](../canon/docs/components/button.md) — VBtn / VIconBtn / VFab (review each emphasis)
- [ ] [Card](../canon/docs/components/card.md) — VCard and parts
- [ ] [Checkbox](../canon/docs/components/checkbox.md) — VCheckbox / VCheckboxBtn
- [ ] [Choice anatomy](../canon/docs/components/choice.md) — VSelectionControl; app-specific choice composition
- [ ] [Code Block](../canon/docs/components/code-block.md) — VCode plus application composition
- [ ] [Color Picker](../canon/docs/components/color-picker.md) — VColorPicker / VColorInput
- [ ] [Combobox](../canon/docs/components/combobox.md) — VCombobox
- [ ] [Command Palette](../canon/docs/components/command-palette.md) — composition / mapping gap; no dedicated export
- [ ] [Count](../canon/docs/components/count.md) — VBadge candidate; verify semantics
- [ ] [Data Table: editing cells](../canon/docs/components/data-table-editing.md) — VDataTable / CTable editing composition
- [ ] [Data Table](../canon/docs/components/data-table.md) — VDataTable / VDataTableServer / VDataTableVirtual / CTable
- [ ] [Date](../canon/docs/components/date.md) — VDateInput / VDatePicker / CDatetimePicker
- [ ] [Description List](../canon/docs/components/description-list.md) — application markup; no dedicated export
- [ ] [Dialog](../canon/docs/components/dialog.md) — VDialog
- [ ] [Drawer](../canon/docs/components/drawer.md) — VNavigationDrawer / VOverlay composition
- [ ] [Empty State](../canon/docs/components/empty-state.md) — VEmptyState
- [ ] [Field](../canon/docs/components/field.md) — VField / VInput and field wrappers
- [ ] [Fieldset](../canon/docs/components/fieldset.md) — application markup / VRadioGroup candidate
- [ ] [Filter Bar](../canon/docs/components/filter-bar.md) — CListFilters plus application composition
- [ ] [Form Layout](../canon/docs/components/form-layout.md) — VForm / grid / CAdminEditor composition
- [ ] [Form Repeater](../canon/docs/components/form-repeater.md) — application composition; no dedicated export
- [ ] [Input OTP](../canon/docs/components/input-otp.md) — VOtpInput and parts
- [ ] [Kbd](../canon/docs/components/kbd.md) — VKbd / VHotkey
- [ ] [Label](../canon/docs/components/label.md) — VLabel and input labels
- [ ] [Link](../canon/docs/components/link.md) — VBtn link presentation / application anchors
- [ ] [Menu](../canon/docs/components/menu.md) — VMenu / VList
- [ ] [Menubar](../canon/docs/components/menubar.md) — application composition; no dedicated export
- [ ] [Nav List](../canon/docs/components/nav-list.md) — VList / VNavigationDrawer
- [ ] [Number Input](../canon/docs/components/number-input.md) — VNumberInput
- [ ] [Page Header](../canon/docs/components/page-header.md) — application composition; no dedicated export
- [ ] [Pagination](../canon/docs/components/pagination.md) — VPagination / Coalesce list controls
- [ ] [Password](../canon/docs/components/password.md) — VTextField type=password / CInput
- [ ] [Popover](../canon/docs/components/popover.md) — VOverlay / VMenu composition
- [ ] [Radio](../canon/docs/components/radio.md) — VRadio / VRadioGroup
- [ ] [Range Slider](../canon/docs/components/range-slider.md) — VRangeSlider
- [ ] [Rich Text](../canon/docs/components/rich-text.md) — application composition; no dedicated export
- [ ] [Save Bar](../canon/docs/components/save-bar.md) — application composition; no dedicated export
- [ ] [Section](../canon/docs/components/section.md) — application markup; no dedicated export
- [ ] [Segmented Control](../canon/docs/components/segmented-control.md) — VBtnToggle / VBtnGroup candidate
- [ ] [Select](../canon/docs/components/select.md) — VSelect / CSelect and variants
- [ ] [Separator](../canon/docs/components/separator.md) — VDivider
- [ ] [Sidebar](../canon/docs/components/sidebar.md) — VNavigationDrawer composition
- [ ] [Skeleton](../canon/docs/components/skeleton.md) — VSkeletonLoader
- [ ] [Slider](../canon/docs/components/slider.md) — VSlider
- [ ] [Spinner](../canon/docs/components/spinner.md) — VProgressCircular
- [ ] [Split Button](../canon/docs/components/split-button.md) — VBtnGroup / VMenu composition
- [ ] [Split Pane](../canon/docs/components/split-pane.md) — application composition; no dedicated export
- [ ] [Stack, Cluster and Grid](../canon/docs/components/stack.md) — grid / application layout composition
- [ ] [Stat](../canon/docs/components/stat.md) — application composition; no dedicated export
- [ ] [Status Indicator](../canon/docs/components/status.md) — VBadge / VChip candidate
- [ ] [Swatches](../canon/docs/components/swatches.md) — VColorPicker / application composition
- [ ] [Switch](../canon/docs/components/switch.md) — VSwitch
- [ ] [Table](../canon/docs/components/table.md) — VTable / CTable
- [ ] [Tabs](../canon/docs/components/tabs.md) — VTabs / VTab / VWindow
- [ ] [Tag](../canon/docs/components/tag.md) — VChip
- [ ] [Text Input](../canon/docs/components/text-input.md) — VTextField / CInput
- [ ] [Textarea](../canon/docs/components/textarea.md) — VTextarea / CInput
- [ ] [Time](../canon/docs/components/time.md) — CsTimeInput / CsTimeField / CsTimeRangeField / CDatetimePicker
- [ ] [Toast](../canon/docs/components/toast.md) — VSnackbar / VSnackbarQueue
- [ ] [Toggle Chip](../canon/docs/components/toggle-chip.md) — VChipGroup / VChip candidate
- [ ] [Toolbar](../canon/docs/components/toolbar.md) — VToolbar
- [ ] [Tooltip](../canon/docs/components/tooltip.md) — VTooltip
- [ ] [Top Bar](../canon/docs/components/top-bar.md) — VAppBar / VSystemBar composition

## Vuetify target components

All named V-prefixed exports in the registered component entry point are listed, including utility providers and transitions. A tagged family story may render children implicitly; acceptance remains per item. “No tagged story” is a discovery gap, not proof the component never renders anywhere.

### VApp

Discovery: [vuetify/navigation/Shell.stories.ts](../storybook/stories/vuetify/navigation/Shell.stories.ts).

- [ ] `VApp` — directly tagged
### VAppBar

Discovery: [vuetify/navigation/Shell.stories.ts](../storybook/stories/vuetify/navigation/Shell.stories.ts).

- [ ] `VAppBar` — directly tagged
- [ ] `VAppBarNavIcon` — no direct tag; inspect family/composed coverage
- [ ] `VAppBarTitle` — no direct tag; inspect family/composed coverage
### VAlert

Discovery: [vuetify/surfaces/VAlert.stories.ts](../storybook/stories/vuetify/surfaces/VAlert.stories.ts).

- [ ] `VAlert` — directly tagged
- [ ] `VAlertTitle` — no direct tag; inspect family/composed coverage
### VAutocomplete

Discovery: [vuetify/text-entry/VAutocomplete.stories.ts](../storybook/stories/vuetify/text-entry/VAutocomplete.stories.ts).

- [ ] `VAutocomplete` — directly tagged
### VAvatar

Discovery: [vuetify/data/Badges.stories.ts](../storybook/stories/vuetify/data/Badges.stories.ts).

- [ ] `VAvatar` — directly tagged
### VAvatarGroup

Discovery: [vuetify/data/Badges.stories.ts](../storybook/stories/vuetify/data/Badges.stories.ts).

- [ ] `VAvatarGroup` — directly tagged
### VBadge

Discovery: [vuetify/data/Badges.stories.ts](../storybook/stories/vuetify/data/Badges.stories.ts).

- [ ] `VBadge` — directly tagged
### VBanner

Discovery: [vuetify/surfaces/VBanner.stories.ts](../storybook/stories/vuetify/surfaces/VBanner.stories.ts).

- [ ] `VBanner` — directly tagged
- [ ] `VBannerActions` — no direct tag; inspect family/composed coverage
- [ ] `VBannerText` — no direct tag; inspect family/composed coverage
### VBottomNavigation

Discovery: [vuetify/navigation/More.stories.ts](../storybook/stories/vuetify/navigation/More.stories.ts).

- [ ] `VBottomNavigation` — directly tagged
### VBottomSheet

Discovery: [vuetify/overlays/VDialog.stories.ts](../storybook/stories/vuetify/overlays/VDialog.stories.ts).

- [ ] `VBottomSheet` — directly tagged
### VBreadcrumbs

Discovery: [vuetify/navigation/More.stories.ts](../storybook/stories/vuetify/navigation/More.stories.ts).

- [ ] `VBreadcrumbs` — directly tagged
- [ ] `VBreadcrumbsItem` — no direct tag; inspect family/composed coverage
- [ ] `VBreadcrumbsDivider` — no direct tag; inspect family/composed coverage
### VBtn

Discovery: [vuetify/buttons/VBtn.stories.ts](../storybook/stories/vuetify/buttons/VBtn.stories.ts).

- [ ] `VBtn` — directly tagged
### VBtnGroup

Discovery: [vuetify/buttons/VBtnGroup.stories.ts](../storybook/stories/vuetify/buttons/VBtnGroup.stories.ts).

- [ ] `VBtnGroup` — directly tagged
### VBtnToggle

Discovery: [vuetify/buttons/VBtnToggle.stories.ts](../storybook/stories/vuetify/buttons/VBtnToggle.stories.ts).

- [ ] `VBtnToggle` — directly tagged
### VCalendar

Discovery: [vuetify/pickers/Pickers.stories.ts](../storybook/stories/vuetify/pickers/Pickers.stories.ts).

- [ ] `VCalendar` — directly tagged
### VCard

Discovery: [vuetify/surfaces/VCard.stories.ts](../storybook/stories/vuetify/surfaces/VCard.stories.ts).

- [ ] `VCard` — directly tagged
- [ ] `VCardActions` — no direct tag; inspect family/composed coverage
- [ ] `VCardItem` — no direct tag; inspect family/composed coverage
- [ ] `VCardSubtitle` — no direct tag; inspect family/composed coverage
- [ ] `VCardText` — no direct tag; inspect family/composed coverage
- [ ] `VCardTitle` — no direct tag; inspect family/composed coverage
### VCarousel

Discovery: [vuetify/media/Media.stories.ts](../storybook/stories/vuetify/media/Media.stories.ts).

- [ ] `VCarousel` — directly tagged
- [ ] `VCarouselItem` — no direct tag; inspect family/composed coverage
### VCheckbox

Discovery: [vuetify/choices/VCheckbox.stories.ts](../storybook/stories/vuetify/choices/VCheckbox.stories.ts).

- [ ] `VCheckbox` — directly tagged
- [ ] `VCheckboxBtn` — directly tagged
### VChip

Discovery: [vuetify/data/VChip.stories.ts](../storybook/stories/vuetify/data/VChip.stories.ts).

- [ ] `VChip` — directly tagged
### VChipGroup

Discovery: [vuetify/data/VChip.stories.ts](../storybook/stories/vuetify/data/VChip.stories.ts).

- [ ] `VChipGroup` — directly tagged
### VCode

Discovery: [vuetify/data/Misc.stories.ts](../storybook/stories/vuetify/data/Misc.stories.ts).

- [ ] `VCode` — directly tagged
### VColorInput

Discovery: [vuetify/text-entry/VColorInput.stories.ts](../storybook/stories/vuetify/text-entry/VColorInput.stories.ts).

- [ ] `VColorInput` — directly tagged
### VColorPicker

Discovery: [vuetify/pickers/Controls.stories.ts](../storybook/stories/vuetify/pickers/Controls.stories.ts).

- [ ] `VColorPicker` — directly tagged
### VCombobox

Discovery: [vuetify/text-entry/VCombobox.stories.ts](../storybook/stories/vuetify/text-entry/VCombobox.stories.ts).

- [ ] `VCombobox` — directly tagged
### VConfirmEdit

Discovery: [vuetify/pickers/Forms.stories.ts](../storybook/stories/vuetify/pickers/Forms.stories.ts).

- [ ] `VConfirmEdit` — directly tagged
### VCounter

Discovery: [vuetify/text-entry/Parts.stories.ts](../storybook/stories/vuetify/text-entry/Parts.stories.ts).

- [ ] `VCounter` — directly tagged
### VDataIterator

Discovery: [vuetify/data/VDataIterator.stories.ts](../storybook/stories/vuetify/data/VDataIterator.stories.ts).

- [ ] `VDataIterator` — directly tagged
### VDataTable

Discovery: [vuetify/data/VDataTable.stories.ts](../storybook/stories/vuetify/data/VDataTable.stories.ts).

- [ ] `VDataTable` — directly tagged
- [ ] `VDataTableHeaders` — no direct tag; inspect family/composed coverage
- [ ] `VDataTableFooter` — no direct tag; inspect family/composed coverage
- [ ] `VDataTableRows` — no direct tag; inspect family/composed coverage
- [ ] `VDataTableRow` — no direct tag; inspect family/composed coverage
- [ ] `VDataTableVirtual` — directly tagged
- [ ] `VDataTableServer` — directly tagged
### VDateInput

Discovery: [vuetify/text-entry/VDateInput.stories.ts](../storybook/stories/vuetify/text-entry/VDateInput.stories.ts).

- [ ] `VDateInput` — directly tagged
### VDatePicker

Discovery: [vuetify/pickers/Pickers.stories.ts](../storybook/stories/vuetify/pickers/Pickers.stories.ts).

- [ ] `VDatePicker` — directly tagged
- [ ] `VDatePickerControls` — no direct tag; inspect family/composed coverage
- [ ] `VDatePickerHeader` — no direct tag; inspect family/composed coverage
- [ ] `VDatePickerMonth` — no direct tag; inspect family/composed coverage
- [ ] `VDatePickerMonths` — no direct tag; inspect family/composed coverage
- [ ] `VDatePickerYears` — no direct tag; inspect family/composed coverage
### VDefaultsProvider

Discovery: [vuetify/layout/Layout.stories.ts](../storybook/stories/vuetify/layout/Layout.stories.ts).

- [ ] `VDefaultsProvider` — directly tagged
### VDialog

Discovery: [vuetify/overlays/VDialog.stories.ts](../storybook/stories/vuetify/overlays/VDialog.stories.ts).

- [ ] `VDialog` — directly tagged
### VDivider

Discovery: [vuetify/surfaces/VSheet.stories.ts](../storybook/stories/vuetify/surfaces/VSheet.stories.ts).

- [ ] `VDivider` — directly tagged
### VEmptyState

Discovery: [vuetify/surfaces/Feedback.stories.ts](../storybook/stories/vuetify/surfaces/Feedback.stories.ts).

- [ ] `VEmptyState` — directly tagged
### VExpansionPanel

Discovery: [vuetify/surfaces/VExpansionPanels.stories.ts](../storybook/stories/vuetify/surfaces/VExpansionPanels.stories.ts).

- [ ] `VExpansionPanels` — no direct tag; inspect family/composed coverage
- [ ] `VExpansionPanel` — directly tagged
- [ ] `VExpansionPanelText` — no direct tag; inspect family/composed coverage
- [ ] `VExpansionPanelTitle` — no direct tag; inspect family/composed coverage
### VFab

Discovery: [vuetify/buttons/VFab.stories.ts](../storybook/stories/vuetify/buttons/VFab.stories.ts).

- [ ] `VFab` — directly tagged
### VField

Discovery: [vuetify/text-entry/Parts.stories.ts](../storybook/stories/vuetify/text-entry/Parts.stories.ts).

- [ ] `VField` — directly tagged
- [ ] `VFieldLabel` — no direct tag; inspect family/composed coverage
### VFileInput

Discovery: [vuetify/text-entry/VFileInput.stories.ts](../storybook/stories/vuetify/text-entry/VFileInput.stories.ts).

- [ ] `VFileInput` — directly tagged
### VFileUpload

Discovery: [vuetify/pickers/Forms.stories.ts](../storybook/stories/vuetify/pickers/Forms.stories.ts).

- [ ] `VFileUpload` — directly tagged
- [ ] `VFileUploadDropzone` — no direct tag; inspect family/composed coverage
- [ ] `VFileUploadItem` — no direct tag; inspect family/composed coverage
- [ ] `VFileUploadList` — no direct tag; inspect family/composed coverage
### VFooter

Discovery: [vuetify/navigation/Shell.stories.ts](../storybook/stories/vuetify/navigation/Shell.stories.ts).

- [ ] `VFooter` — directly tagged
### VForm

Discovery: [vuetify/pickers/Forms.stories.ts](../storybook/stories/vuetify/pickers/Forms.stories.ts).

- [ ] `VForm` — directly tagged
### VGrid

Discovery: [vuetify/layout/Layout.stories.ts](../storybook/stories/vuetify/layout/Layout.stories.ts).

- [ ] `VContainer` — directly tagged
- [ ] `VCol` — directly tagged
- [ ] `VRow` — directly tagged
- [ ] `VSpacer` — directly tagged
### VHighlight

Discovery: [vuetify/data/Misc.stories.ts](../storybook/stories/vuetify/data/Misc.stories.ts).

- [ ] `VHighlight` — directly tagged
### VHotkey

Discovery: [vuetify/overlays/VKbd.stories.ts](../storybook/stories/vuetify/overlays/VKbd.stories.ts).

- [ ] `VHotkey` — directly tagged
### VHover

Discovery: [vuetify/media/Media.stories.ts](../storybook/stories/vuetify/media/Media.stories.ts).

- [ ] `VHover` — directly tagged
### VIcon

Discovery: [foundations/Icons.stories.ts](../storybook/stories/foundations/Icons.stories.ts).

- [ ] `VIcon` — directly tagged
- [ ] `VComponentIcon` — directly tagged
- [ ] `VSvgIcon` — directly tagged
- [ ] `VLigatureIcon` — directly tagged
- [ ] `VClassIcon` — directly tagged
### VIconBtn

Discovery: [vuetify/buttons/VIconBtn.stories.ts](../storybook/stories/vuetify/buttons/VIconBtn.stories.ts).

- [ ] `VIconBtn` — directly tagged
### VImg

Discovery: [vuetify/media/Media.stories.ts](../storybook/stories/vuetify/media/Media.stories.ts).

- [ ] `VImg` — directly tagged
### VInfiniteScroll

Discovery: [vuetify/data/Misc.stories.ts](../storybook/stories/vuetify/data/Misc.stories.ts).

- [ ] `VInfiniteScroll` — directly tagged
### VInput

Discovery: [vuetify/text-entry/Parts.stories.ts](../storybook/stories/vuetify/text-entry/Parts.stories.ts).

- [ ] `VInput` — directly tagged
### VItemGroup

Discovery: [vuetify/navigation/More.stories.ts](../storybook/stories/vuetify/navigation/More.stories.ts).

- [ ] `VItemGroup` — directly tagged
- [ ] `VItem` — directly tagged
### VKbd

Discovery: [vuetify/overlays/VKbd.stories.ts](../storybook/stories/vuetify/overlays/VKbd.stories.ts).

- [ ] `VKbd` — directly tagged
### VLabel

Discovery: [vuetify/text-entry/Parts.stories.ts](../storybook/stories/vuetify/text-entry/Parts.stories.ts).

- [ ] `VLabel` — directly tagged
### VLayout

Discovery: [vuetify/navigation/Shell.stories.ts](../storybook/stories/vuetify/navigation/Shell.stories.ts).

- [ ] `VLayout` — directly tagged
- [ ] `VLayoutItem` — no direct tag; inspect family/composed coverage
### VLazy

Discovery: [vuetify/media/Media.stories.ts](../storybook/stories/vuetify/media/Media.stories.ts).

- [ ] `VLazy` — directly tagged
### VList

Discovery: [vuetify/lists/VList.stories.ts](../storybook/stories/vuetify/lists/VList.stories.ts).

- [ ] `VList` — directly tagged
- [ ] `VListGroup` — no direct tag; inspect family/composed coverage
- [ ] `VListImg` — no direct tag; inspect family/composed coverage
- [ ] `VListItem` — no direct tag; inspect family/composed coverage
- [ ] `VListItemAction` — no direct tag; inspect family/composed coverage
- [ ] `VListItemMedia` — no direct tag; inspect family/composed coverage
- [ ] `VListItemSubtitle` — no direct tag; inspect family/composed coverage
- [ ] `VListItemTitle` — no direct tag; inspect family/composed coverage
- [ ] `VListSubheader` — no direct tag; inspect family/composed coverage
### VLocaleProvider

Discovery: [vuetify/layout/Layout.stories.ts](../storybook/stories/vuetify/layout/Layout.stories.ts).

- [ ] `VLocaleProvider` — directly tagged
### VMain

Discovery: [vuetify/navigation/Shell.stories.ts](../storybook/stories/vuetify/navigation/Shell.stories.ts).

- [ ] `VMain` — directly tagged
### VMenu

Discovery: [vuetify/overlays/VMenu.stories.ts](../storybook/stories/vuetify/overlays/VMenu.stories.ts).

- [ ] `VMenu` — directly tagged
### VMessages

Discovery: [vuetify/text-entry/Parts.stories.ts](../storybook/stories/vuetify/text-entry/Parts.stories.ts).

- [ ] `VMessages` — directly tagged
### VNavigationDrawer

Discovery: [vuetify/navigation/Shell.stories.ts](../storybook/stories/vuetify/navigation/Shell.stories.ts).

- [ ] `VNavigationDrawer` — directly tagged
### VNoSsr

Discovery: [vuetify/media/Media.stories.ts](../storybook/stories/vuetify/media/Media.stories.ts).

- [ ] `VNoSsr` — directly tagged
### VNumberInput

Discovery: [vuetify/text-entry/VNumberInput.stories.ts](../storybook/stories/vuetify/text-entry/VNumberInput.stories.ts).

- [ ] `VNumberInput` — directly tagged
### VOtpInput

Discovery: [vuetify/text-entry/VOtpInput.stories.ts](../storybook/stories/vuetify/text-entry/VOtpInput.stories.ts).

- [ ] `VOtpInput` — directly tagged
- [ ] `VOtpField` — directly tagged
- [ ] `VOtpGroup` — directly tagged
- [ ] `VOtpSeparator` — directly tagged
### VOverlay

Discovery: [vuetify/overlays/VDialog.stories.ts](../storybook/stories/vuetify/overlays/VDialog.stories.ts).

- [ ] `VOverlay` — directly tagged
### VPagination

Discovery: [vuetify/data/VPagination.stories.ts](../storybook/stories/vuetify/data/VPagination.stories.ts).

- [ ] `VPagination` — directly tagged
### VParallax

Discovery: [vuetify/media/Media.stories.ts](../storybook/stories/vuetify/media/Media.stories.ts).

- [ ] `VParallax` — directly tagged
### VPicker

Discovery: [vuetify/pickers/Pickers.stories.ts](../storybook/stories/vuetify/pickers/Pickers.stories.ts).

- [ ] `VPicker` — directly tagged
- [ ] `VPickerTitle` — no direct tag; inspect family/composed coverage
### VProgress

Discovery: [vuetify/surfaces/Feedback.stories.ts](../storybook/stories/vuetify/surfaces/Feedback.stories.ts).

- [ ] `VProgress` — directly tagged
### VProgressCircular

Discovery: [vuetify/surfaces/Feedback.stories.ts](../storybook/stories/vuetify/surfaces/Feedback.stories.ts).

- [ ] `VProgressCircular` — directly tagged
### VProgressLinear

Discovery: [vuetify/surfaces/Feedback.stories.ts](../storybook/stories/vuetify/surfaces/Feedback.stories.ts).

- [ ] `VProgressLinear` — directly tagged
### VPullToRefresh

Discovery: [vuetify/media/Media.stories.ts](../storybook/stories/vuetify/media/Media.stories.ts).

- [ ] `VPullToRefresh` — directly tagged
### VRadio

Discovery: [vuetify/choices/VRadio.stories.ts](../storybook/stories/vuetify/choices/VRadio.stories.ts).

- [ ] `VRadio` — directly tagged
### VRadioGroup

Discovery: [vuetify/choices/VRadio.stories.ts](../storybook/stories/vuetify/choices/VRadio.stories.ts).

- [ ] `VRadioGroup` — directly tagged
### VRangeSlider

Discovery: [vuetify/pickers/Controls.stories.ts](../storybook/stories/vuetify/pickers/Controls.stories.ts).

- [ ] `VRangeSlider` — directly tagged
### VRating

Discovery: [vuetify/pickers/Controls.stories.ts](../storybook/stories/vuetify/pickers/Controls.stories.ts).

- [ ] `VRating` — directly tagged
### VResponsive

Discovery: [vuetify/media/Media.stories.ts](../storybook/stories/vuetify/media/Media.stories.ts).

- [ ] `VResponsive` — directly tagged
### VSelect

Discovery: [vuetify/text-entry/VSelect.stories.ts](../storybook/stories/vuetify/text-entry/VSelect.stories.ts).

- [ ] `VSelect` — directly tagged
### VSelectionControl

Discovery: [vuetify/choices/VSelectionControl.stories.ts](../storybook/stories/vuetify/choices/VSelectionControl.stories.ts).

- [ ] `VSelectionControl` — directly tagged
### VSelectionControlGroup

Discovery: [vuetify/choices/VSelectionControl.stories.ts](../storybook/stories/vuetify/choices/VSelectionControl.stories.ts).

- [ ] `VSelectionControlGroup` — directly tagged
### VSheet

Discovery: [vuetify/surfaces/VSheet.stories.ts](../storybook/stories/vuetify/surfaces/VSheet.stories.ts).

- [ ] `VSheet` — directly tagged
### VSkeletonLoader

Discovery: [vuetify/surfaces/Feedback.stories.ts](../storybook/stories/vuetify/surfaces/Feedback.stories.ts).

- [ ] `VSkeletonLoader` — directly tagged
### VSlideGroup

Discovery: [vuetify/navigation/More.stories.ts](../storybook/stories/vuetify/navigation/More.stories.ts).

- [ ] `VSlideGroup` — directly tagged
- [ ] `VSlideGroupItem` — no direct tag; inspect family/composed coverage
### VSlider

Discovery: [vuetify/pickers/Controls.stories.ts](../storybook/stories/vuetify/pickers/Controls.stories.ts).

- [ ] `VSlider` — directly tagged
### VSnackbar

Discovery: [vuetify/surfaces/VSnackbar.stories.ts](../storybook/stories/vuetify/surfaces/VSnackbar.stories.ts).

- [ ] `VSnackbar` — directly tagged
### VSnackbarQueue

Discovery: [vuetify/surfaces/VSnackbar.stories.ts](../storybook/stories/vuetify/surfaces/VSnackbar.stories.ts).

- [ ] `VSnackbarQueue` — directly tagged
### VSparkline

Discovery: [vuetify/media/Media.stories.ts](../storybook/stories/vuetify/media/Media.stories.ts).

- [ ] `VSparkline` — directly tagged
- [ ] `VSparklineTooltip` — no direct tag; inspect family/composed coverage
### VSpeedDial

Discovery: [vuetify/buttons/VFab.stories.ts](../storybook/stories/vuetify/buttons/VFab.stories.ts).

- [ ] `VSpeedDial` — directly tagged
### VStepper

Discovery: [vuetify/navigation/More.stories.ts](../storybook/stories/vuetify/navigation/More.stories.ts).

- [ ] `VStepper` — directly tagged
- [ ] `VStepperActions` — no direct tag; inspect family/composed coverage
- [ ] `VStepperHeader` — no direct tag; inspect family/composed coverage
- [ ] `VStepperItem` — no direct tag; inspect family/composed coverage
- [ ] `VStepperWindow` — no direct tag; inspect family/composed coverage
- [ ] `VStepperWindowItem` — no direct tag; inspect family/composed coverage
### VStepperVertical

Discovery: [vuetify/navigation/More.stories.ts](../storybook/stories/vuetify/navigation/More.stories.ts).

- [ ] `VStepperVertical` — directly tagged
- [ ] `VStepperVerticalItem` — no direct tag; inspect family/composed coverage
- [ ] `VStepperVerticalActions` — no direct tag; inspect family/composed coverage
### VSwitch

Discovery: [vuetify/choices/VSwitch.stories.ts](../storybook/stories/vuetify/choices/VSwitch.stories.ts).

- [ ] `VSwitch` — directly tagged
### VSystemBar

Discovery: [vuetify/navigation/Shell.stories.ts](../storybook/stories/vuetify/navigation/Shell.stories.ts).

- [ ] `VSystemBar` — directly tagged
### VTabs

Discovery: [vuetify/navigation/VTabs.stories.ts](../storybook/stories/vuetify/navigation/VTabs.stories.ts).

- [ ] `VTab` — directly tagged
- [ ] `VTabs` — directly tagged
- [ ] `VTabsWindow` — no direct tag; inspect family/composed coverage
- [ ] `VTabsWindowItem` — no direct tag; inspect family/composed coverage
### VTable

Discovery: [vuetify/data/VTable.stories.ts](../storybook/stories/vuetify/data/VTable.stories.ts).

- [ ] `VTable` — directly tagged
### VTextarea

Discovery: [vuetify/text-entry/VTextarea.stories.ts](../storybook/stories/vuetify/text-entry/VTextarea.stories.ts).

- [ ] `VTextarea` — directly tagged
### VTextField

Discovery: [vuetify/text-entry/VTextField.stories.ts](../storybook/stories/vuetify/text-entry/VTextField.stories.ts).

- [ ] `VTextField` — directly tagged
### VThemeProvider

Discovery: [vuetify/layout/Layout.stories.ts](../storybook/stories/vuetify/layout/Layout.stories.ts).

- [ ] `VThemeProvider` — directly tagged
### VTimeline

Discovery: [vuetify/data/Misc.stories.ts](../storybook/stories/vuetify/data/Misc.stories.ts).

- [ ] `VTimeline` — directly tagged
- [ ] `VTimelineItem` — no direct tag; inspect family/composed coverage
### VTimePicker

Discovery: [vuetify/pickers/Pickers.stories.ts](../storybook/stories/vuetify/pickers/Pickers.stories.ts).

- [ ] `VTimePicker` — directly tagged
- [ ] `VTimePickerClock` — no direct tag; inspect family/composed coverage
- [ ] `VTimePickerControls` — no direct tag; inspect family/composed coverage
### VToolbar

Discovery: [vuetify/navigation/VToolbar.stories.ts](../storybook/stories/vuetify/navigation/VToolbar.stories.ts).

- [ ] `VToolbar` — directly tagged
- [ ] `VToolbarTitle` — no direct tag; inspect family/composed coverage
- [ ] `VToolbarItems` — no direct tag; inspect family/composed coverage
### VTooltip

Discovery: [vuetify/overlays/VTooltip.stories.ts](../storybook/stories/vuetify/overlays/VTooltip.stories.ts).

- [ ] `VTooltip` — directly tagged
### VTreeview

Discovery: [vuetify/data/Misc.stories.ts](../storybook/stories/vuetify/data/Misc.stories.ts).

- [ ] `VTreeview` — directly tagged
- [ ] `VTreeviewItem` — no direct tag; inspect family/composed coverage
- [ ] `VTreeviewGroup` — no direct tag; inspect family/composed coverage
### VValidation

Discovery: [vuetify/pickers/Forms.stories.ts](../storybook/stories/vuetify/pickers/Forms.stories.ts).

- [ ] `VValidation` — directly tagged
### VVirtualScroll

Discovery: [vuetify/data/Misc.stories.ts](../storybook/stories/vuetify/data/Misc.stories.ts).

- [ ] `VVirtualScroll` — directly tagged
### VWindow

Discovery: [vuetify/navigation/VTabs.stories.ts](../storybook/stories/vuetify/navigation/VTabs.stories.ts).

- [ ] `VWindow` — directly tagged
- [ ] `VWindowItem` — no direct tag; inspect family/composed coverage
### transitions

Discovery: no component-tagged family story found; locate composed usage or add a fixture.

- [ ] `VDialogTransition` — no direct tag; inspect family/composed coverage
- [ ] `VFabTransition` — no direct tag; inspect family/composed coverage
- [ ] `VDialogBottomTransition` — no direct tag; inspect family/composed coverage
- [ ] `VDialogTopTransition` — no direct tag; inspect family/composed coverage
- [ ] `VFadeTransition` — no direct tag; inspect family/composed coverage
- [ ] `VScaleTransition` — no direct tag; inspect family/composed coverage
- [ ] `VScrollXTransition` — no direct tag; inspect family/composed coverage
- [ ] `VScrollXReverseTransition` — no direct tag; inspect family/composed coverage
- [ ] `VScrollYTransition` — no direct tag; inspect family/composed coverage
- [ ] `VScrollYReverseTransition` — no direct tag; inspect family/composed coverage
- [ ] `VSlideXTransition` — no direct tag; inspect family/composed coverage
- [ ] `VSlideXReverseTransition` — no direct tag; inspect family/composed coverage
- [ ] `VSlideYTransition` — no direct tag; inspect family/composed coverage
- [ ] `VSlideYReverseTransition` — no direct tag; inspect family/composed coverage
- [ ] `VExpandTransition` — no direct tag; inspect family/composed coverage
- [ ] `VExpandXTransition` — no direct tag; inspect family/composed coverage
- [ ] `VExpandBothTransition` — no direct tag; inspect family/composed coverage

## Coalesce public target components

Installed public barrel exports only. Each link identifies a tagged discovery story, including composed admin/list children; check actual markup and behavior before accepting.

- [ ] `CAdminAuditLogPage` — [coalesce/admin/CAdminAuditLogPage.stories.ts](../storybook/stories/coalesce/admin/CAdminAuditLogPage.stories.ts)
- [ ] `CAdminDisplay` — [coalesce/display/CDisplay.stories.ts](../storybook/stories/coalesce/display/CDisplay.stories.ts)
- [ ] `CAdminEditor` — [coalesce/admin/CAdminEditor.stories.ts](../storybook/stories/coalesce/admin/CAdminEditor.stories.ts)
- [ ] `CAdminEditorPage` — [coalesce/admin/CAdminEditor.stories.ts](../storybook/stories/coalesce/admin/CAdminEditor.stories.ts)
- [ ] `CAdminMethod` — [coalesce/admin/CAdminMethods.stories.ts](../storybook/stories/coalesce/admin/CAdminMethods.stories.ts)
- [ ] `CAdminMethods` — [coalesce/admin/CAdminMethods.stories.ts](../storybook/stories/coalesce/admin/CAdminMethods.stories.ts)
- [ ] `CAdminTable` — [coalesce/admin/CAdminTable.stories.ts](../storybook/stories/coalesce/admin/CAdminTable.stories.ts)
- [ ] `CAdminTablePage` — [coalesce/admin/CAdminTable.stories.ts](../storybook/stories/coalesce/admin/CAdminTable.stories.ts)
- [ ] `CAdminTableToolbar` — [coalesce/admin/CAdminTable.stories.ts](../storybook/stories/coalesce/admin/CAdminTable.stories.ts)
- [ ] `CAppUpdateAlert` — [coalesce/display/CAppUpdateAlert.stories.ts](../storybook/stories/coalesce/display/CAppUpdateAlert.stories.ts)
- [ ] `CDatetimePicker` — [coalesce/inputs/CDatetimePicker.stories.ts](../storybook/stories/coalesce/inputs/CDatetimePicker.stories.ts)
- [ ] `CDisplay` — [coalesce/display/CDisplay.stories.ts](../storybook/stories/coalesce/display/CDisplay.stories.ts)
- [ ] `CInput` — [coalesce/inputs/CInput.stories.ts](../storybook/stories/coalesce/inputs/CInput.stories.ts)
- [ ] `CListFilters` — [coalesce/lists/CListFilters.stories.ts](../storybook/stories/coalesce/lists/CListFilters.stories.ts)
- [ ] `CListPage` — [coalesce/lists/CListPagination.stories.ts](../storybook/stories/coalesce/lists/CListPagination.stories.ts)
- [ ] `CListPageSize` — [coalesce/lists/CListPagination.stories.ts](../storybook/stories/coalesce/lists/CListPagination.stories.ts)
- [ ] `CListPagination` — [coalesce/lists/CListPagination.stories.ts](../storybook/stories/coalesce/lists/CListPagination.stories.ts)
- [ ] `CListRangeDisplay` — [coalesce/lists/CListPagination.stories.ts](../storybook/stories/coalesce/lists/CListPagination.stories.ts)
- [ ] `CLoaderStatus` — [coalesce/display/CLoaderStatus.stories.ts](../storybook/stories/coalesce/display/CLoaderStatus.stories.ts)
- [ ] `CSelect` — [coalesce/inputs/CSelect.stories.ts](../storybook/stories/coalesce/inputs/CSelect.stories.ts)
- [ ] `CSelectManyToMany` — [coalesce/inputs/CSelectVariants.stories.ts](../storybook/stories/coalesce/inputs/CSelectVariants.stories.ts)
- [ ] `CSelectStringValue` — [coalesce/inputs/CSelectVariants.stories.ts](../storybook/stories/coalesce/inputs/CSelectVariants.stories.ts)
- [ ] `CSelectValues` — [coalesce/inputs/CSelectVariants.stories.ts](../storybook/stories/coalesce/inputs/CSelectVariants.stories.ts)
- [ ] `CTable` — [coalesce/display/CTable.stories.ts](../storybook/stories/coalesce/display/CTable.stories.ts)

## Coalesce internal names present in the story inventory

These names occur in story tags but are absent from the installed public component barrel. Accept them through the public parent and verify internal rendering, rather than requiring unsupported standalone imports.

- [ ] `CAdminCreateBtn` — [coalesce/admin/CAdminTable.stories.ts](../storybook/stories/coalesce/admin/CAdminTable.stories.ts)
- [ ] `CListFilterInput` — [coalesce/lists/CListFilters.stories.ts](../storybook/stories/coalesce/lists/CListFilters.stories.ts)
- [ ] `CTimePicker` — [coalesce/inputs/CDatetimePicker.stories.ts](../storybook/stories/coalesce/inputs/CDatetimePicker.stories.ts)

## c-style public target components

The time components are public exports; parsing helpers and types are not components. [Time stories](../storybook/stories/c-style/Time.stories.ts) and [time parity stories](../storybook/stories/parity/Time.stories.ts) are discovery references.

- [ ] `CsTimeInput` — inspect Canon time mapping, keyboard entry, parsing, constraints and states.
- [ ] `CsTimeField` — inspect field wrapper, labels, hints, errors and time behavior together.
- [ ] `CsTimeRangeField` — inspect start/end behavior, range validation, layout and accessible labeling.

The [option tiles story](../storybook/stories/c-style/OptionTiles.stories.ts) is an application composition, not another exported c-style component; retain it as a composed choice regression fixture.

## Audit completion in the copied checklist

- [ ] Every source recipe and target export has a disposition, including utility components, internal parts and mapping gaps.
- [ ] Every relevant Storybook family and composed page has been reconciled with the per-component cases; add missing fixtures instead of treating tags as tests.
- [ ] General issues above are resolved, deliberately accepted with evidence, or linked to outstanding issues.
- [ ] All claimed passes satisfy [acceptance criteria](parity-acceptance.md); failures/blocks remain visible and unchecked.
- [ ] Record verification commands/results, browser evidence, remaining limitations and reviewer sign-off.
