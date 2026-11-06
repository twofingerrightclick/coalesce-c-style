import type { Meta } from "@storybook/vue3-vite";
import { parity } from "./_parity";

export default { title: "Parity/Data" } satisfies Meta;

const orders = [
  ["Edwin Mueller", "tyrese_nicolas@gmail.com", "16.08.2024", "$495.90", "warning", "Waiting"],
  ["Suzanne Jacobi", "cindy_murphy41@yahoo.com", "03.12.2025", "$662.02", "info", "Ready"],
  ["Kellie Schoen", "troy.lubowitz@gmail.com", "21.07.2023", "$235.71", "danger", "Cancelled"],
];
const chipColor: Record<string, string> = { warning: "warning", info: "info", danger: "error", success: "success" };

export const Table = parity(
  "Table",
  `<v-table data-parity="table"><thead><tr data-parity="table-head"><th>User</th><th>Email</th><th>Date</th><th class="text-end">Amount</th><th>Status</th></tr></thead>
    <tbody>${orders.map(([u, e, d, a, i, s], n) => `<tr${n == 0 ? ' data-parity="table-row"' : ""}><td>${u}</td><td>${e}</td><td>${d}</td><td class="text-end">${a}</td><td><v-chip color="${chipColor[i]}">${s}</v-chip></td></tr>`).join("")}</tbody></v-table>`,
  `<div class="canon-table" data-parity="table"><table><thead><tr data-parity="table-head"><th scope="col">User</th><th scope="col">Email</th><th scope="col">Date</th><th scope="col" data-align="end">Amount</th><th scope="col">Status</th></tr></thead>
    <tbody>${orders.map(([u, e, d, a, i, s], n) => `<tr${n == 0 ? ' data-parity="table-row"' : ""}><th scope="row">${u}</th><td>${e}</td><td>${d}</td><td data-align="end">${a}</td><td><span class="canon-tag" data-intent="${i}"><span class="canon-tag-label">${s}</span></span></td></tr>`).join("")}</tbody></table></div>`,
);

export const DataTable = parity(
  "Data Table: select column, sortable headers",
  `<v-data-table data-parity="data-table" show-select hide-default-footer item-value="user" :headers="[{ title: 'User', key: 'user' }, { title: 'Email', key: 'email', sortable: false }, { title: 'Amount', key: 'amount', align: 'end' }]" :items="items" />`,
  `<div class="canon-data-table" data-local><div class="canon-table" data-parity="data-table"><table><thead><tr><th scope="col" data-column="select"><div class="canon-choice"><input type="checkbox" id="all"><label class="canon-choice-label canon-visually-hidden" for="all">Select all</label></div></th><th scope="col" aria-sort="none">User</th><th scope="col">Email</th><th scope="col" aria-sort="none" data-align="end">Amount</th></tr></thead>
    <tbody>${orders.map(([u, e, , a], n) => `<tr><td><div class="canon-choice"><input type="checkbox" id="r${n}"><label class="canon-choice-label canon-visually-hidden" for="r${n}">Select</label></div></td><th scope="row">${u}</th><td>${e}</td><td data-align="end">${a}</td></tr>`).join("")}</tbody></table></div></div>`,
  "",
  () => ({ items: orders.map(([user, email, , amount]) => ({ user, email, amount })) }),
);

export const Pagination = parity(
  "Pagination",
  `<v-pagination :model-value="2" :length="30" :total-visible="7" data-parity="pagination" />`,
  `<nav class="canon-pagination" aria-label="Pagination" data-parity="pagination"><ol>
    <li><a class="canon-pagination-prev" href="#" rel="prev"><span class="canon-icon" data-icon="chevron-left" aria-hidden="true"></span><span class="canon-pagination-label">Previous</span></a></li>
    <li><a href="#">1</a></li><li><a href="#" aria-current="page" data-parity="pagination-current">2</a></li><li><a href="#">3</a></li><li><a href="#">4</a></li><li><a href="#">5</a></li>
    <li class="canon-pagination-gap">…</li><li><a href="#">30</a></li>
    <li><a class="canon-pagination-next" href="#" rel="next"><span class="canon-pagination-label">Next</span><span class="canon-icon" data-icon="chevron-right" aria-hidden="true"></span></a></li>
  </ol></nav>`,
);

export const Tag = parity(
  "Tag (VChip): emphasis high / medium / low / none",
  `<div style="display:flex;gap:8px"><v-chip variant="flat" label data-parity="tag-high">Label</v-chip><v-chip variant="tonal" label data-parity="tag-medium">Label</v-chip><v-chip variant="outlined" label data-parity="tag-low">Label</v-chip><v-chip label data-parity="tag-default">Label</v-chip></div>`,
  `<div style="display:flex;gap:8px"><span class="canon-tag" data-emphasis="high" data-parity="tag-high"><span class="canon-tag-label">Label</span></span><span class="canon-tag" data-emphasis="medium" data-parity="tag-medium"><span class="canon-tag-label">Label</span></span><span class="canon-tag" data-emphasis="low" data-parity="tag-low"><span class="canon-tag-label">Label</span></span><span class="canon-tag" data-parity="tag-default"><span class="canon-tag-label">Label</span></span></div>`,
);

// Chip named sizes for Canon's tag sizes (packages/c-style/README.md).
const tagSizes = [
  ["default", "sm"],
  ["large", "md"],
  ["x-large", "lg"],
] as const;

export const TagMedia = parity(
  "Tag (VChip) with an avatar (photo, blue-seeded initials) or an icon and remove, sm / md / lg",
  tagSizes
    .map(
      ([size, canon]) =>
        `<div style="display:flex;gap:8px;margin-bottom:8px"><v-chip size="${size}" prepend-avatar="avatars/person-1.svg" data-parity="tag-photo-${canon}">Ada Lovelace</v-chip><v-chip size="${size}" color="info" data-parity="tag-initials-${canon}"><v-avatar start color="info" variant="tonal" data-parity="avatar-initials-${canon}">GH</v-avatar>Grace Hopper</v-chip><v-chip size="${size}" prepend-icon="$success" closable data-parity="tag-icon-${canon}">Approved</v-chip></div>`,
    )
    .join(""),
  tagSizes
    .map(
      ([, canon]) =>
        `<div data-size="${canon}" style="display:flex;gap:8px;margin-bottom:8px"><span class="canon-tag" data-parity="tag-photo-${canon}"><span class="canon-avatar"><img class="canon-avatar-image" src="${location.origin}/avatars/person-1.svg" alt=""></span><span class="canon-tag-label">Ada Lovelace</span></span><span class="canon-tag" data-seed="0" data-parity="tag-initials-${canon}"><span class="canon-avatar" data-seed="0"><span class="canon-avatar-fallback" aria-hidden="true" data-parity="avatar-initials-${canon}">GH</span></span><span class="canon-tag-label">Grace Hopper</span></span><span class="canon-tag" data-parity="tag-icon-${canon}"><span class="canon-icon" data-icon="circle-check" aria-hidden="true"></span><span class="canon-tag-label">Approved</span><button type="button" class="canon-tag-remove" aria-label="Remove"></button></span></div>`,
    )
    .join(""),
);
