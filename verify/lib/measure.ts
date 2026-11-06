import type { Frame, Page } from "@playwright/test";
import { openStory, type StoryGlobals } from "./storybook";

/** Computed style properties `compareParity` reads by default (plan §6). */
export const parityProps = [
  "block-size", "inline-size", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "border-top-width", "border-top-color", "border-radius", "font-size", "line-height", "font-weight",
  "letter-spacing", "color", "background-color", "box-shadow",
] as const;

export interface ParityDiff {
  id: string;
  prop: string;
  vuetify: string | null;
  canon: string | null;
}

type Side = { frame: Frame; selector: string };

const lengthTolerance = 0.5;

const colorPattern = /rgba?\([^)]*\)|color\(srgb [^)]*\)/g;

/** `rgb()`, `rgba()` or `color(srgb …)` (what `color-mix()` serializes to) as 0–255 channels and alpha. */
function channels(color: string) {
  const n = color.match(/[\d.]+/g)!.map(Number);
  const [r, g, b] = color.startsWith("color(") ? n.slice(0, 3).map((c) => c * 255) : n.slice(0, 3);
  return [r, g, b, n[3] ?? 1];
}

function sameColor(a: string, b: string) {
  const [ca, cb] = [channels(a), channels(b)];
  return ca.every((v, i) => Math.abs(v - cb[i]) <= (i == 3 ? 0.01 : 1.5));
}

/** Shadows parsed and sorted with fully transparent layers dropped, so equal shadows compare equal. */
function shadowLayers(value: string) {
  if (value == "none") return [];
  return value
    .split(/,(?![^(]*\))/)
    .map((l) => l.trim())
    .filter((l) => channels(l.match(colorPattern)?.[0] ?? "rgba(0, 0, 0, 1)")[3] > 0)
    .sort((x, y) => x.replace(colorPattern, "").localeCompare(y.replace(colorPattern, "")));
}

function sameShadow(a: string, b: string) {
  const [la, lb] = [shadowLayers(a), shadowLayers(b)];
  return (
    la.length == lb.length &&
    la.every((layer, i) => {
      const [ca, cb] = [layer.match(colorPattern)?.[0], lb[i].match(colorPattern)?.[0]];
      return layer.replace(colorPattern, "") == lb[i].replace(colorPattern, "") && (!ca || !cb ? ca == cb : sameColor(ca, cb));
    })
  );
}

function equal(prop: string, a: string | null, b: string | null) {
  if (a == null || b == null) return a == b;
  if (prop == "box-shadow") return sameShadow(a, b);
  const isColor = (v: string) => /^(rgba?|color)\(/.test(v);
  if (isColor(a) && isColor(b)) return sameColor(a, b);
  const na = parseFloat(a);
  const nb = parseFloat(b);
  if (/px$/.test(a) && /px$/.test(b) && !a.includes(" ") && !b.includes(" ")) return Math.abs(na - nb) <= lengthTolerance;
  return a == b;
}

async function read(side: Side, props: readonly string[]) {
  return side.frame.evaluate(
    ([selector, props]) => {
      const pair = document.querySelector(selector);
      // A wrapper can name the part that matches Canon's element (a field
      // frame inside VTextField's input wrapper).
      const target = pair?.getAttribute("data-parity-target");
      const el = target ? pair!.querySelector(target) : pair;
      if (!el) return null;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return Object.fromEntries(
        props.map((p) => [
          p,
          p == "block-size"
            ? `${rect.height}px`
            : p == "inline-size"
              ? `${rect.width}px`
              : // A zero-width border has no visible colour.
                p == "border-top-color" && style.borderTopWidth == "0px"
                ? "none"
                : style.getPropertyValue(p),
        ]),
      );
    },
    [side.selector, props] as const,
  );
}

/** The story's Canon iframes, after each has loaded Canon's stylesheet. */
async function canonFrames(page: Page) {
  const handles = await page.locator("iframe.canon-frame").elementHandles();
  const frames = await Promise.all(handles.map((h) => h.contentFrame()));
  for (const f of frames) {
    await f?.waitForLoadState("load");
    await f?.waitForFunction(
      () => [...document.styleSheets].some((s) => s.href?.endsWith("/canon.css")) && !!document.querySelector("[data-parity]"),
    );
    await f?.evaluate(() => document.fonts.ready);
  }
  return frames.filter((f): f is Frame => !!f);
}

async function locate(page: Page, frames: Frame[], id: string) {
  const selector = `[data-parity="${id}"]`;
  const vuetify: Side = { frame: page.mainFrame(), selector: `[data-side="vuetify"] ${selector}` };
  for (const frame of frames) {
    if (await frame.$(selector)) return { vuetify, canon: { frame, selector } as Side };
  }
  throw new Error(`No Canon element with data-parity="${id}".`);
}

/**
 * Opens a Parity story and compares the computed styles of each `data-parity`
 * pair (Vuetify side vs Canon iframe). Returns only the properties that differ.
 */
export async function compareParity(
  page: Page,
  storyId: string,
  ids: string[],
  props: readonly string[] = parityProps,
  globals: StoryGlobals = {},
): Promise<ParityDiff[]> {
  await openStory(page, storyId, globals);
  const frames = await canonFrames(page);
  const diffs: ParityDiff[] = [];
  for (const id of ids) {
    const { vuetify, canon } = await locate(page, frames, id);
    const [v, c] = await Promise.all([read(vuetify, props), read(canon, props)]);
    if (!v) throw new Error(`No Vuetify element with data-parity="${id}".`);
    for (const prop of props) {
      if (!equal(prop, v[prop], c![prop])) diffs.push({ id, prop, vuetify: v[prop], canon: c![prop] });
    }
  }
  return diffs;
}

/** Bounding-box comparison only (icon and control sizes, M6). */
export function compareBox(page: Page, storyId: string, ids: string[], globals: StoryGlobals = {}) {
  return compareParity(page, storyId, ids, ["block-size", "inline-size"], globals);
}
