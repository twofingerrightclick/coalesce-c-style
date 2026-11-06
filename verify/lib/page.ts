import type { Page } from "@playwright/test";

export type Scheme = "light" | "dark";

/** Opens `path` in `scheme`. The demo remembers its theme switch in localStorage; clear it so the scheme decides. */
export async function gotoScheme(page: Page, path: string, scheme: Scheme) {
  await page.emulateMedia({ colorScheme: scheme });
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("theme"));
  await page.goto(path, { waitUntil: "networkidle" });
}

/** Appends `<div class>` to `.v-application` and returns its computed style values for `props`. */
export async function probeClass(page: Page, className: string, props: string[]) {
  return page.evaluate(
    ({ className, props }) => {
      const el = document.createElement("div");
      el.className = className;
      el.textContent = "Probe";
      document.querySelector(".v-application")!.append(el);
      const style = getComputedStyle(el);
      const values = Object.fromEntries(props.map((p) => [p, style.getPropertyValue(p)]));
      el.remove();
      return values;
    },
    { className, props },
  );
}

/** A computed box-shadow as its non-transparent layers, colour first, whitespace-normalised. */
export function shadowLayers(boxShadow: string): string[] {
  return boxShadow
    .split(/,(?![^(]*\))/)
    .map((layer) => layer.trim().replace(/\s+/g, " "))
    .filter((layer) => layer && !/rgba\([^)]*,\s*0\)/.test(layer) && layer !== "none");
}
