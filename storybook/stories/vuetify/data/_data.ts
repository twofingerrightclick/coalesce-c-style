import { createFixtures } from "@/fixtures";

const { people, companies } = createFixtures();

/** Plain rows for the non-Coalesce table stories. */
export const rows = people.map((p) => ({
  id: p.personId,
  name: p.name,
  email: p.email,
  company: companies.find((c) => c.companyId == p.companyId)?.name ?? "—",
  age: p.age,
  salary: p.salary,
  active: p.isActive,
}));

export const headers = [
  { title: "Name", key: "name" },
  { title: "Email", key: "email" },
  { title: "Company", key: "company" },
  { title: "Age", key: "age", align: "end" as const },
  { title: "Salary", key: "salary", align: "end" as const },
];
