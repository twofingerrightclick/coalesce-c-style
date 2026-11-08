import type { CanonReferenceResolver } from "./types";

/** Original Canon examples for 19 button, choice, and surface components. */
export const buttonsSurfacesReferences: CanonReferenceResolver = (title, storyName) => {
  const story = storyName.replace(/[^a-z0-9]/gi, "").toLowerCase();
  switch (title) {
    case "Vuetify/Buttons/VBtn":
      if (story === "states") return {
        page: "button", section: "states", match: "direct",
        note: "Canon's disabled and busy buttons. Emphasis corresponds to Vuetify flat, tonal, outlined, and text; elevated and plain have no separate Canon recipe.",
      };
      if (story === "sizes") return {
        page: "button", section: "size", match: "direct",
        note: "Canon supplies small, medium, and large sizes. Vuetify also exposes x-small, x-large, and density options.",
      };
      if (story === "iconsandshape") return {
        page: "button", section: "display", match: "direct",
        note: "Original icon, label, and icon-only displays. Vuetify's rounded, stacked, and block props extend beyond these Canon displays.",
      };
      return {
        page: "button", section: "emphasis-intent", match: "direct",
        note: "Canon high / medium / low / minimal correspond to Vuetify flat / tonal / outlined / text. Canon calls the error intent danger; elevated and plain have no separate equivalent.",
      };
    case "Vuetify/Buttons/VBtnGroup":
      return {
        page: "button-group", section: "group", match: "direct",
        additional: [{ page: "button-group", section: "icon" }, { page: "button-group", section: "states" }, { page: "button-group", section: "size" }],
        note: "Original grouped actions, icon groups, sizes, and states. Canon's group recipe is the visual reference; Vuetify exposes additional variant and density props.",
      };
    case "Vuetify/Buttons/VBtnToggle":
      return {
        page: "segmented-control", section: "segmented-control", match: "direct",
        additional: [{ page: "segmented-control", section: "icons" }, { page: "segmented-control", section: "disabled" }],
        note: "Canon's segmented control is single-choice. Vuetify's multiple-selection formatting example extends beyond that behavior; Canon toggle chips are another related pattern.",
      };
    case "Vuetify/Buttons/VIconBtn":
      return {
        page: "button", section: "display", match: "direct",
        note: "Canon uses the same Button component with icon-only display. Its original icon-only examples are the reference for VIconBtn; not every Vuetify variant has a Canon counterpart.",
      };
    case "Vuetify/Buttons/VFab":
      return story === "speeddial" ? {
        page: "button", section: "display", match: "pattern",
        note: "Canon has no speed-dial component. Its icon-only buttons show the related action styling; the expanding action arrangement belongs to Vuetify.",
      } : {
        page: "button", section: "display", match: "pattern",
        note: "Canon has no floating action button. These original icon and icon-with-label buttons are the closest action pattern; placement and FAB behavior belong to Vuetify.",
      };
    case "Vuetify/Choices/VCheckbox":
      if (story === "sizes") return {
        page: "checkbox", section: "size", match: "direct",
        note: "Canon small / medium / large sizes compared with Vuetify density options; size and density are different controls.",
      };
      return {
        page: "checkbox", section: "states", match: "direct",
        additional: story === "checkboxbtn" ? undefined : [{ page: "checkbox", section: "hint-message" }],
        note: story === "colored"
          ? "Canon's original checkbox states, hints, and messages use neutral selection. The primary-colored choices on the left are a Vuetify option."
          : story === "checkboxbtn"
            ? "VCheckboxBtn supplies the checkbox without the field wrapper. Canon's original choice examples include labels to make each native state identifiable."
            : "Original unchecked, checked, mixed, disabled, hint, and validation examples. Canon has no native readonly checkbox state.",
      };
    case "Vuetify/Choices/VRadio":
      return {
        page: "radio", section: "group", match: "direct",
        additional: [{ page: "radio", section: "states" }, { page: "radio", section: "orientation" }],
        note: "Original radio groups, selected and disabled states, validation, and orientations. Canon keeps selection neutral; Vuetify also accepts a primary color.",
      };
    case "Vuetify/Choices/VSelectionControl":
      return {
        page: "checkbox", section: "group", match: "pattern",
        note: "VSelectionControl is Vuetify's generic primitive. This story configures it as checkboxes, so Canon's original independent-choice group is the relevant pattern.",
      };
    case "Vuetify/Choices/VSwitch":
      return {
        page: "switch", section: "states", match: "direct",
        additional: [{ page: "switch", section: "state-text" }],
        note: "Original off, on, disabled, and message examples. Canon's switch has no separate inset, flat, loading, or indeterminate variants; those remain Vuetify-specific.",
      };
    case "Vuetify/Surfaces/VCard":
      if (story === "anatomy") return {
        page: "card", section: "card", match: "direct",
        additional: [{ page: "card", section: "footer" }, { page: "card", section: "sections" }],
        note: "Original card headers, descriptions, body, footer actions, and sections. Vuetify's loading strip has no equivalent in the card recipe.",
      };
      if (story === "toolbarheader") return {
        page: "card", section: "sections", match: "pattern",
        note: "Canon's original sectioned card illustrates shared insets and dividing rules. The embedded VToolbar and custom padding token are c-style compositions.",
      };
      if (story === "elevation") return {
        page: "card", section: "card", match: "pattern",
        note: "Canon defines one card surface and shadow recipe, shown here. Vuetify's elevation 0–5 scale has no corresponding Canon scale.",
      };
      return {
        page: "card", section: "link", match: "pattern",
        note: "Original linked cards show Canon's interactive card pattern. Canon does not define the full Vuetify variant, color, or elevation matrix.",
      };
    case "Vuetify/Surfaces/VAlert":
      return {
        page: "alert", section: story === "types" ? "alert" : "emphasis", match: "direct",
        note: story === "types"
          ? "Original Canon alert intents. Canon danger maps to Vuetify error; neutral alerts and custom icons can be compared as related configurations."
          : "Canon's original emphasis examples are the reference; Vuetify's elevated, text, plain, density, and prominent options are not individual Canon variants.",
      };
    case "Vuetify/Surfaces/VBanner":
      return {
        page: "banner", section: "banner", match: "direct",
        additional: story === "titleanddescription" ? undefined : [{ page: "banner", section: "intents" }, { page: "banner", section: "emphasis" }, { page: "banner", section: "stacked" }],
        note: story === "titleanddescription"
          ? "Original Canon banner anatomy provides the title, description, icon, and action reference. The left composes title and description through Vuetify's text slot."
          : "Original banners include intents, emphasis, and stacked actions. Canon does not expose Vuetify's lines prop.",
      };
    case "Vuetify/Surfaces/VExpansionPanels":
      return {
        page: "accordion", section: "accordion", match: "direct",
        additional: [{ page: "accordion", section: "one-at-a-time" }, { page: "accordion", section: "parts" }],
        note: "Canon's original accordion covers open, closed, disabled, and one-at-a-time disclosure. Vuetify's inset and popout arrangements are additional variants.",
      };
    case "Vuetify/Surfaces/VSheet":
      return story === "divider" ? {
        page: "separator", section: "line", match: "direct",
        additional: [{ page: "separator", section: "vertical" }, { page: "separator", section: "words" }],
        note: "Original horizontal, vertical, and labeled separators. Vuetify additionally exposes thickness, opacity, color, and inset props.",
      } : {
        page: "card", section: "card", match: "pattern",
        note: "Canon has no generic VSheet equivalent. Its card surface is a related reference for framing, radius, and depth; arbitrary colored sheets are Vuetify-specific.",
      };
    default:
      return undefined;
  }
};
