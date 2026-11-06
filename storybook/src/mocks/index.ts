import type { Method } from "coalesce-vue";
import { mockEndpoint } from "coalesce-vue/lib/test-utils";
import * as $metadata from "@/domain/metadata.g";
import { createFixtures, type Fixtures } from "@/fixtures";

type Dto = Record<string, any>;
type AxiosRequestConfig = { url?: string; params?: Dto; data?: unknown };
type Result = { wasSuccessful: boolean; message?: string; [k: string]: unknown };
type Handler = (config: AxiosRequestConfig) => Result | Blob | Promise<Result | Blob>;

export interface MockOptions {
  /** Milliseconds every response waits. */
  delay?: number;
  /** Fail every request whose URL matches; `true` fails all of them. */
  fail?: boolean | RegExp;
  /** Serve empty lists. */
  empty?: boolean;
}

export interface MockDomain {
  db: Fixtures;
  destroy(): void;
}

interface Collection {
  route: string;
  key: string;
  rows: (db: Fixtures) => Dto[];
  search: string[];
  expand: (row: Dto, db: Fixtures) => Dto;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function readBody(data: unknown): Dto {
  if (typeof data == "string") return data ? JSON.parse(data) : {};
  if (data instanceof FormData) return Object.fromEntries(data.entries());
  return (data as Dto) ?? {};
}

const collections: Collection[] = [
  {
    route: "Person",
    key: "personId",
    rows: (db) => db.people,
    search: ["name", "email"],
    expand: (p, db) => ({
      ...p,
      company: db.companies.find((c) => c.companyId == p.companyId) ?? null,
      manager: (() => {
        const m = db.people.find((x) => x.personId == p.managerId);
        return m ? { personId: m.personId, name: m.name } : null;
      })(),
      personTags: db.personTags
        .filter((pt) => pt.personId == p.personId)
        .map((pt) => ({ ...pt, tag: db.tags.find((t) => t.tagId == pt.tagId) })),
    }),
  },
  {
    route: "Company",
    key: "companyId",
    rows: (db) => db.companies,
    search: ["name", "city"],
    expand: (c) => ({ ...c }),
  },
  {
    route: "Tag",
    key: "tagId",
    rows: (db) => db.tags,
    search: ["name"],
    expand: (t) => ({ ...t }),
  },
  {
    route: "PersonTag",
    key: "personTagId",
    rows: (db) => db.personTags,
    search: [],
    expand: (pt, db) => ({ ...pt, tag: db.tags.find((t) => t.tagId == pt.tagId) }),
  },
  {
    route: "AuditLog",
    key: "id",
    rows: (db) => db.auditLogs,
    search: ["type", "keyValue", "description"],
    expand: (a) => ({ ...a }),
  },
];

function matchesFilter(value: unknown, filter: string) {
  const options = filter.split(",").map((s) => s.trim().toLowerCase());
  return options.includes(String(value ?? "").toLowerCase());
}

function list(c: Collection, db: Fixtures, params: Dto, empty: boolean): Result {
  let rows = empty ? [] : [...c.rows(db)];
  const search = String(params.search ?? "").trim().toLowerCase();
  if (search) {
    rows = rows.filter((r) => c.search.some((f) => String(r[f] ?? "").toLowerCase().includes(search)));
  }
  for (const [k, v] of Object.entries(params)) {
    if (k.startsWith("filter.") && v !== "") {
      const prop = k.slice(7);
      rows = rows.filter((r) => matchesFilter(r[prop], String(v)));
    }
  }
  const orderBy = params.orderBy ?? params.orderByDescending;
  if (orderBy) {
    const dir = params.orderByDescending ? -1 : 1;
    const prop = String(orderBy).split(".")[0];
    const field = prop.charAt(0).toLowerCase() + prop.slice(1);
    rows.sort((a, b) => (a[field] > b[field] ? dir : a[field] < b[field] ? -dir : 0));
  }
  const pageSize = Number(params.pageSize ?? 10);
  const page = Number(params.page ?? 1);
  const totalCount = rows.length;
  return {
    wasSuccessful: true,
    list: rows.slice((page - 1) * pageSize, page * pageSize).map((r) => c.expand(r, db)),
    page,
    pageSize,
    totalCount,
    pageCount: Math.ceil(totalCount / pageSize),
  };
}

function upsert(c: Collection, db: Fixtures, data: Dto): Dto {
  const rows = c.rows(db);
  const { $type, ...fields } = data;
  let row = fields[c.key] != null ? rows.find((r) => r[c.key] == fields[c.key]) : undefined;
  if (row) {
    Object.assign(row, fields);
  } else {
    row = { ...fields, [c.key]: Math.max(0, ...rows.map((r) => r[c.key])) + 1 };
    rows.push(row);
  }
  return c.expand(row, db);
}

function remove(c: Collection, db: Fixtures, id: unknown) {
  const rows = c.rows(db);
  const i = rows.findIndex((r) => String(r[c.key]) == String(id));
  if (i >= 0) rows.splice(i, 1);
}

function crudHandlers(c: Collection, db: Fixtures, empty: boolean): [string, Handler][] {
  const idFromUrl = (url = "") => decodeURIComponent(url.split("/").pop()!.split("?")[0]);
  return [
    [`/${c.route}/list`, (cfg) => list(c, db, cfg.params ?? {}, empty)],
    [`/${c.route}/count`, (cfg) => ({ wasSuccessful: true, object: (list(c, db, { ...cfg.params, pageSize: 1e9 }, empty).list as Dto[]).length })],
    [
      `/${c.route}/get/`,
      (cfg) => {
        const row = c.rows(db).find((r) => String(r[c.key]) == idFromUrl(cfg.url));
        return row
          ? { wasSuccessful: true, object: c.expand(row, db) }
          : { wasSuccessful: false, message: `${c.route} ${idFromUrl(cfg.url)} not found.` };
      },
    ],
    [`/${c.route}/save`, (cfg) => ({ wasSuccessful: true, object: upsert(c, db, readBody(cfg.data)) })],
    [
      `/${c.route}/delete/`,
      (cfg) => {
        remove(c, db, idFromUrl(cfg.url));
        return { wasSuccessful: true };
      },
    ],
    [
      `/${c.route}/bulkSave`,
      (cfg) => {
        const { items = [] } = readBody(cfg.data) as { items: Dto[] };
        let root: Dto | null = null;
        for (const item of items) {
          const target = collections.find((x) => x.route == item.type) ?? c;
          if (item.action == "delete") remove(target, db, item.data?.[target.key]);
          else if (item.action == "save") {
            const saved = upsert(target, db, item.data ?? {});
            if (item.root) root = saved;
          }
        }
        return { wasSuccessful: true, object: root };
      },
    ],
  ];
}

const methods = $metadata.Person.methods;

function methodHandlers(db: Fixtures): [Method, Handler][] {
  const person = (body: Dto) => db.people.find((p) => p.personId == body.id);
  return [
    [
      methods.promote,
      (cfg) => {
        const b = readBody(cfg.data);
        return { wasSuccessful: true, object: `${person(b)?.name} promoted ${b.levels ?? 1} level(s): ${b.reason}` };
      },
    ],
    [
      methods.archive,
      (cfg) => {
        const p = person(readBody(cfg.data));
        if (p) p.isActive = false;
        return { wasSuccessful: true };
      },
    ],
    [
      methods.changeCompany,
      (cfg) => {
        const b = readBody(cfg.data);
        const p = person(b);
        if (p) p.companyId = b.company?.companyId ?? null;
        return { wasSuccessful: true, object: p ? collections[0].expand(p, db) : null };
      },
    ],
    [
      methods.downloadCard,
      (cfg) => {
        const p = person(readBody(cfg.data) ?? cfg.params);
        const card = `BEGIN:VCARD\nFN:${p?.name ?? "Unknown"}\nEND:VCARD\n`;
        return Object.assign(new Blob([card], { type: "text/vcard" }), { wasSuccessful: true });
      },
    ],
    [methods.uploadResume, () => ({ wasSuccessful: true })],
    [
      methods.nicknameSuggestions,
      (cfg) => {
        const search = String(readBody(cfg.data).search ?? cfg.params?.search ?? "").toLowerCase();
        const all = [...new Set(db.people.flatMap((p) => [p.name.split(" ")[0], ...(p.nicknames ?? [])]))].sort();
        return { wasSuccessful: true, object: all.filter((n) => n.toLowerCase().includes(search)).slice(0, 20) };
      },
    ],
    [methods.countActive, () => ({ wasSuccessful: true, object: db.people.filter((p) => p.isActive).length })],
    [
      methods.scheduleReview,
      (cfg) => {
        const b = readBody(cfg.data);
        return { wasSuccessful: true, object: `${b.date}T${b.time ?? "00:00:00"}-07:00` };
      },
    ],
    [methods.failingMethod, () => ({ wasSuccessful: false, message: "This method always fails." })],
  ];
}

/**
 * Serves the Storybook domain from in-memory fixtures through Coalesce's
 * `mockEndpoint`. Later registrations win, so a story can layer its own
 * `mockEndpoint` over these.
 */
export function mockDomain(options: MockOptions = {}): MockDomain {
  const { delay = 0, fail = false, empty = false } = options;
  const db = createFixtures();

  const wrap =
    (handler: Handler) =>
    async (cfg: AxiosRequestConfig): Promise<any> => {
      if (delay) await sleep(delay);
      if (fail === true || (fail instanceof RegExp && fail.test(cfg.url ?? ""))) {
        return { wasSuccessful: false, message: `Mock failure for ${cfg.url}.` };
      }
      return handler(cfg);
    };

  const handles = [
    ...collections.flatMap((c) => crudHandlers(c, db, empty)),
    ...methodHandlers(db),
  ].map(([endpoint, handler]) => mockEndpoint(endpoint as any, wrap(handler)));

  return {
    db,
    destroy: () => handles.forEach((h) => h.destroy()),
  };
}

/** Rejects any request no mock claimed, instead of letting it reach the network. */
export function mockFallback() {
  // "/" is a prefix of every URL; the typed EndpointSpec wants a route shape.
  return mockEndpoint("/" as `/${string}/list`, (cfg) => ({ wasSuccessful: false, message: `No Storybook mock for ${cfg.url}.`, list: [] }));
}

/** A handler that never settles, for loading states. */
export function mockPending(endpoint: string | Method) {
  return mockEndpoint(endpoint as any, () => new Promise(() => {}));
}

export { mockEndpoint };

/** One fixture row in the shape the API returns it (navigations included). */
export function fixtureDto(route: "Person" | "Company" | "Tag" | "AuditLog", id: number): Dto {
  const db = createFixtures();
  const c = collections.find((x) => x.route == route)!;
  const row = c.rows(db).find((r) => r[c.key] == id);
  if (!row) throw new Error(`No ${route} fixture with key ${id}.`);
  return c.expand(row, db);
}
