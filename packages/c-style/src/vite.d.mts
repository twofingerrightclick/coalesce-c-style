import type { Plugin } from "vite";
import type vuetify from "vite-plugin-vuetify";

export { layerOrderCss, layerOrderStyle } from "./layer-order.mjs";

export interface CStyleOptions {
  /**
   * SASS settings file passed to `vite-plugin-vuetify` as `styles.configFile`,
   * absolute or relative to the Vite root. Defaults to `coalesce-c-style/settings`; an
   * app file should `@use 'coalesce-c-style/settings' with (…)` rather than replace it.
   */
  settings?: string;
  /** Other `vite-plugin-vuetify` options. `autoImport` defaults to true; `styles` is owned by c-style. */
  vuetify?: Omit<NonNullable<Parameters<typeof vuetify>[0]>, "styles">;
}

/** Absolute path of `coalesce-c-style/settings`. */
export declare const settingsFile: string;

/** Replaces the app's `vite-plugin-vuetify` call. */
export declare function cStyle(options?: CStyleOptions): Plugin[];

/** Prepends Vuetify's layer order to `index.html` unless the page already declares it. */
export declare function cStyleHtml(): Plugin;
