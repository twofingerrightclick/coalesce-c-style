import { reactive } from "vue";
import { userEvent, waitFor } from "storybook/test";
import { mapToModel } from "coalesce-vue";
import * as $metadata from "@/domain/metadata.g";
import { mockDomain, mockEndpoint, mockPending, fixtureDto, type MockOptions } from "@/mocks";
import {
  AuditLogListViewModel,
  CompanyViewModel,
  PersonListViewModel,
  PersonViewModel,
} from "@/domain/viewmodels.g";

/** A Person view model holding fixture `id`, loaded clean (no API call). */
export function person(id = 1) {
  const vm = new PersonViewModel();
  // $loadCleanData takes model values, so DTO strings (dates) are parsed first.
  vm.$loadCleanData(mapToModel(fixtureDto("Person", id), $metadata.Person));
  return vm;
}

export function company(id = 1) {
  const vm = new CompanyViewModel();
  vm.$loadCleanData(mapToModel(fixtureDto("Company", id), $metadata.Company));
  return vm;
}

/** A Person list loaded from the mocks; `$load` runs immediately, once. */
export function people(params: Partial<PersonListViewModel["$params"]> = {}) {
  const list = new PersonListViewModel();
  Object.assign(list.$params, { pageSize: 10, page: 1 }, params);
  list.$load();
  return reactive(list) as unknown as PersonListViewModel;
}

export function auditLogs() {
  const list = new AuditLogListViewModel();
  list.$params.pageSize = 10;
  list.$load();
  return list;
}

/** Story `beforeEach` that swaps the domain mocks for ones with these options. */
export function withMocks(options: MockOptions) {
  return () => {
    const mocks = mockDomain(options);
    return () => mocks.destroy();
  };
}

/** Story `beforeEach` that leaves `endpoint` pending forever (loading states). */
export function pending(endpoint: Parameters<typeof mockPending>[0]) {
  return () => {
    const m = mockPending(endpoint);
    return () => m.destroy();
  };
}

/**
 * Clicks with Testing Library's pointer-events check off: Vuetify menus keep
 * `pointer-events: none` on their content while the open transition runs.
 */
export const user = userEvent.setup({ pointerEventsCheck: 0 });

/** Resolves once `selector` matches in the document (menus render in an overlay outside the canvas). */
export function find<T extends Element = HTMLElement>(selector: string, root: ParentNode = document) {
  return waitFor(() => {
    const el = root.querySelector<T & Element>(selector);
    if (!el) throw new Error(`${selector} not found`);
    return el as T;
  });
}

export { mockEndpoint };
