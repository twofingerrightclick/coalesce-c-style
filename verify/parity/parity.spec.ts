import { writeFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { compareParity, type ParityDiff } from "../lib/measure";
import { fetchStories } from "../lib/storybook";

// Regression gate (plan §6): every `data-parity` pair in the Parity stories
// matches Canon, light and dark, except the diffs `expected` names. Each is
// structural (the two sides put the same look on different boxes) or a
// documented deviation (packages/c-style/docs/canon-differences.md).
// PARITY_DUMP=<file> writes the unexpected diffs there instead of failing,
// for re-baselining after a deliberate change.

type Match = (d: ParityDiff, siblings: ParityDiff[]) => boolean;

const matchId = (id: string, pattern: string) => (pattern.endsWith("*") ? id.startsWith(pattern.slice(0, -1)) : id == pattern);
const on =
  (ids: string[], props: string[]): Match =>
  (d) =>
    props.includes(d.prop) && ids.some((p) => matchId(d.id, p));
const invisible = (v: string | null) => v == null || v == "none" || /^rgba\(0, 0, 0, 0\)$/.test(v);
const text = ["font-size", "line-height", "letter-spacing", "font-weight", "color"];

const expected: { why: string; match: Match }[] = [
  {
    why: "Padding sits on different boxes: Vuetify pads inner parts (field input, item content, card item), Canon the root.",
    match: (d) => d.prop.startsWith("padding-"),
  },
  {
    why: "Vuetify paints fills and tints on an underlay or overlay child; the root stays transparent.",
    match: (d) => d.prop == "background-color" && d.vuetify == "rgba(0, 0, 0, 0)",
  },
  {
    why: "Widths follow content and layout (labels, columns, frame width); heights are the gate.",
    match: (d) => d.prop == "inline-size",
  },
  {
    why: "A border that neither side shows: Canon keeps a 1px transparent frame for forced colours, Vuetify none (or the reverse).",
    match: (d, all) =>
      ["border-top-width", "border-top-color"].includes(d.prop) &&
      all.some((s) => s.id == d.id && s.prop == "border-top-color" && invisible(s.vuetify) && invisible(s.canon)),
  },
  {
    why: "Container pairs: the text sits on children with their own type and colour (labels, titles, list item titles, cells).",
    match: on(
      ["group", "seg", "cb-*", "radio-*", "sw-*", "field-*", "table", "data-table", "pagination", "nav", "nav-current", "nav-item", "dialog", "dialog-footer", "menu", "menu-item", "menu-disabled", "card", "toast-*", "alert-*", "tabs", "btn-icon-only"],
      text,
    ),
  },
  {
    why: "Canon tags colour and set the label child; the box is a fixed 24px either way.",
    match: on(["tag-*"], ["line-height", "letter-spacing", "color"]),
  },
  {
    why: "Canon cuts the avatar circle with a mask (the face has no radius); Vuetify rounds the avatar 50%.",
    match: on(["avatar-*"], ["border-radius"]),
  },
  {
    why: "Container heights within Canon's 1px transparent frame top and bottom (plus hairline rounding).",
    match: (d) =>
      d.prop == "block-size" &&
      ["dialog", "card", "table", "data-table", "menu"].includes(d.id) &&
      Math.abs(parseFloat(d.vuetify!) - parseFloat(d.canon!)) <= 4,
  },
  {
    why: "Vuetify's field frame is drawn by `.v-field__outline` children (colour checked in verify/app/field.spec.ts).",
    match: on(["ti-*", "select-*", "date"], ["border-top-width", "border-top-color"]),
  },
  {
    why: "Alert and toast: the root keeps the intent colour for the icon; Vuetify draws the alert edge as a border and the bar as an element, Canon both as shadows.",
    match: on(["alert-*", "toast-*"], ["color", "border-top-color", "box-shadow"]),
  },
  {
    why: "Canon's segmented card is the track's `::before`, not the checked option.",
    match: on(["seg-selected"], ["background-color", "box-shadow"]),
  },
  {
    why: "Vuetify mutes with opacity (disabled rows, subheaders, card description), so the colour is the ink; it composites to Canon's tone.",
    match: on(["menu-disabled", "menu-heading", "nav-heading", "card-description"], ["color"]),
  },
  {
    why: "Subheaders carry the list surface as a background (sticky); same look on the panel.",
    match: on(["menu-heading", "nav-heading", "nav"], ["background-color"]),
  },
  {
    why: "Card: the 4px above the description and the 16px header gap are padding on the description and the card item.",
    match: on(["card-description", "card-body"], ["block-size"]),
  },
  {
    why: "Deviation: neutral ink labels are one step off Canon (zinc-900 vs 950 light, zinc-100 vs white dark), and rest segments are muted (zinc-500) like tabs, Canon zinc-600.",
    match: on(["seg-option", "seg-selected", "tab-selected", "group-first", "tag-high"], ["color"]),
  },
  {
    why: "Deviation: dark disabled low/minimal buttons use zinc-500 (Canon zinc-600), the low line `frame` zinc-700 (Canon zinc-800); dark button-group lines are `frame` zinc-700 (Canon zinc-600).",
    match: (d) =>
      (d.prop == "color" && d.id.startsWith("btn-") && /^color\(srgb 0\.44/.test(d.vuetify ?? "")) ||
      (d.prop == "border-top-color" && ["btn-low-*", "group-first"].some((p) => matchId(d.id, p)) && d.vuetify == "rgb(63, 63, 70)"),
  },
  {
    why: "Deviation: a menu separator is the app's VDivider with its own margin (the story's `my-1`: a 9px row, Canon 16).",
    match: (d) => d.id == "menu" && d.prop == "block-size" && Math.abs(parseFloat(d.vuetify!) - parseFloat(d.canon!)) <= 8,
  },
  {
    why: "Deviation: pagination keeps Vuetify's nav margin (48 tall row, Canon 40).",
    match: on(["pagination"], ["block-size"]),
  },
  {
    why: "Deviation: Vuetify's group label and hint spacing (radio group 128 vs 134) and messages 8px under a choice (Canon hint 6).",
    match: on(["radio-group", "sw-hint"], ["block-size", "font-size", "line-height"]),
  },
  {
    why: "The accepted 8px nav row spacing is 2px tighter than Canon's 10px pitch, leaving the standalone list 4px shorter.",
    match: on(["nav"], ["block-size"]),
  },
];

const stories = (await fetchStories()).filter((s) => s.title.startsWith("Parity/") && s.title != "Parity/Smoke");
const dump: Record<string, ParityDiff[]> = {};

for (const theme of ["light", "dark"] as const) {
  test.describe(theme, () => {
    for (const story of stories) {
      test(`${story.title} / ${story.name}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
        await page.locator('[data-side="vuetify"] [data-parity]').first().waitFor();
        const ids = await page.$$eval('[data-side="vuetify"] [data-parity]', (els) => [
          ...new Set(els.map((e) => e.getAttribute("data-parity")!)),
        ]);
        const diffs = await compareParity(page, story.id, ids, undefined, { theme });
        const unexpected = diffs.filter((d) => !expected.some((r) => r.match(d, diffs)));
        if (process.env.PARITY_DUMP) {
          dump[`${theme} ${story.title} / ${story.name}`] = unexpected;
          writeFileSync(process.env.PARITY_DUMP, JSON.stringify(dump, null, 1));
          return;
        }
        expect(unexpected).toEqual([]);
      });
    }
  });
}
