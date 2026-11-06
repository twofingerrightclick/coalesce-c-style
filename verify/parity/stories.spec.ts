import { expect, test } from "@playwright/test";
import { rowOverlaps } from "../lib/layout";
import { fetchStories, openStory, type StoryGlobals } from "../lib/storybook";

// Every story in Storybook's index renders with no console errors, uncaught
// exceptions, failed requests or Storybook error overlay. Stories tagged
// `allow-request-errors` show a failed (mocked) API call, which Coalesce
// leaves unhandled; only that error is tolerated there. No two items of an
// `sb-row` overlap.
// STORY_FILTER narrows the run by id substring; STORY_GLOBALS (e.g.
// "theme:dark;accent:violet") reruns it in another context.
const stories = (await fetchStories()).filter(
  (s) => s.id.includes(process.env.STORY_FILTER ?? ""),
);
const globals = Object.fromEntries(
  (process.env.STORY_GLOBALS ?? "").split(";").filter(Boolean).map((kv) => kv.split(":")),
) as StoryGlobals;

test.describe("every story renders cleanly", () => {
  for (const story of stories) {
    test(`${story.title} / ${story.name}`, async ({ page }) => {
      const { errors, warnings } = await openStory(page, story.id, globals);
      for (const w of warnings) test.info().annotations.push({ type: "warning", description: w.slice(0, 500) });
      const tolerated = story.tags?.includes("allow-request-errors") ? /^uncaught: Request failed with status code 4\d\d$/ : null;
      expect(errors.filter((e) => !tolerated?.test(e)), story.id).toEqual([]);
      expect(await rowOverlaps(page), story.id).toEqual([]);
    });
  }
});
