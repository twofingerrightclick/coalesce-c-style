import type { StoryObj } from "@storybook/vue3-vite";

/**
 * CSS for the Canon frame that shows popover-based components open and in
 * flow, at rest (no entry transition: Canon's menu enters at scale .97).
 */
export const staticPopover = `[popover], dialog { display: block; position: static; inset: auto; margin: 0; translate: none; scale: none; transition: none; animation: none; }`;

/**
 * A parity story: Vuetify markup (`vuetify`) beside Canon markup (`canon`).
 * Pair elements by giving both the same `data-parity` id.
 */
export function parity(title: string, vuetify: string, canon: string, canonCss = "", setup: () => Record<string, unknown> = () => ({})): StoryObj {
  return {
    render: () => ({
      template: `<Parity :title="title" :canon="canon" :canon-css="canonCss">${vuetify}</Parity>`,
      setup: () => ({ title, canon, canonCss, ...setup() }),
    }),
  };
}
