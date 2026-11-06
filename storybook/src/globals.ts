import type { InjectionKey } from "vue";

export type ThemeName = "light" | "dark";

export interface StoryGlobals {
  theme: ThemeName;
  accent: string;
}

export const globalsKey: InjectionKey<StoryGlobals> = Symbol("storyGlobals");

/** Accent presets for the toolbar; `canon` is c-style's default palette. */
export const accents: Record<string, string> = {
  canon: "#2563eb",
  violet: "#7c3aed",
  emerald: "#059669",
  rose: "#e11d48",
  orange: "#ea580c",
};
