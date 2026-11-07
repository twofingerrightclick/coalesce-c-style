// `coalesce-c-style/icons`: every Lucide icon c-style draws with, plus `csIcon`, so an
// app writes `<v-icon :icon="csIcon(House)" />` without depending on
// `@lucide/vue` itself (and without a second copy of it).
export * from "@lucide/vue";
export { csIcon } from "./cs-icon";
