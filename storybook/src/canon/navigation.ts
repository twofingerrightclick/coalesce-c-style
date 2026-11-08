import type { CanonReferenceResolver } from "./types";

/** Original navigation references for 18 tagged Vuetify components. */
export const navigationReferences: CanonReferenceResolver = (title, storyName) => {
  const story = storyName.toLowerCase().replace(/[^a-z0-9]/g, "");
  switch (title) {
    case "Vuetify/Navigation/App shell":
      switch (story) {
        case "shell":
          return {
            page: "app-shell", section: "app-shell", match: "pattern",
            note: "Canon's original app shell combines the top bar, sidebar and main content. Vuetify's VApp, VMain and VLayout provide the surrounding framework; its system bar and footer have no dedicated Canon equivalents.",
          };
        case "appbar":
          return {
            page: "top-bar", section: "top-bar", match: "direct",
            note: "Canon's top bar is the visual reference. Vuetify's prominent/comfortable/compact densities and explicit color variants are additional API options.",
          };
        case "navigationdrawer":
          return {
            page: "sidebar", section: "sidebar", match: "direct",
            note: "Canon's sidebar is the persistent navigation reference; its rail example appears below. Vuetify's temporary contained drawer also includes overlay behavior.",
            additional: [{ page: "sidebar", section: "rail", match: "direct", note: "Canon's original collapsed rail." }],
          };
        case "contentdrawer":
          return {
            page: "drawer", section: "drawer", match: "direct",
            note: "Use each side's button to open the details panel. Canon uses a dialog-based drawer; Vuetify uses a temporary end navigation drawer.",
          };
      }
      return undefined;

    case "Vuetify/Navigation/More":
      switch (story) {
        case "breadcrumbs":
          return {
            page: "breadcrumb", section: "breadcrumb", match: "direct",
            note: "Canon's original breadcrumb uses its own labels and separators. The home and collapsed-path examples below provide the related icon pattern; Vuetify also exposes a custom divider and density prop.",
            additional: [{ page: "breadcrumb", section: "home", match: "direct" }],
          };
        case "bottomnavigation":
          return {
            page: "tabs", section: "icons", match: "pattern",
            note: "Canon has no dedicated bottom-navigation component. Its icon tabs are a related destination-selection pattern; they do not reproduce Vuetify's fixed bottom placement or icon-over-label layout.",
          };
        case "stepper":
          return {
            match: "none",
            note: "Canon has no stepper equivalent. The horizontal and vertical flows, completed steps, and next/back actions remain Vuetify components styled with c-style's shared tokens.",
          };
        case "slideanditemgroup":
          return {
            page: "segmented-control", section: "segmented-control", match: "pattern",
            note: "Canon's segmented control is a related single-selection group. Canon has no generic VSlideGroup, VItemGroup or VItem equivalent for scrolling arbitrary items or selecting custom cards.",
          };
      }
      return undefined;

    case "Vuetify/Navigation/VTabs":
      if (story !== "tabs") return undefined;
      return {
        page: "tabs", section: "tabs", match: "direct",
        note: "Canon's original tabs include their associated panels, the counterpart to Vuetify's VTabs/VTab and VWindow composition. Additional examples show equal-width tabs, icons/counts, and Canon's sizes. Vuetify's vertical direction and density API have no direct Canon counterparts.",
        additional: [
          { page: "tabs", section: "fill", match: "direct" },
          { page: "tabs", section: "icons", match: "direct" },
          { page: "tabs", section: "sizes", match: "direct" },
        ],
      };

    case "Vuetify/Navigation/VToolbar":
      if (story !== "toolbars") return undefined;
      return {
        page: "toolbar", section: "toolbar", match: "direct",
        note: "Canon's original toolbar shows grouped actions and selects; its small/medium/large examples follow. Vuetify's density, extension, elevation, floating and color props are not separate Canon toolbar variants.",
        additional: [{ page: "toolbar", section: "size", match: "direct" }],
      };
  }
  return undefined;
};
