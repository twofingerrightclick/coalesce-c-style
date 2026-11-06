import type { Meta } from "@storybook/vue3-vite";
import { ref } from "vue";
import { parity } from "./_parity";

export default { title: "Parity/Navigation" } satisfies Meta;

export const NavList = parity(
  "Nav List",
  `<v-list nav style="max-width:264px" data-parity="nav">
    <v-list-item prepend-icon="$info" title="Inbox" active data-parity="nav-current"><template #append><v-badge inline content="12" /></template></v-list-item>
    <v-list-item prepend-icon="$complete" title="My issues" data-parity="nav-item" />
    <v-list-item prepend-icon="$calendar" title="Calendar" />
    <v-list-subheader data-parity="nav-heading">Teams</v-list-subheader>
    <v-list-item prepend-icon="fa fa-cogs" title="Engineering" />
  </v-list>`,
  `<nav class="canon-nav-list" aria-label="Workspace" style="max-width:264px" data-parity="nav"><ul>
    <li><a class="canon-nav-list-item" href="#" aria-current="page" data-parity="nav-current"><span class="canon-icon" data-icon="mail" aria-hidden="true"></span><span class="canon-nav-list-label">Inbox</span><span class="canon-count">12</span></a></li>
    <li><a class="canon-nav-list-item" href="#" data-parity="nav-item"><span class="canon-icon" data-icon="circle-check" aria-hidden="true"></span><span class="canon-nav-list-label">My issues</span></a></li>
    <li><a class="canon-nav-list-item" href="#"><span class="canon-icon" data-icon="calendar" aria-hidden="true"></span><span class="canon-nav-list-label">Calendar</span></a></li>
  </ul><p class="canon-nav-list-heading" data-parity="nav-heading">Teams</p><ul>
    <li><a class="canon-nav-list-item" href="#"><span class="canon-icon" data-icon="settings" aria-hidden="true"></span><span class="canon-nav-list-label">Engineering</span></a></li>
  </ul></nav>`,
);

export const Tabs = parity(
  "Tabs",
  `<v-tabs v-model="tab" data-parity="tabs"><v-tab value="o" data-parity="tab-selected">Overview</v-tab><v-tab value="p" data-parity="tab">Payments</v-tab><v-tab value="a">Activity</v-tab></v-tabs>`,
  `<div class="canon-tabs"><div class="canon-tabs-list" role="tablist" data-parity="tabs">
    <button type="button" class="canon-tab" role="tab" aria-selected="true" data-parity="tab-selected"><span class="canon-tab-label">Overview</span></button>
    <button type="button" class="canon-tab" role="tab" aria-selected="false" tabindex="-1" data-parity="tab"><span class="canon-tab-label">Payments</span></button>
    <button type="button" class="canon-tab" role="tab" aria-selected="false" tabindex="-1"><span class="canon-tab-label">Activity</span></button>
  </div></div>`,
  "",
  () => ({ tab: ref("o") }),
);
