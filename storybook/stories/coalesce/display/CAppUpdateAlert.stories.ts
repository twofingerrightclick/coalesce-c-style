import type { Meta } from "@storybook/vue3-vite";
import { tpl } from "../../_helpers";

export default { title: "Coalesce/Display/c-app-update-alert", tags: ["coalesce:CAppUpdateAlert"] } satisfies Meta;

/**
 * An axios stand-in whose two responses carry different `x-app-build`
 * headers, which is how c-app-update-alert detects a new deployment.
 */
function newBuildAxios() {
  return {
    interceptors: {
      response: {
        use(onResponse: (r: unknown) => unknown) {
          onResponse({ headers: { "x-app-build": "build-1" } });
          queueMicrotask(() => onResponse({ headers: { "x-app-build": "build-2" } }));
          return 0;
        },
        eject() {},
      },
    },
  };
}

export const Visible = tpl(`<c-app-update-alert :axios-instance="axios" />`, () => ({ axios: newBuildAxios() }));
