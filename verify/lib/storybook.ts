import type { Page } from "@playwright/test";
import { storybookURL } from "../playwright.config";

export interface StoryEntry {
  id: string;
  title: string;
  name: string;
  type: "story" | "docs";
  tags?: string[];
}

/** Stories listed by the running Storybook's `index.json`. */
export async function fetchStories(): Promise<StoryEntry[]> {
  const res = await fetch(`${storybookURL}/index.json`).catch((e: unknown) => {
    throw new Error(`Storybook is not reachable at ${storybookURL}; start it first. (${e})`);
  });
  const index = (await res.json()) as { entries: Record<string, StoryEntry> };
  return Object.values(index.entries).filter((e) => e.type == "story");
}

export interface StoryGlobals {
  theme?: "light" | "dark";
  accent?: string;
  /** A Storybook font preset key or family (storybook/src/fonts.ts). */
  font?: string;
}

export interface StoryProblems {
  errors: string[];
  warnings: string[];
}

/**
 * Opens one story in the preview iframe and waits until Storybook reports it
 * rendered (or failed). Console errors, uncaught exceptions and Storybook's
 * error overlay land in `errors`; console warnings in `warnings`.
 */
export async function openStory(page: Page, id: string, globals: StoryGlobals = {}): Promise<StoryProblems> {
  const problems: StoryProblems = { errors: [], warnings: [] };
  page.on("console", (m) => {
    if (m.type() == "error") problems.errors.push(m.text());
    else if (m.type() == "warning") problems.warnings.push(m.text());
  });
  page.on("pageerror", (e) => problems.errors.push(`uncaught: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 400) problems.errors.push(`HTTP ${r.status()} ${r.url()}`);
  });

  const g = Object.entries(globals)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
  await page.goto(`/iframe.html?id=${id}&viewMode=story${g ? `&globals=${g}` : ""}`);
  await page.waitForFunction(
    () => document.body.classList.contains("sb-show-main") || document.body.classList.contains("sb-show-errordisplay"),
    undefined,
    { timeout: 30_000 },
  );
  if (await page.evaluate(() => document.body.classList.contains("sb-show-errordisplay"))) {
    problems.errors.push(`render error: ${await page.locator("#error-message").innerText()}`);
  }
  // Mocked API calls resolve on later ticks; give them a moment to fail loudly.
  await page.waitForTimeout(400);
  return problems;
}
