// Deterministic seed data in the API's DTO shape (camelCase, ISO date strings).
// Mocks copy it per story, so edits made in one story never leak into another.

export interface CompanyDto {
  companyId: number;
  name: string;
  city: string | null;
  website: string | null;
  logoUrl: string | null;
  founded: string | null;
  isPublic: boolean;
}

export interface TagDto {
  tagId: number;
  name: string;
  color: string | null;
}

export interface PersonTagDto {
  personTagId: number;
  personId: number;
  tagId: number;
}

export interface PersonDto {
  personId: number;
  name: string;
  bio: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  avatarUrl: string | null;
  favoriteColor: string | null;
  password: string | null;
  age: number | null;
  salary: number | null;
  rating: number | null;
  isActive: boolean;
  status: number;
  skills: number[] | null;
  birthDate: string | null;
  startTime: string | null;
  lastLogin: string | null;
  createdAt: string;
  resume: string | null;
  companyId: number | null;
  managerId: number | null;
  nicknames: string[] | null;
  luckyNumbers: number[] | null;
}

export interface AuditLogPropertyDto {
  id: number;
  parentId: number;
  propertyName: string;
  oldValue: string | null;
  oldValueDescription: string | null;
  newValue: string | null;
  newValueDescription: string | null;
}

export interface AuditLogDto {
  id: number;
  type: string;
  keyValue: string;
  description: string | null;
  state: number;
  date: string;
  clientIp: string | null;
  referrer: string | null;
  endpoint: string | null;
  properties: AuditLogPropertyDto[];
}

export interface Fixtures {
  companies: CompanyDto[];
  tags: TagDto[];
  people: PersonDto[];
  personTags: PersonTagDto[];
  auditLogs: AuditLogDto[];
}

// Served from storybook/public/avatars (static SVGs), so image stories stay offline.
const avatar = (file: string) => `${import.meta.env.BASE_URL}avatars/${file}.svg`;

const companies: CompanyDto[] = [
  ["Northwind Traders", "Seattle", 1998, true],
  ["Contoso Ltd", "Redmond", 2004, true],
  ["Fabrikam Inc", "Spokane", 2011, false],
  ["Tailspin Toys", "Portland", 2016, false],
  ["Adventure Works", "Boise", 1989, true],
].map(([name, city, year, isPublic], i) => ({
  companyId: i + 1,
  name: name as string,
  city: city as string,
  website: `https://${(name as string).toLowerCase().replace(/[^a-z]+/g, "")}.example.com`,
  logoUrl: avatar(`company-${i + 1}`),
  founded: `${year}-0${(i % 9) + 1}-15`,
  isPublic: isPublic as boolean,
}));

const tags: TagDto[] = [
  ["Mentor", "#2563eb"],
  ["Remote", "#059669"],
  ["On call", "#e11d48"],
  ["Part time", "#ea580c"],
  ["New hire", "#7c3aed"],
  ["Manager", "#0891b2"],
  ["Speaker", "#ca8a04"],
  ["Volunteer", "#52525b"],
].map(([name, color], i) => ({ tagId: i + 1, name, color }));

const names = [
  "Ada Lovelace", "Grace Hopper", "Alan Turing", "Katherine Johnson", "Edsger Dijkstra",
  "Barbara Liskov", "Donald Knuth", "Margaret Hamilton", "Ken Thompson", "Frances Allen",
  "Dennis Ritchie", "Radia Perlman", "Tim Berners-Lee", "Hedy Lamarr", "John McCarthy",
  "Shafi Goldwasser", "Linus Torvalds", "Annie Easley", "Guido van Rossum", "Sophie Wilson",
  "Bjarne Stroustrup", "Jean Sammet", "Niklaus Wirth", "Karen Spärck Jones", "Leslie Lamport",
  "Adele Goldberg", "Brian Kernighan", "Mary Kenneth Keller", "Vint Cerf", "Evelyn Boyd Granville",
];

const bios = [
  "Wrote the first published algorithm intended for a machine.",
  "Built the first compiler and popularized machine-independent languages.\nLater a rear admiral.",
  null,
  "Calculated trajectories for Mercury and Apollo flights by hand and by machine.",
];

const people: PersonDto[] = names.map((name, i) => {
  const [first, last] = [name.split(" ")[0], name.split(" ").slice(-1)[0]];
  const month = String((i % 12) + 1).padStart(2, "0");
  const day = String((i % 27) + 1).padStart(2, "0");
  return {
    personId: i + 1,
    name,
    bio: bios[i % bios.length],
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    phone: `+1 555 01${String(i).padStart(2, "0")}`,
    website: i % 3 == 0 ? `https://example.com/~${last.toLowerCase()}` : null,
    avatarUrl: avatar(`person-${i + 1}`),
    favoriteColor: ["#2563eb", "#059669", "#e11d48", "#7c3aed", "#ea580c"][i % 5],
    password: i % 4 == 0 ? "correct horse battery staple" : null,
    age: 24 + ((i * 7) % 40),
    salary: 60000 + ((i * 7919) % 90000),
    rating: Math.round(((i * 13) % 41) + 10) / 10,
    isActive: i % 5 != 4,
    status: i % 7 == 6 ? 3 : i % 5 == 3 ? 1 : i % 6 == 2 ? 2 : 0,
    skills: [i % 6, (i + 2) % 6].filter((v, idx, a) => a.indexOf(v) == idx),
    birthDate: `${1960 + ((i * 3) % 40)}-${month}-${day}`,
    startTime: `${String(7 + (i % 4)).padStart(2, "0")}:${i % 2 ? "30" : "00"}:00`,
    lastLogin: `2026-10-${day}T${String(8 + (i % 10)).padStart(2, "0")}:15:00-07:00`,
    createdAt: `2025-${month}-${day}T12:00:00`,
    resume: i % 6 == 0 ? btoa(`Resume of ${name}`) : null,
    companyId: i % 9 == 8 ? null : (i % companies.length) + 1,
    managerId: i < 5 ? null : (i % 5) + 1,
    nicknames: i % 3 == 0 ? [first.slice(0, 3), `${first} ${last[0]}.`] : [],
    luckyNumbers: [(i * 3 + 7) % 50, (i * 7 + 11) % 50],
  };
});

const personTags: PersonTagDto[] = people.flatMap((p, i) =>
  [i % tags.length, (i * 3 + 1) % tags.length]
    .filter((v, idx, a) => a.indexOf(v) == idx && i % 4 != 3)
    .map((t, j) => ({ personTagId: i * 2 + j + 1, personId: p.personId, tagId: tags[t].tagId })),
);

const auditLogs: AuditLogDto[] = Array.from({ length: 24 }, (_, i) => {
  const person = people[i % people.length];
  const state = i % 6 == 0 ? 0 : i % 9 == 4 ? 1 : 2;
  const id = 1000 + i;
  const properties: AuditLogPropertyDto[] =
    state == 1
      ? []
      : [
          { propertyName: "Name", oldValue: state == 0 ? null : person.name.toUpperCase(), newValue: person.name },
          { propertyName: "Status", oldValue: state == 0 ? null : "0", newValue: String(person.status) },
          { propertyName: "CompanyId", oldValue: state == 0 ? null : "1", newValue: String(person.companyId) },
        ]
          .slice(0, 1 + (i % 3))
          .map((p, j) => ({
            id: id * 10 + j,
            parentId: id,
            oldValueDescription: p.propertyName == "CompanyId" && p.oldValue ? companies[0].name : null,
            newValueDescription:
              p.propertyName == "CompanyId" && person.companyId ? companies[person.companyId - 1].name : null,
            ...p,
          }));
  return {
    id,
    type: i % 4 == 3 ? "Company" : "Person",
    keyValue: String(i % 4 == 3 ? (i % 5) + 1 : person.personId),
    description: i % 5 == 0 ? `Bulk import ${i}` : null,
    state,
    date: `2026-11-0${(i % 4) + 1}T${String(9 + (i % 8)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}:00Z`,
    clientIp: `10.0.0.${10 + i}`,
    referrer: "https://localhost/admin/Person",
    endpoint: i % 2 ? "/api/Person/save" : "/api/Person/bulkSave",
    properties,
  };
});

export function createFixtures(): Fixtures {
  return structuredClone({ companies, tags, people, personTags, auditLogs });
}
