import type { Meta } from "@storybook/vue3-vite";
import { waitFor } from "storybook/test";
import { tpl } from "../../_helpers";
import { company, people, person, user } from "../_support";

export default {
  title: "Coalesce/Admin/c-admin-methods",
  tags: ["coalesce:CAdminMethods", "coalesce:CAdminMethod"],
} satisfies Meta;

/** Clicks the first button labelled `label` in the story. */
const click = (label: string) => async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const btn = await waitFor(() => {
    const b = [...canvasElement.querySelectorAll<HTMLElement>(".v-btn")].find((x) => x.textContent?.trim() == label);
    if (!b) throw new Error(`no ${label} button`);
    return b;
  });
  await user.click(btn);
  await new Promise((r) => setTimeout(r, 300));
};

export const InstanceMethods = tpl(`<c-admin-methods :model="p" auto-reload-model />`, () => ({ p: person(1) }));

export const StaticMethods = tpl(`<c-admin-methods :model="list" />`, () => ({ list: people() }));

export const ParamsGrid = tpl(`<v-card><c-admin-method :model="p" for="promote" /></v-card>`, () => ({ p: person(1) }));

export const ObjectResult = tpl(`<v-card><c-admin-method :model="p" for="promote" /></v-card>`, () => {
  const p = person(1);
  p.promote.args.reason = "Shipped the compiler";
  p.promote.args.levels = 2;
  return { p };
}, { play: click("Execute") });

export const VoidResult = tpl(`<v-card><c-admin-method :model="p" for="archive" /></v-card>`, () => ({ p: person(1) }), { play: click("Execute") });

export const ModelResult = tpl(`<v-card><c-admin-method :model="p" for="changeCompany" /></v-card>`, () => {
  const p = person(1);
  p.changeCompany.args.company = company(3);
  return { p };
}, { play: click("Execute") });

export const FileResult = tpl(`<v-card><c-admin-method :model="p" for="downloadCard" /></v-card>`, () => ({ p: person(1) }), { play: click("Preview") });

export const DateParams = tpl(`<v-card><c-admin-method :model="list" for="scheduleReview" /></v-card>`, () => ({ list: people() }));

export const ErrorResult = {
  ...tpl(`<v-card><c-admin-method :model="list" for="failingMethod" /></v-card>`, () => ({ list: people() }), { play: click("Execute") }),
  tags: ["allow-request-errors"],
};
