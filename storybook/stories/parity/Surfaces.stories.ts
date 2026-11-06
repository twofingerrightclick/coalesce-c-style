import type { Meta } from "@storybook/vue3-vite";
import { parity } from "./_parity";

export default { title: "Parity/Surfaces" } satisfies Meta;

export const Card = parity(
  "Card: header, description, action, body",
  `<v-card max-width="480" data-parity="card">
    <v-card-item><v-card-title data-parity="card-title">Billing details</v-card-title><v-card-subtitle data-parity="card-description">Where invoices go, and when they're due</v-card-subtitle>
      <template #append><v-btn prepend-icon="$edit">Edit</v-btn></template></v-card-item>
    <v-card-text data-parity="card-body">Company: Globex Corporation · Payment terms: Net 30</v-card-text>
  </v-card>`,
  `<section class="canon-card" style="max-width:480px" data-parity="card">
    <header class="canon-card-header"><h3 class="canon-card-title" data-parity="card-title">Billing details</h3><p class="canon-card-description" data-parity="card-description">Where invoices go, and when they're due</p>
      <div class="canon-card-actions"><button type="button" class="canon-button" data-emphasis="medium" data-intent="neutral"><span class="canon-icon" data-icon="pencil" aria-hidden="true"></span><span class="canon-button-label">Edit</span></button></div></header>
    <div class="canon-card-body" data-parity="card-body">Company: Globex Corporation · Payment terms: Net 30</div>
  </section>`,
);

const alerts = [
  ["info", "info", "Changes apply to new invoices only", "Invoices already sent keep the terms they were sent with."],
  ["success", "success", "Payment received", "Globex paid €12,400 on 14 October."],
  ["warning", "warning", "This invoice is overdue", "It was due on 3 October. Globex hasn't paid yet."],
  ["danger", "error", "The bank rejected this payment", "The account number doesn't match the one on file."],
  ["", undefined, "Exports run overnight", "Large exports arrive by email the next morning."],
];

export const Alert = parity(
  "Alert: intents and plain",
  `<div style="display:grid;gap:12px">${alerts
    .map(([i, t, title, text]) => `<v-alert${t ? ` type="${t}"` : ""} title="${title}" text="${text}" data-parity="alert-${i || "plain"}" />`)
    .join("")}</div>`,
  `<div style="display:grid;gap:12px">${alerts
    .map(([i, , title, text]) => `<div class="canon-alert"${i ? ` data-intent="${i}"` : ""} data-parity="alert-${i || "plain"}"><p class="canon-alert-title">${title}</p><p class="canon-alert-description">${text}</p></div>`)
    .join("")}</div>`,
);

const toasts = [
  ["success", "success", "Invoice saved"],
  ["danger", "error", "Couldn't save the invoice"],
  ["", undefined, "Link copied"],
];

export const Toast = parity(
  "Toast (VSnackbar)",
  `<div style="display:grid;gap:12px">${toasts
    .map(([i, c, title]) => `<div style="position:relative;height:64px"><v-snackbar :model-value="true" contained :timeout="-1" location="top left"${c ? ` color="${c}"` : ""} :content-props="{ 'data-parity': 'toast-${i || "plain"}' }">${title}<template #actions><v-btn icon="$close" size="small" aria-label="Dismiss" /></template></v-snackbar></div>`)
    .join("")}</div>`,
  `<div style="display:grid;gap:12px">${toasts
    .map(([i, , title]) => `<div class="canon-toast"${i ? ` data-intent="${i}"` : ""} data-parity="toast-${i || "plain"}"><p class="canon-toast-title">${title}</p><button type="button" class="canon-toast-close" aria-label="Dismiss"></button></div>`)
    .join("")}</div>`,
  `.canon-toast { position: static; }`,
);
