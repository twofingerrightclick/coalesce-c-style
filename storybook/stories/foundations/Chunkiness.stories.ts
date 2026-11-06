import type { Meta } from "@storybook/vue3-vite";
import { parity } from "../parity/_parity";

export default { title: "Foundations/Chunkiness" } satisfies Meta;

// Plan M6: default-prop Vuetify controls beside their Canon equivalents at
// each side's default size (Canon md; sm for its tag).
const row = "display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px";

export const Chunkiness = parity(
  "Controls at the default size",
  `<div style="${row}">
    <v-btn data-parity="btn-text">Save</v-btn>
    <v-btn prepend-icon="$plus" data-parity="btn-icon-text">Create</v-btn>
    <v-btn icon="$edit" aria-label="Edit" data-parity="btn-icon" />
  </div>
  <div style="display:grid;gap:16px;max-width:320px;margin-bottom:16px">
    <v-text-field model-value="Text" prepend-inner-icon="$search" clearable hide-details data-parity="text-input" />
    <v-select :items="['Option 1', 'Option 2']" model-value="Option 1" hide-details data-parity="select" />
  </div>
  <div style="${row}">
    <v-checkbox label="Checkbox" :model-value="true" hide-details data-parity="checkbox" />
    <v-switch label="Switch" :model-value="true" hide-details data-parity="switch" />
  </div>
  <div style="max-width:264px;margin-bottom:16px"><v-list nav><v-list-item prepend-icon="$info" title="Inbox" data-parity="list-item" /></v-list></div>
  <div style="${row}"><v-chip prepend-icon="$info" data-parity="chip">Tag</v-chip></div>
  <div style="margin-bottom:16px"><v-alert type="info" title="Alert title" text="Alert description." data-parity="alert" /></div>
  <div style="margin-bottom:16px"><v-tabs :model-value="0"><v-tab data-parity="tab">Overview</v-tab><v-tab>Activity</v-tab></v-tabs></div>
  <div style="margin-bottom:16px"><v-pagination :model-value="2" :length="3" data-parity="pagination" /></div>
  <v-data-table :headers="[{ title: 'User', key: 'user' }, { title: 'Amount', key: 'amount' }]" :items="[{ user: 'Edwin Mueller', amount: '$495.90' }]" hide-default-footer data-parity="data-table" />`,
  `<div style="${row}">
    <button type="button" class="canon-button" data-parity="btn-text"><span class="canon-button-label">Save</span></button>
    <button type="button" class="canon-button" data-parity="btn-icon-text"><span class="canon-icon" data-icon="plus" aria-hidden="true"></span><span class="canon-button-label">Create</span></button>
    <button type="button" class="canon-button" data-display="icon" data-parity="btn-icon"><span class="canon-icon" data-icon="pencil" aria-hidden="true"></span><span class="canon-button-label">Edit</span></button>
  </div>
  <div style="display:grid;gap:16px;max-width:320px;margin-bottom:16px">
    <div class="canon-text-input" data-parity="text-input"><span class="canon-icon" data-icon="search" aria-hidden="true"></span><input type="text" aria-label="Text" placeholder value="Text"></div>
    <div class="canon-select" data-parity="select"><select aria-label="Select"><option selected>Option 1</option><option>Option 2</option></select></div>
  </div>
  <div style="${row}">
    <div class="canon-choice" data-parity="checkbox"><input type="checkbox" id="k1" checked><label class="canon-choice-label" for="k1">Checkbox</label></div>
    <div class="canon-choice" data-parity="switch"><input type="checkbox" role="switch" id="k2" checked><label class="canon-choice-label" for="k2">Switch</label></div>
  </div>
  <nav class="canon-nav-list" style="max-width:264px;margin-bottom:16px"><ul><li><a class="canon-nav-list-item" href="#" data-parity="list-item"><span class="canon-icon" data-icon="mail" aria-hidden="true"></span><span class="canon-nav-list-label">Inbox</span></a></li></ul></nav>
  <div style="${row}"><span class="canon-tag" data-parity="chip"><span class="canon-icon" data-icon="info" aria-hidden="true"></span><span class="canon-tag-label">Tag</span></span></div>
  <div class="canon-alert" data-intent="info" style="margin-bottom:16px" data-parity="alert"><p class="canon-alert-title">Alert title</p><p class="canon-alert-description">Alert description.</p></div>
  <div class="canon-tabs" style="margin-bottom:16px"><div class="canon-tabs-list" role="tablist"><button type="button" class="canon-tab" role="tab" aria-selected="true" data-parity="tab"><span class="canon-tab-label">Overview</span></button><button type="button" class="canon-tab" role="tab" aria-selected="false"><span class="canon-tab-label">Activity</span></button></div></div>
  <nav class="canon-pagination" aria-label="Pagination" style="margin-bottom:16px" data-parity="pagination"><ol><li><a href="#">1</a></li><li><a href="#" aria-current="page">2</a></li><li><a href="#">3</a></li></ol></nav>
  <div class="canon-table" data-parity="data-table"><table><thead><tr><th scope="col" aria-sort="none">User</th><th scope="col" aria-sort="none">Amount</th></tr></thead><tbody><tr><th scope="row">Edwin Mueller</th><td>$495.90</td></tr></tbody></table></div>`,
);
