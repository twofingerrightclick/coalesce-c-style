import type { CanonReference, CanonReferenceResolver } from "./types";

// 18 Coalesce components: seven inputs, five display components, and six
// list controls. Canon supplies the visual patterns; Coalesce supplies the
// metadata, API requests, formatting, and persistence behavior.
const pattern = (page: string, section: string, note: string): CanonReference => ({ page, section, note, match: "pattern" });
const none = (note: string): CanonReference => ({ match: "none", note });

const inputStories: Record<string, CanonReference> = {
  strings: pattern("field", "every-control", "Canon's labelled controls are the visual reference. Coalesce chooses the text, password, color, and multiline inputs from property metadata."),
  numbers: pattern("text-input", "types", "Coalesce's numeric properties use text fields with numeric input types. Canon's input types are the reference; these are not the separate plus/minus Number Input."),
  booleans: pattern("field", "every-control", "Compare Canon's checkbox and switch fields with the metadata-driven boolean controls on the left."),
  enums: pattern("combobox", "multiple", "Canon's selected options and removable tags are the reference for Coalesce enum and flags editors."),
  dates: pattern("date", "size", "Canon's date fields are the reference. Coalesce additionally dispatches DateTime, DateOnly, and TimeOnly properties and formats their values."),
  binary: none("Canon has no file-upload or binary-property editor equivalent. The left shows Coalesce's metadata-driven file input."),
  reference: pattern("combobox", "search", "Canon's searchable choice list is the reference; Coalesce resolves the related records through its API."),
  manytomany: pattern("combobox", "multiple", "Canon's multi-value combobox is the reference. Coalesce additionally manages the join records."),
  primitivecollections: pattern("combobox", "free", "Canon's free-entry tag input is the reference for editing string and number collections."),
  unsupportedfallback: none("Canon has no metadata dispatcher or unsupported-property fallback. Coalesce displays this collection instead of offering an editor."),
  states: pattern("field", "states", "Canon's field states are the visual reference. The Coalesce story also exercises metadata-selected controls and server validation messages."),
  admindensity: pattern("field", "standalone", "Canon's standalone controls are the reference for admin inputs without a label. Coalesce retains its compact admin configuration."),
  standalonevalue: pattern("field", "basics", "Canon's labelled field is the reference. Coalesce can bind a standalone value while obtaining its rules and label from metadata."),
};

const selectStories: Record<string, CanonReference> = {
  single: pattern("combobox", "search", "Canon's searchable single-choice combobox is the reference. Coalesce's model binding and remote records are additional behavior."),
  multiple: pattern("combobox", "multiple", "Compare the selected tags and multi-choice list. Coalesce loads Company records rather than using Canon's static options."),
  options: pattern("combobox", "box", "Canon's clearable, read-only, disabled, and invalid boxes are the reference. Vuetify's filled variant has no matching Canon variant."),
  menuopen: pattern("combobox", "search", "Canon's search-in-list combobox is the reference. Open its box to inspect the original menu beside the open Coalesce menu."),
  search: pattern("combobox", "search", "Compare Canon's list-search pattern. Coalesce's query is sent to a server, so the results and request timing differ."),
  createitem: pattern("combobox", "create", "Canon's create-option row is the reference. Coalesce creates a record through the supplied callback."),
  loading: pattern("combobox", "from-your-app", "Canon's app-supplied-options pattern is the reference for remote loading. The left intentionally keeps its request pending; the reference is an interactive example, not the same request."),
  empty: pattern("combobox", "search", "Canon's searchable list is the reference; search for an unmatched value to see its no-results state. Coalesce's fixture returns no records immediately."),
  loaderror: pattern("empty-state", "error", "Canon's error-and-retry pattern is the visual reference. It has no exact equivalent of an API error rendered inside a Coalesce selection menu."),
  customslots: pattern("combobox", "options", "Canon's options with labels, icons, and avatars are the reference for Coalesce's custom item and selected-item slots."),
};

const selectVariantStories: Record<string, CanonReference> = {
  manytomany: pattern("combobox", "multiple", "Canon's multi-value combobox is the visual reference. Coalesce additionally manages the relationship's join records and its disabled/read-only states."),
  manytomanyopen: pattern("combobox", "multiple", "Open a Canon multi-value box to compare its selection list with the Coalesce relationship menu."),
  values: pattern("combobox", "free", "Canon's free-entry tag input is the reference for Coalesce's string[] and int[] property editors."),
  stringvalue: pattern("combobox", "inline", "Canon's inline-search combobox is the reference. Coalesce obtains suggestions from a method while storing the selected text."),
  stringvalueopen: pattern("combobox", "inline", "Type into Canon's inline-search box to compare suggestions. Coalesce's open list comes from its nickname-suggestions method."),
};

const dateStories: Record<string, CanonReference> = {
  kinds: pattern("date", "size", "Canon's segmented date field is the reference. Coalesce also supports date-time and time-only values; Canon documents those separately under Time."),
  nativeandstates: pattern("date", "states", "Compare disabled, read-only, and invalid date fields. The left also includes native browser inputs and Coalesce's combined date-time behavior."),
  opendatetime: pattern("date", "inline", "Canon's inline calendar is the date-selection reference. Coalesce combines a date calendar with time controls in one popup; Canon has no combined date-time picker."),
  opendate: pattern("date", "inline", "Canon's visible calendar is the reference for the open date picker. Calendar navigation and field presentation differ between the libraries."),
  opentime: pattern("time", "clock", "Canon's clock picker is the reference for Coalesce's open time picker."),
  narrowviewport: pattern("date", "inline", "Canon's calendar is the reference for the narrow date-time popup. Coalesce's combined date and time popup has no exact Canon counterpart."),
};

const tableStories: Record<string, CanonReference> = {
  readonly: pattern("data-table", "data-table", "Canon's data table is the reference. Coalesce generates columns, formats property values, and loads records from metadata."),
  sorted: pattern("data-table", "sorting", "Canon's sortable headings and sort indicators are the reference. Coalesce applies the ordering through its list API."),
  editable: pattern("data-table", "editing", "Canon's editable cells are the visual reference. Coalesce adds property editors and automatic persistence."),
  admin: pattern("data-table", "actions", "Canon's row actions are the reference for Coalesce's admin links and action column."),
  widewithfixedactions: pattern("data-table", "pinned", "Canon's pinned columns are the reference for Coalesce's fixed action column and horizontally scrolling table."),
  empty: pattern("data-table", "states", "Canon's table loading and empty states are the reference. Coalesce's fixture returns an empty result list."),
  cardcomposition: pattern("card", "table", "Canon's table-in-card composition is the reference for the table, toolbar, and pagination arrangements on the left."),
};

const displayStories: Record<string, CanonReference> = {
  alltypes: pattern("description-list", "values", "Canon's read-only values are the visual reference. It has no metadata formatter matching Coalesce's complete property-type matrix."),
  formats: pattern("description-list", "description-list", "Canon's read-only facts, including a formatted date, are the reference. Coalesce's custom formats, relative dates, and null rendering are additional behavior."),
  admindisplay: pattern("description-list", "values", "Canon's inline values, links, and download link are the reference. Coalesce adds metadata-aware navigation and binary downloads."),
  admindisplaycollections: pattern("description-list", "values", "Canon's multiple values per fact are the reference for Coalesce's related-record collection links."),
};

const loaderStories: Record<string, CanonReference> = {
  success: pattern("card", "card", "After a successful load Coalesce shows the supplied card content. Canon's card is the visual reference; Canon has no loader wrapper component."),
  loading: pattern("spinner", "in-context", "Canon's loading indicator in context is the related pattern. Coalesce's linear progress bar and loader orchestration have no exact Canon component."),
  errorwithretry: pattern("empty-state", "error", "Canon's error-and-retry composition is the related pattern. Coalesce renders its request failure in a compact alert."),
  savesuccess: pattern("alert", "alert", "Canon's status alerts are the visual reference for Coalesce's successful-save feedback. Saving and success timing are managed by Coalesce."),
  failingsave: pattern("alert", "alert", "Canon's danger alert is the visual reference for a failed save. Coalesce supplies the server error message and request lifecycle."),
};

const filterStories: Record<string, CanonReference> = {
  closed: pattern("data-table", "toolbar", "Canon's data-table toolbar and filter controls are the reference. Coalesce combines filters and optional column selection in a menu."),
  activebadge: pattern("filter-bar", "facets", "Canon's selected facet labels are the related active-filter pattern. Coalesce instead displays the number of active filters on its trigger."),
  open: pattern("data-table", "toolbar", "Open Canon's table filters to compare the original pattern. Coalesce uses its own metadata-driven columns-and-filters panel."),
  subfilteropen: pattern("filter-bar", "facets", "Canon's facet popup is the related pattern for Coalesce's property-specific subfilter editor. Open a facet to compare its choices."),
};

const paginationStories: Record<string, CanonReference> = {
  firstpage: pattern("pagination", "drawn", "Canon's drawn pagination examples include first-page disabled arrows. Coalesce additionally exposes separate page, page-size, and range-display components."),
  middlepage: pattern("pagination", "table", "Canon's table-footer pagination is the reference for Coalesce's page, row-count, range, and navigation controls."),
  lastpage: pattern("pagination", "drawn", "Canon's drawn pagination examples include last-page disabled arrows. The record counts and page sizes are different fixtures."),
  custompagesizes: pattern("pagination", "table", "Canon's rows-per-page selector is the reference. Coalesce's example uses custom choices of 5, 15, and 30."),
  unknowncount: pattern("pagination", "compact", "Canon's compact navigation is the closest visual reference. Coalesce additionally supports a server response with an unknown total, which Canon's numbered examples do not model."),
};

const stories: Record<string, Record<string, CanonReference>> = {
  "Coalesce/Inputs/c-input": inputStories,
  "Coalesce/Inputs/c-select": selectStories,
  "Coalesce/Inputs/c-select-many-to-many, values, string-value": selectVariantStories,
  "Coalesce/Inputs/c-datetime-picker": dateStories,
  "Coalesce/Display/c-table": tableStories,
  "Coalesce/Display/c-display": displayStories,
  "Coalesce/Display/c-loader-status": loaderStories,
  "Coalesce/Display/c-app-update-alert": {
    visible: pattern("banner", "banner", "Canon's banner is the related persistent announcement pattern. Coalesce detects a new deployment and offers reload; Canon has no deployment-detection component."),
  },
  "Coalesce/Lists/c-list-filters": filterStories,
  "Coalesce/Lists/c-list-pagination": paginationStories,
};

export const coalesceReferences: CanonReferenceResolver = (title, storyName) =>
  stories[title]?.[storyName.replace(/[^a-z0-9]/gi, "").toLowerCase()];
