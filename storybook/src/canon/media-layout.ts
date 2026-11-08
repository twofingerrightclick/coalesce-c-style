import type { CanonReferenceResolver } from "./types";

/** 16 components: nine media/behavior components and seven layout/providers. */
export const mediaLayoutReferences: CanonReferenceResolver = (title, storyName) => {
  const story = storyName.replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (title === "Vuetify/Media/Images and motion") {
    switch (story) {
      case "img":
        return { match: "none", note: "Canon has no standalone image component or reference for cover, contain, aspect ratio, gradients, or image overlays. These are Vuetify image features." };
      case "carousel":
        return { match: "none", note: "Canon has no carousel reference. Slide navigation, image fitting, and carousel indicators remain Vuetify behavior." };
      case "parallax":
        return { match: "none", note: "Canon has no parallax component or scrolling-media reference." };
      case "responsive":
        return { match: "none", note: "VResponsive is Vuetify's aspect-ratio layout utility. Canon has no equivalent component or standalone example." };
      case "sparkline":
        return { match: "none", note: "Canon has no sparkline or chart reference. The line, bar, and filled charts on the left use Vuetify's visualization API." };
      case "hoverlazynossr":
        return {
          page: "card", section: "card", match: "pattern",
          note: "Canon has no equivalents for VHover, VLazy, VNoSsr, or VPullToRefresh. Its original card is shown only as the visual reference for the cards hosted by these behavior utilities; rendering and refresh behavior are not comparable.",
          additional: [{ page: "tag", section: "content", match: "pattern", note: "The client-only chip uses Canon's tag as its visual reference. Canon does not provide the client-only rendering utility around it." }],
        };
    }
    return undefined;
  }
  if (title === "Vuetify/Layout/Grid and providers") {
    switch (story) {
      case "grid":
        return {
          page: "stack", section: "grid", match: "pattern",
          note: "Canon's grid is the related layout pattern for VContainer, VRow, and VCol. Canon uses CSS layout classes rather than Vuetify's twelve-column, breakpoint, dense-row, and gutter props. VSpacer has no standalone Canon component.",
          additional: [{ page: "stack", section: "cluster", match: "pattern", note: "Canon's wrapping cluster is the related pattern for aligned groups; it does not reproduce Vuetify's row and spacer API." }],
        };
      case "themeprovider":
        return { match: "none", note: "VThemeProvider scopes Vuetify theme configuration to a subtree. Canon supports color-scheme styling, but has no provider component or matching example of these light/dark islands. The Canon reference panels elsewhere follow Storybook's theme toolbar." };
      case "defaultsprovider":
        return { match: "none", note: "VDefaultsProvider supplies Vue component defaults to descendants. Canon uses HTML and CSS classes, so it has no corresponding runtime provider. The outlined button and underlined field defaults shown here are Vuetify configuration." };
      case "localeprovider":
        return {
          page: "text-input", section: "edge-cases", match: "pattern",
          note: "Canon's original right-to-left input example is the visual reference. Canon uses native dir and lang attributes; it has no VLocaleProvider equivalent.",
          additional: [{ page: "button", section: "edge-cases", match: "pattern", note: "Canon's original button edge cases include a right-to-left icon and label example, corresponding to the button inside the locale provider." }],
        };
    }
  }
  return undefined;
};
