import type { StoryObj } from "@storybook/vue3-vite";

/** A story rendered from a runtime template; every Vuetify, c- and sb- component is global. */
export function tpl(
  template: string,
  setup: () => Record<string, unknown> = () => ({}),
  extra: Omit<StoryObj, "render"> = {},
): StoryObj {
  return { render: () => ({ template, setup }), ...extra };
}

/** Theme color keys every Canon intent maps onto (plan decision 5). */
export const colors = [undefined, "primary", "neutral", "secondary", "success", "warning", "error", "info"];
export const btnVariants = ["flat", "tonal", "outlined", "text", "elevated", "plain"] as const;
export const fieldVariants = ["outlined", "filled", "solo", "solo-filled", "solo-inverted", "underlined", "plain"] as const;
export const densities = ["default", "comfortable", "compact"] as const;
export const sizes = ["x-small", "small", "default", "large", "x-large"] as const;

export const fruits = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig", "Grape"];
export const people = [
  { title: "Ada Lovelace", value: 1, subtitle: "Analyst" },
  { title: "Grace Hopper", value: 2, subtitle: "Admiral" },
  { title: "Alan Turing", value: 3, subtitle: "Mathematician" },
  { title: "Katherine Johnson", value: 4, subtitle: "Physicist" },
];

/**
 * Variant, state and size grids shared by every text-entry component.
 * `props` are bound on every instance (items, type, …).
 */
export function fieldStories(component: string, props: Record<string, unknown> = {}, value: unknown = "") {
  const setup = () => ({ component, props, value, variants: fieldVariants, densities });
  const field = (attrs: string) =>
    `<component :is="component" v-bind="props" :model-value="value" ${attrs} style="min-width: 220px; max-width: 280px" />`;
  return {
    Variants: tpl(
      `<sb-row v-for="v in variants" :key="v" :label="v" stack>
        ${field(`:variant="v" label="Label"`)}
        ${field(`:variant="v" label="Label" hint="Hint text" persistent-hint`)}
        ${field(`:variant="v" placeholder="Placeholder" prepend-inner-icon="$info" clearable`)}
      </sb-row>`,
      setup,
    ),
    States: tpl(
      `<sb-row label="empty" stack>${field(`label="Name"`)}${field(`label="Name" placeholder="Jane Doe" persistent-placeholder`)}</sb-row>
      <sb-row label="focused" stack>${field(`label="Name" focused`)}</sb-row>
      <sb-row label="error" stack>${field(`label="Name" :error-messages="['Name is required.']"`)}${field(`label="Name" error`)}</sb-row>
      <sb-row label="disabled" stack>${field(`label="Name" disabled`)}</sb-row>
      <sb-row label="readonly" stack>${field(`label="Name" readonly`)}</sb-row>
      <sb-row label="loading" stack>${field(`label="Name" loading`)}</sb-row>
      <sb-row label="no label (Coalesce admin)" stack>${field(`label="" density="compact" variant="outlined" hide-details="auto"`)}</sb-row>`,
      setup,
    ),
    Sizes: tpl(
      `<sb-section title="density"><sb-row v-for="d in densities" :key="d" :label="d" stack>${field(`:density="d" label="Label"`)}${field(`:density="d" label="Label" prepend-inner-icon="$info" clearable`)}</sb-row></sb-section>`,
      setup,
    ),
  };
}

/** An offline placeholder image (SVG gradient), so media stories never hit the network. */
export function placeholderImage(hue = 220, label = "") {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><defs><linearGradient id='g' x2='1' y2='1'><stop offset='0' stop-color='hsl(${hue} 70% 75%)'/><stop offset='1' stop-color='hsl(${(hue + 60) % 360} 70% 45%)'/></linearGradient></defs><rect width='800' height='450' fill='url(#g)'/><text x='400' y='240' font-family='sans-serif' font-size='48' text-anchor='middle' fill='white'>${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
