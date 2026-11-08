import type { CanonReference, CanonReferenceResolver } from "./types";

const pattern = (page: string, section: string, note: string, additional?: CanonReference[]): CanonReference => ({ page, section, note, match: "pattern", additional });
const direct = (page: string, section: string, note?: string, additional?: CanonReference[]): CanonReference => ({ page, section, note, match: "direct", additional });

/** Twenty components: nine Coalesce admin, seven feedback, three time, and OptionTiles. */
export const adminFeedbackReferences: CanonReferenceResolver = (title, storyName) => {
  const story = storyName.replace(/[^a-z0-9]/gi, "").toLowerCase();
  switch (title) {
    case "Coalesce/Admin/c-admin-audit-log-page":
      if (story === "empty") return pattern("empty-state", "no-results", "Canon's no-results example is the empty-list reference. Coalesce supplies the audit filters, query, and page composition.", [direct("data-table", "toolbar")]);
      return pattern("data-table", "data-table", "Canon's table and search/filter toolbar are the visual patterns for this audit page. Canon has no audit-log component or Coalesce metadata behavior.", [direct("data-table", "toolbar")]);
    case "Coalesce/Admin/c-admin-table":
      if (story === "toolbar") return pattern("data-table", "toolbar", "Original Canon search, filters, columns, and export toolbar. Coalesce supplies its metadata-driven Create and Edit actions.", [direct("toolbar", "toolbar")]);
      if (story === "editabledirty") return pattern("data-table", "editing", "Original editable cells are the visual reference; Coalesce tracks dirty records and saves them through its API.", [direct("save-bar", "save-bar")]);
      if (story === "autosave") return pattern("data-table", "editing", "Canon's editing cells are the reference. Automatic persistence and request status belong to Coalesce.");
      if (story === "pagewithmethods" || story === "pagecolorprimary") return pattern("data-table", "data-table", "Canon's table, toolbar, and page actions are the related patterns. Coalesce composes them into an API-backed admin page.", [direct("data-table", "toolbar"), direct("page-header", "page-header")]);
      return pattern("data-table", "data-table", "Canon's original table is the reference for rows and columns. Coalesce derives its columns, displays, permissions, and record links from metadata.", [direct("data-table", "actions")]);
    case "Coalesce/Admin/c-admin-editor":
      if (story === "viewonly") return pattern("description-list", "description-list", "Canon's description list is the related read-only record pattern; Coalesce selects display components from metadata.");
      if (story === "pageloaderror") return pattern("empty-state", "error", "Canon's error-and-retry example is the related failure pattern. Coalesce's page reports its own API error.");
      if (story === "validation") return pattern("field", "hint-message", "Original Canon errors and hints are the visual reference. Coalesce derives validation rules and fields from metadata.", [direct("form-layout", "form")]);
      if (story === "dirty") return pattern("save-bar", "save-bar", "Canon's save/discard pattern is the reference for unsaved edits. Coalesce owns dirty tracking and saving.", [direct("form-layout", "form")]);
      if (story === "pageautosave") return pattern("form-layout", "form", "Canon's form is the reference. Coalesce's automatic saving and persistence status have no exact Canon editor equivalent.");
      if (story === "page" || story === "pagecreate") return pattern("form-layout", "form", "Canon's form and page header are the related patterns. Coalesce generates its admin editor and routing from model metadata.", [direct("page-header", "record")]);
      return pattern("form-layout", "form", "Canon's form layout and labelled controls are the visual reference. Coalesce generates the editor from metadata rather than providing a matching Canon component.");
    case "Coalesce/Admin/c-admin-methods":
      if (story === "errorresult") return pattern("alert", "alert", "Canon's alert is the related failure-message pattern. Coalesce renders the failed API method result in its method form.");
      if (story === "voidresult") return pattern("alert", "alert", "Canon's success-message pattern is the reference. Coalesce executes an API method and reports completion without a result value.");
      if (story === "modelresult" || story === "objectresult") return pattern("form-layout", "form", "Canon's form is the related parameter-entry pattern. Coalesce executes a method and renders a returned object; Canon has no metadata-driven method runner.", [direct("description-list", "description-list")]);
      if (story === "fileresult") return { match: "none", note: "Canon has no API method runner or returned-file preview. This Coalesce story combines a method action with browser file handling." };
      if (story === "dateparams") return pattern("date", "placeholder", "Canon's date input is the parameter-field reference. Coalesce supplies execution and result handling.", [direct("form-layout", "form")]);
      return pattern("form-layout", "form", "Canon's labelled form is the related parameter-entry pattern. Coalesce's method discovery, Execute action, and API results have no direct equivalent.");
    case "Vuetify/Surfaces/VSnackbar":
      if (story === "queue") return pattern("toast", "show", "Canon's live toast examples are the related notification pattern. Vuetify's queue manages messages differently; use each side's trigger to inspect it.");
      return direct("toast", "toast", "Compare Canon's toast anatomy and intents. Vuetify's multi-line and title props are different APIs; the timer example appears below.", [direct("toast", "timer")]);
    case "Vuetify/Surfaces/Feedback":
      if (story === "emptystate") return direct("empty-state", "no-results", "Canon's no-results state is the reference; the 404 illustration on the left is a separate Vuetify configuration.", [direct("empty-state", "empty-state")]);
      if (story === "skeletonloader") return direct("skeleton", "skeleton", "Canon's original skeleton shapes and sweep are the reference. Vuetify exposes additional named skeleton types.", [direct("skeleton", "sweep")]);
      if (story === "progresscircular") return pattern("spinner", "spinner", "Canon's spinner matches indeterminate waiting. Its checked-in references do not include Vuetify's determinate circular progress, value label, or stroke-width variants.", [direct("spinner", "sizes")]);
      if (story === "progresslinear") return { match: "none", note: "The checked-in Canon reference has no linear progress/meter example. Vuetify's buffer, stream, striped, height, and determinate variants have no original example to show here." };
      if (story === "progress") return pattern("spinner", "words", "Canon's labelled spinner is the related waiting pattern. The checked-in reference has no direct equivalent for Vuetify's labelled determinate linear/circular VProgress.");
      return undefined;
    case "c-style/Time":
      if (story === "step") return direct("time", "step");
      if (story === "clock") return direct("time", "clock");
      if (story === "range") return direct("time", "range", "Canon's original range is the reference. c-style additionally exposes overnight validation.");
      if (story === "sizes") return direct("time", "size");
      if (story === "states") return direct("time", "states", "Canon's disabled, read-only, and invalid controls. c-style's allowed-hours/minutes rules are additional behavior.");
      if (story === "active") return direct("time", "time", "Focus a segment on the right to inspect Canon's active state beside the focused minute on the left.");
      if (story === "form") return pattern("time", "time", "Canon's time control is the original reference. Vuetify VForm validation and disabled-state propagation are c-style integration behavior.", [direct("form-layout", "form")]);
      if (story === "bare") return direct("time", "time", "Canon's bare control is the reference. c-style adds Vue model binding and explicit RTL examples.", [direct("time", "range")]);
      return direct("time", "time");
    case "c-style/Option tiles (app example)":
      if (story === "states") return pattern("radio", "states", "Canon's radio states are the related single-choice behavior. These selectable pricing/region tiles are an app example, not an original Canon component.");
      return pattern("radio", "group", "Canon's radio group is the related single-choice pattern. The app's pricing cards, tile layout, and intent colors have no direct Canon option-tile equivalent.");
    default:
      return undefined;
  }
};
