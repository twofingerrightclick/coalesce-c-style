import type { CanonReferenceResolver } from "./types";

// Display already-open examples in the reference column. These adjustments
// change layout only; Canon's visual styles remain untouched.
const staticDialog = ".canon-dialog{display:block;position:static;inset:auto;margin:16px 0;max-inline-size:100%;translate:none;scale:none;transition:none;animation:none}";
const staticMenu = ".canon-menu[popover]{display:block;position:static;inset:auto;margin:16px 0;translate:none;scale:none;transition:none;animation:none}";
const staticTooltip = ".canon-tooltip[popover]{display:block;position:relative;inset:auto;margin:0;translate:none;scale:none;transition:none;animation:none}.ref-tip-cell{min-block-size:80px}";

/** Original references for nineteen tagged overlay and picker components. */
export const overlaysPickersReferences: CanonReferenceResolver = (title, storyName) => {
  const story = storyName.toLowerCase().replace(/[^a-z0-9]/g, "");
  switch (title) {
    case "Vuetify/Overlays/VDialog":
      switch (story) {
        case "open": return {
          page: "dialog", section: "alert", match: "direct", css: staticDialog,
          note: "Canon's original destructive alert dialog, displayed in flow for comparison. The original uses an event example; the left uses a person record.",
        };
        case "form": return {
          page: "dialog", section: "dialog", match: "direct", css: staticDialog,
          note: "Canon's original edit-event form dialog, displayed in flow. Vuetify's person form uses different fields and scrollable behavior.",
        };
        case "overlay": return {
          page: "spinner", section: "in-context", match: "pattern",
          note: "Canon's in-context busy indicator is the related loading pattern. Canon has no standalone equivalent of Vuetify's contained scrim/overlay component.",
        };
        case "bottomsheet": return {
          page: "drawer", section: "drawer", match: "pattern",
          note: "Canon's modal drawer is the closest sheet pattern. It opens from the side; Canon has no bottom-sheet equivalent. Use its original trigger to open the drawer.",
        };
      }
      return undefined;
    case "Vuetify/Overlays/VKbd": return {
      page: "kbd", section: "content", match: "direct",
      note: "Canon's original keycaps and combinations. VHotkey formats combinations programmatically; Canon expresses them with keycap markup.",
      additional: [{ page: "kbd", section: "context", match: "direct" }],
    };
    case "Vuetify/Overlays/VMenu":
      if (story === "open") return {
        page: "menu", section: "anatomy", match: "direct", css: staticMenu,
        note: "Canon's original menu anatomy, displayed in flow to show headings, icons, shortcuts, disabled rows, and separators. The example actions differ.",
      };
      return {
        page: "menu", section: "menu", match: "direct",
        note: "Open Canon's Options trigger to compare the original menu. Canon uses native popover activation; Vuetify additionally provides hover and location props.",
      };
    case "Vuetify/Overlays/VTooltip":
      if (story === "locations") return {
        page: "tooltip", section: "placement-size", match: "direct", css: staticTooltip,
        note: "Canon's original tooltip sizes and placement labels, displayed in their example cells. These static previews compare surfaces rather than live anchor positioning.",
      };
      return {
        page: "tooltip", section: "triggers", match: "direct",
        note: "Hover or focus the original Canon controls to inspect their tooltips. Canon supports pointer and keyboard triggers.",
      };
    case "Vuetify/Pickers/Sliders, color, rating":
      switch (story) {
        case "slider": return {
          page: "slider", section: "basics", match: "direct",
          note: "Canon's single-value and range sliders are the original references. Marks, unavailable states, and vertical orientation are shown below. Vuetify's always-visible thumb labels are an additional API.",
          additional: [
            { page: "slider", section: "marks", match: "direct" },
            { page: "slider", section: "states", match: "direct" },
            { page: "slider", section: "vertical", match: "direct" },
            { page: "range-slider", section: "basics", match: "direct" },
          ],
        };
        case "colorpicker": return {
          page: "color-picker", section: "inline", match: "direct",
          note: "Canon's original inline picker and swatch palette. Vuetify exposes different color-mode and canvas controls.",
          additional: [{ page: "color-picker", section: "swatches", match: "direct" }],
        };
        case "rating": return { match: "none", note: "The checked-in Canon reference has no rating component or star-rating example. Vuetify's half increments, hover preview, and disabled states remain available on the left." };
      }
      return undefined;
    case "Vuetify/Pickers/Files and editing":
      switch (story) {
        case "fileupload": return { match: "none", note: "Canon has no file-upload/drop-zone component in its checked-in reference. There is no original equivalent for Vuetify's drop target, file list, or multiple-file upload state." };
        case "confirmedit": return {
          page: "card", section: "footer", match: "pattern",
          note: "Canon's editable card with Cancel/Save footer is the related composition. It does not provide VConfirmEdit's staged model and reset/save wrapper behavior.",
        };
        case "formvalidation": return {
          page: "form-layout", section: "form", match: "pattern",
          note: "Canon's form composition and field validation messages are the visual reference. VForm/VValidation's rule execution, validation state, and validate() API have no Canon component equivalent.",
          additional: [{ page: "field", section: "hint-message", match: "direct" }],
        };
      }
      return undefined;
    case "Vuetify/Pickers/Date and time":
      switch (story) {
        case "datepicker": return {
          page: "date", section: "inline", match: "direct",
          note: "Canon's inline calendars, ranges, month/year navigation, and unavailable dates. The original dates differ; Vuetify also exposes multiple non-contiguous dates and picker-header props.",
          additional: [
            { page: "date", section: "range", match: "direct" },
            { page: "date", section: "header", match: "direct" },
            { page: "date", section: "unavailable", match: "direct" },
          ],
        };
        case "timepicker": return {
          page: "time", section: "clock", match: "pattern",
          note: "Canon uses segmented time entry rather than Vuetify's clock-face picker. Its original 12/24-hour and seconds examples are related input patterns, not a matching clock dial.",
          additional: [{ page: "time", section: "step", match: "pattern" }],
        };
        case "calendar": return {
          page: "date", section: "week", match: "pattern",
          note: "Canon's week-selection calendar is related date navigation. Canon has no event-scheduling calendar with Vuetify's event blocks, month/week views, or timed appointments.",
          additional: [{ page: "date", section: "inline", match: "pattern" }],
        };
        case "picker": return {
          page: "card", section: "footer", match: "pattern",
          note: "Canon's framed card with a footer is the closest composition. Canon has no content-agnostic VPicker with title, header, and actions slots.",
        };
      }
      return undefined;
    default: return undefined;
  }
};
