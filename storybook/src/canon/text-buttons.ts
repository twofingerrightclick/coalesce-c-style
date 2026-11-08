import type { CanonReferenceResolver } from "./types";

/**
 * Text-entry references cover 18 public Vuetify components, including the
 * five field parts and four OTP parts. The original Canon examples remain
 * unchanged; notes explain differences in the component APIs.
 */
export const textEntryReferences: CanonReferenceResolver = (title, storyName) => {
  if (!title.startsWith("Vuetify/Text entry/")) return undefined;

  const component = title.slice("Vuetify/Text entry/".length);
  const story = storyName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const variantsNote = "Canon has one field appearance; Vuetify's filled, solo, underlined and plain variants have no separate Canon equivalents.";
  const sizesNote = "Canon shows small, medium and large sizes. Vuetify's density settings are a different API, so these rows are visual references rather than matching density values.";

  switch (component) {
    case "Field parts":
      switch (story) {
        case "vfield":
          return { page: "text-input", section: "states", match: "pattern", note: `Canon's text-input frame is the related pattern for VField's custom content. ${variantsNote}` };
        case "vlabel":
          return { page: "label", section: "parts", match: "direct" };
        case "vmessages":
          return { page: "field", section: "hint-message", match: "direct", note: "Canon places hint and validation messages inside its field composition." };
        case "vcounter":
          return { page: "field", section: "counter", match: "direct" };
        case "vinput":
          return { page: "field", section: "anatomy", match: "pattern", note: "Canon Field composes a label, control and messages; it does not expose Vuetify's VInput wrapper API." };
      }
      return undefined;

    case "VTextField":
      if (story === "states") return { page: "text-input", section: "states", match: "direct" };
      if (story === "sizes") return { page: "text-input", section: "size", match: "direct", note: sizesNote };
      if (story === "adornments") return { page: "text-input", section: "anatomy", match: "direct", note: "Canon's original box anatomy shows icons, prefixes and suffixes. Password and native input types are separate Canon patterns." };
      return { page: "text-input", section: "size", match: "direct", note: variantsNote };

    case "VTextarea":
      if (story === "states") return { page: "textarea", section: "states", match: "direct" };
      if (story === "sizes") return { page: "textarea", section: "size", match: "direct", note: sizesNote };
      return { page: "textarea", section: "height", match: "direct", note: variantsNote };

    case "VNumberInput":
      if (story === "states") return { page: "number-input", section: "states", match: "direct" };
      if (story === "sizes") return { page: "number-input", section: "size", match: "direct", note: sizesNote };
      return { page: "number-input", section: "end", match: "direct", note: `Canon's end controls stack the chevrons; Vuetify's default controls place them side by side. ${variantsNote}` };

    case "VSelect":
      if (story === "open") return { page: "select", section: "options", match: "direct", note: "Canon uses a native select; open its control to inspect its options. Vuetify renders a custom menu." };
      if (story === "multiple") return { page: "combobox", section: "multiple", match: "pattern", note: "Canon's multiple-value combobox is the closest tag-selection pattern. Its native select does not provide Vuetify's chips and item-subtitle options." };
      if (story === "states") return { page: "select", section: "box", match: "direct" };
      return { page: "select", section: "size", match: "direct", note: story === "sizes" ? sizesNote : variantsNote };

    case "VAutocomplete":
      if (story === "open") return { page: "combobox", section: "search", match: "direct", note: "Open the Canon combobox to compare its search and results with Vuetify's menu." };
      if (story === "wrappedchips") return { page: "combobox", section: "multiple", match: "direct", note: "Canon's original multiple-value examples show the chip treatment; selected values and wrapping widths differ from the Vuetify fixture." };
      if (story === "states") return { page: "combobox", section: "box", match: "direct" };
      if (story === "sizes") return { page: "combobox", section: "size", match: "direct", note: sizesNote };
      return { page: "combobox", section: "multiple", match: "direct", note: variantsNote };

    case "VCombobox":
      if (story === "states") return { page: "combobox", section: "box", match: "direct" };
      if (story === "sizes") return { page: "combobox", section: "size", match: "direct", note: sizesNote };
      return { page: "combobox", section: "free", match: "direct", note: variantsNote };

    case "VDateInput":
      if (story === "states") return { page: "date", section: "states", match: "direct" };
      return { page: "date", section: "size", match: "direct", note: story === "sizes" ? sizesNote : variantsNote };

    case "VColorInput":
      if (story === "states") return { page: "color-picker", section: "states", match: "direct" };
      return { page: "color-picker", section: "size", match: "direct", note: story === "sizes" ? sizesNote : variantsNote };

    case "VFileInput":
      return { match: "none", note: "Canon has no file-input or upload component. Vuetify's file picker, multiple-file chips and file-selection states have no original Canon example." };

    case "VOtpInput":
      return { page: "input-otp", section: "states", match: "direct", note: "Canon's OTP control includes its own field and grouping structure. Vuetify's additional visual variants and loading state do not have separate Canon equivalents." };
  }

  return undefined;
};
