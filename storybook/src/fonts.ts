// The Font toolbar global: c-style's bundled Public Sans (default) and opt-in
// Inter, preview-only presets from Google Fonts / Fontshare loaded on demand,
// or any Google Fonts / Fontshare family named in the URL.

export interface FontChoice {
  /** CSS family name passed to `applyCStyleFont`; `undefined` = c-style's default (Public Sans). */
  family?: string;
  /** Stylesheets that declare it, tried in order until one loads. */
  css: string[];
  /** Loads a font c-style ships as an opt-in import. */
  load?: () => Promise<unknown>;
}

// The weights c-style's type ramp and components use (400 body, 500 labels, 600 titles) plus bold.
const weights = [400, 500, 600, 700];

const google = (family: string) => {
  const name = family.trim().replace(/ /g, "+");
  // Static families without these weights reject the axis request; the bare one always loads.
  return [
    `https://fonts.googleapis.com/css2?family=${name}:wght@${weights.join(";")}&display=swap`,
    `https://fonts.googleapis.com/css2?family=${name}&display=swap`,
  ];
};

// `@1` is Fontshare's variable upright (Satoshi has no static 600); the static
// weights cover families without one.
const fontshare = (slug: string) => [`https://api.fontshare.com/v2/css?f[]=${slug}@1,${weights.join(",")}&display=swap`];

export const fontPresets: Record<string, { title: string } & FontChoice> = {
  "public-sans": { title: "Public Sans (c-style default)", css: [] },
  inter: { title: "Inter (c-style/fonts/inter)", family: "Inter", css: [], load: () => import("c-style/fonts/inter") },
  geist: { title: "Geist", family: "Geist", css: google("Geist") },
  plex: { title: "IBM Plex Sans", family: "IBM Plex Sans", css: google("IBM Plex Sans") },
  "source-sans": { title: "Source Sans 3", family: "Source Sans 3", css: google("Source Sans 3") },
  roboto: { title: "Roboto", family: "Roboto", css: google("Roboto") },
  satoshi: { title: "Satoshi (Fontshare)", family: "Satoshi", css: fontshare("satoshi") },
  "general-sans": { title: "General Sans (Fontshare)", family: "General Sans", css: fontshare("general-sans") },
  "work-sans": { title: "Work Sans (Fontshare)", family: "Work Sans", css: fontshare("work-sans") },
  system: { title: "system-ui", family: "system-ui", css: [] },
};

const fontsharePrefix = /^fontshare[ +]/i;

/**
 * Resolves the `font` global: a preset key, `fontshare <slug>` (family named
 * from the slug, `general-sans` → "General Sans"), or a Google Fonts family.
 */
export function resolveFont(value: string | undefined): FontChoice {
  const key = (value ?? "public-sans").trim();
  if (fontPresets[key]) return fontPresets[key];
  if (fontsharePrefix.test(key)) {
    const slug = key.replace(fontsharePrefix, "").trim().toLowerCase().replace(/[ +]+/g, "-");
    const family = slug.replace(/(^|-)(\w)/g, (_, sep: string, c: string) => (sep ? " " : "") + c.toUpperCase());
    return { family, css: fontshare(slug) };
  }
  const family = key.replace(/\+/g, " ");
  return { family, css: google(family) };
}

const loaded = new Map<string, Promise<void>>();

function addStylesheet(href: string) {
  return new Promise<void>((resolve, reject) => {
    const link = Object.assign(document.createElement("link"), { rel: "stylesheet", href });
    link.dataset.sbFont = "";
    link.onload = () => resolve();
    link.onerror = () => {
      link.remove();
      reject(new Error(`Font stylesheet failed: ${href}`));
    };
    document.head.append(link);
  });
}

/** Injects the font's stylesheet once per page; resolves when one of its URLs loaded. */
export function loadFont(choice: FontChoice): Promise<void> {
  if (choice.load) return choice.load().then(() => undefined);
  const key = choice.css.join(" ");
  if (!choice.css.length) return Promise.resolve();
  if (!loaded.has(key)) {
    const attempt = choice.css.reduce<Promise<void>>((prev, href) => prev.catch(() => addStylesheet(href)), Promise.reject());
    loaded.set(key, attempt.catch((e) => console.warn(String(e))));
  }
  return loaded.get(key)!;
}
