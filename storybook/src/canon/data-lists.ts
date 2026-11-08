import type { CanonReferenceResolver } from "./types";

/** Original examples for 17 data components and VList (18 components total). */
export const dataListReferences: CanonReferenceResolver = (title, storyName) => {
  const story = storyName.toLowerCase().replace(/[^a-z0-9]/g, "");

  switch (title) {
    case "Vuetify/Data/VBadge and VAvatar":
      if (story === "badge") return {
        page: "avatar", section: "badge-count", match: "pattern",
        note: "Canon's avatar badge/count is the closest original badge pattern. Vuetify can attach badges to arbitrary content, including buttons and icons; Canon does not provide that general wrapper.",
        additional: [{ page: "status", section: "dot", match: "pattern", note: "The original status dot relates to the dot badge; it is not an attached badge API." }],
      };
      if (story === "avatar") return {
        page: "avatar", section: "types", match: "direct",
        note: "Original avatar types and sizes. Vuetify's tonal/outlined variants and square shapes do not have separate Canon counterparts.",
        additional: [{ page: "avatar-group", section: "content", match: "direct", note: "Original avatar group for the grouped row on the left." }],
      };
      return undefined;

    case "Vuetify/Data/VChip":
      if (story === "variantsbycolor") return {
        page: "tag", section: "intent", match: "direct",
        note: "Canon Tags are the visual counterpart of display chips. Canon has its own emphasis and intent choices rather than Vuetify's full variant/color matrix.",
        additional: [{ page: "tag", section: "emphasis", match: "direct" }],
      };
      if (story === "features") return {
        page: "tag", section: "content", match: "direct",
        note: "Original tags with icons, dismissal and avatars. Canon's size/emphasis grid is included below; Vuetify density and label-shape props have no separate Canon modes.",
        additional: [{ page: "tag", section: "emphasis", match: "direct" }],
      };
      if (story === "chipgroup") return {
        page: "toggle-chip", section: "toggle-chip", match: "pattern",
        note: "Canon Toggle Chip is the related selectable-chip pattern; it does not expose Vuetify's group model or column prop.",
        additional: [{ page: "toggle-chip", section: "one", match: "pattern", note: "Original single-choice chips correspond to the mandatory group." }],
      };
      return undefined;

    case "Vuetify/Data/VDataIterator":
      if (story === "cards") return {
        page: "card", section: "link", match: "pattern",
        note: "Canon supplies the card/list presentation, not a data iterator, slot renderer or client-side paging engine. Original pagination is shown below as the related footer pattern.",
        additional: [{ page: "pagination", section: "compact", match: "pattern" }],
      };
      return undefined;

    case "Vuetify/Data/VDataTable":
      if (story === "default") return { page: "data-table", section: "data-table", match: "direct" };
      if (story === "selectsortgroup") return {
        page: "data-table", section: "bulk", match: "direct",
        note: "Canon's selectable rows and sorting are comparable. Its examples do not provide Vuetify's grouped-row API.",
        additional: [{ page: "data-table", section: "sorting", match: "direct" }],
      };
      if (story === "states") return {
        page: "data-table", section: "states", match: "direct",
        note: "Original loading, empty, no-results and error states. Canon table size/density and hover treatments use different options from Vuetify.",
        additional: [{ page: "data-table", section: "options", match: "direct" }],
      };
      if (story === "server") return {
        page: "data-table", section: "data-table", match: "pattern",
        note: "The visible data-table pattern matches; remote fetching and Vuetify's server-side options events have no Canon component counterpart.",
      };
      if (story === "virtual") return {
        page: "data-table", section: "sticky", match: "pattern",
        note: "Canon's long-table example is the closest visual reference. A sticky header does not virtualize rows; Canon has no VDataTableVirtual equivalent.",
      };
      return undefined;

    case "Vuetify/Data/VPagination":
      if (story === "pagination") return {
        page: "pagination", section: "pagination", match: "direct",
        note: "Original page navigation. Canon's compact and end-control examples are included below; Vuetify's variant, rounded and density props are not separate Canon modes.",
        additional: [
          { page: "pagination", section: "compact", match: "direct" },
          { page: "pagination", section: "words", match: "direct" },
        ],
      };
      return undefined;

    case "Vuetify/Data/VTable":
      if (story === "densities") return {
        page: "table", section: "density", match: "direct",
        note: "Original Canon table density examples; their names and measurements need not match Vuetify density values.",
      };
      if (story === "options") return {
        page: "table", section: "options", match: "direct",
        note: "Original hover, stripe and frame options. The long data-table example below provides the related sticky-header pattern.",
        additional: [{ page: "data-table", section: "sticky", match: "pattern" }],
      };
      if (story === "semantics") return { page: "table", section: "caption", match: "direct" };
      return undefined;

    case "Vuetify/Data/More":
      if (story === "code") return {
        page: "code-block", section: "without-header", match: "pattern",
        note: "Canon Code Block is the related block-code presentation. Vuetify's VCode also supports an inline code wrapper; the APIs and example content differ.",
      };
      if (story === "highlight") return {
        match: "none", note: "The checked-in Canon catalog has no equivalent to VHighlight's query-based inline text highlighting.",
      };
      if (story === "virtualscroll") return {
        page: "nav-list", section: "nav-list", match: "pattern",
        note: "Original Canon list rows are shown as a visual reference only. Canon does not supply Vuetify's virtual scrolling engine or two-line person-row component.",
      };
      if (story === "infinitescroll") return {
        page: "pagination", section: "load-more", match: "pattern",
        note: "Canon's explicit load-more control is a related progressive-loading pattern. It does not automatically fetch on scroll like VInfiniteScroll.",
      };
      if (story === "treeview") return {
        match: "none", note: "The checked-in Canon reference has no tree-view example or equivalent to Vuetify's hierarchical selection and expansion component.",
      };
      if (story === "timeline") return {
        match: "none", note: "The checked-in Canon reference has no timeline example or equivalent to Vuetify's vertical/horizontal event timeline.",
      };
      return undefined;

    case "Vuetify/Lists/VList":
      if (story === "items") return {
        page: "nav-list", section: "nav-list", match: "pattern",
        note: "Canon Nav List is the closest original list-row pattern. Vuetify's two/three-line content lists and avatar slots have no direct Canon list equivalent.",
        additional: [{ page: "nav-list", section: "actions", match: "pattern" }],
      };
      if (story === "states") return {
        page: "nav-list", section: "actions", match: "pattern",
        note: "Original current, unavailable and action rows. Canon's navigation list does not implement Vuetify's general selected-list model or density props.",
        additional: [{ page: "nav-list", section: "size", match: "pattern" }],
      };
      if (story === "groups") return {
        page: "nav-list", section: "sections", match: "pattern",
        note: "Original navigation sections are the closest grouping pattern. Canon's static headings do not behave like expandable VListGroup rows.",
      };
      return undefined;
  }
  return undefined;
};
