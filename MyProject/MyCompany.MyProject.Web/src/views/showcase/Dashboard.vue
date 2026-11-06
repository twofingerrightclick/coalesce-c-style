<template>
  <v-container max-width="1280px" class="py-6">
    <header class="d-flex flex-wrap align-center ga-3 mb-6">
      <div class="flex-grow-1">
        <v-breadcrumbs :items="crumbs" class="pa-0 mb-1" density="compact" />
        <h1 class="text-headline-medium">Dashboard</h1>
        <div class="text-body-medium text-medium-emphasis">
          {{ list.$count.result ?? "…" }} widgets across
          {{ categoryRows.length }} categories · updated
          {{ lastUpdated }}
        </div>
      </div>
      <v-btn color="neutral" prepend-icon="fa fa-download">Export</v-btn>
      <v-btn color="neutral" prepend-icon="$loading" @click="reload">
        Refresh
      </v-btn>
      <v-btn variant="flat" prepend-icon="$plus" to="/workspace?new=1">
        New widget
      </v-btn>
    </header>

    <v-alert
      v-if="undatedCount > 0"
      type="warning"
      title="Some widgets have no invention date"
      class="mb-6"
      closable
    >
      {{ undatedCount }} widgets are missing an invention date, so they're left
      out of the timeline report.
      <template #append>
        <v-btn size="small" to="/workspace">Review</v-btn>
      </template>
    </v-alert>

    <v-row>
      <v-col v-for="stat in stats" :key="stat.label" cols="12" sm="6" lg="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <span class="text-label-large text-medium-emphasis">
                {{ stat.label }}
              </span>
              <v-icon :icon="stat.icon" class="text-medium-emphasis" />
            </div>
            <div class="text-headline-large mt-2">{{ stat.value }}</div>
            <div class="d-flex align-center ga-2 mt-2">
              <v-chip :color="stat.intent" size="small" label>
                {{ stat.change }}
              </v-chip>
              <span class="text-body-small text-medium-emphasis">
                {{ stat.period }}
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" lg="8">
        <v-card>
          <v-tabs v-model="tab">
            <v-tab value="recent">Recently modified</v-tab>
            <v-tab value="categories">By category</v-tab>
            <v-tab value="archived">Archived</v-tab>
          </v-tabs>
          <v-divider />

          <v-tabs-window v-model="tab">
            <v-tabs-window-item value="recent">
              <c-loader-status
                :loaders="{ 'no-initial-content': [list.$load] }"
                :progress-placeholder="false"
              >
                <v-data-table
                  :headers="headers"
                  :items="recentRows"
                  :loading="list.$load.isLoading"
                  item-value="widgetId"
                  hover
                  hide-default-footer
                  :items-per-page="-1"
                >
                  <template #[`item.name`]="{ item }">
                    <router-link :to="`/workspace/${item.widgetId}`">
                      {{ item.name }}
                    </router-link>
                  </template>
                  <template #[`item.category`]="{ item }">
                    <v-chip
                      :color="categoryColor(item.category)"
                      size="small"
                      label
                    >
                      <c-display :model="item" for="category" />
                    </v-chip>
                  </template>
                  <template #[`item.inventedOn`]="{ item }">
                    <c-display
                      :model="item"
                      for="inventedOn"
                      format="d MMM yyyy"
                    />
                  </template>
                  <template #[`item.modifiedOn`]="{ item }">
                    <div class="d-flex align-center ga-2">
                      <v-avatar size="24" color="primary" variant="tonal">
                        <span class="text-caption">DU</span>
                      </v-avatar>
                      {{ relative(item.modifiedOn) }}
                    </div>
                  </template>
                  <template #[`item.actions`]="{ item }">
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon="fa fa-ellipsis-h"
                          size="small"
                          :aria-label="`Actions for ${item.name}`"
                        />
                      </template>
                      <v-list>
                        <v-list-item
                          title="Open"
                          prepend-icon="fa fa-external-link-alt"
                          :to="`/workspace/${item.widgetId}`"
                        />
                        <v-list-item
                          title="Edit in admin"
                          prepend-icon="$edit"
                          :to="`/admin/Widget/edit/${item.widgetId}`"
                        />
                        <v-divider class="my-1" />
                        <v-list-item
                          title="Delete"
                          prepend-icon="fa fa-trash-alt"
                          base-color="error"
                          :to="`/workspace/${item.widgetId}?delete=1`"
                        />
                      </v-list>
                    </v-menu>
                  </template>
                </v-data-table>
              </c-loader-status>
              <v-divider />
              <div class="d-flex align-center pa-3 ga-3">
                <c-list-page-size :list="list" :items="[5, 10, 25]" />
                <v-spacer />
                <v-btn variant="text" append-icon="$next" to="/workspace">
                  View all widgets
                </v-btn>
              </div>
            </v-tabs-window-item>

            <v-tabs-window-item value="categories">
              <v-list lines="two" class="py-2">
                <v-list-item
                  v-for="row in categoryRows"
                  :key="row.value"
                  :title="row.label"
                >
                  <template #prepend>
                    <v-avatar :color="categoryColor(row.value)" variant="tonal">
                      {{ row.label[0] }}
                    </v-avatar>
                  </template>
                  <v-list-item-subtitle>
                    {{ row.count }} widgets · {{ row.share }}% of all
                  </v-list-item-subtitle>
                  <v-progress-linear
                    :model-value="row.share"
                    :color="categoryColor(row.value)"
                    class="mt-2"
                    rounded
                  />
                </v-list-item>
              </v-list>
            </v-tabs-window-item>

            <v-tabs-window-item value="archived">
              <v-empty-state
                icon="fa fa-clipboard-list"
                title="No archived widgets"
                text="Widgets you archive are kept here for 90 days before they're deleted."
              >
                <template #actions>
                  <v-btn color="neutral" to="/workspace">Go to widgets</v-btn>
                </template>
              </v-empty-state>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4" class="d-flex flex-column ga-6">
        <v-card
          title="Inventory health"
          subtitle="Share of widgets fully described"
        >
          <v-card-text class="d-flex align-center ga-6">
            <v-progress-circular
              :model-value="describedShare"
              size="88"
              width="8"
              color="success"
            >
              <span class="text-title-medium">{{ describedShare }}%</span>
            </v-progress-circular>
            <div class="d-flex flex-column ga-2 text-body-medium">
              <div class="d-flex align-center ga-2">
                <v-badge dot color="success" inline />
                {{ (list.$count.result ?? 0) - undatedCount }} complete
              </div>
              <div class="d-flex align-center ga-2">
                <v-badge dot color="warning" inline />
                {{ undatedCount }} missing a date
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-item>
            <v-card-title>Team</v-card-title>
            <v-card-subtitle>5 people can edit widgets</v-card-subtitle>
            <template #append>
              <v-btn size="small" color="neutral" prepend-icon="$plus">
                Invite
              </v-btn>
            </template>
          </v-card-item>
          <v-list>
            <v-list-item
              v-for="person in people"
              :key="person.name"
              :title="person.name"
              :subtitle="person.role"
            >
              <template #prepend>
                <v-badge
                  dot
                  location="bottom end"
                  :color="person.online ? 'success' : 'neutral'"
                >
                  <v-avatar :color="person.color" variant="tonal">
                    {{ initials(person.name) }}
                  </v-avatar>
                </v-badge>
              </template>
              <template #append>
                <v-chip v-if="person.owner" size="small" variant="outlined">
                  Owner
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card title="Recent activity">
          <v-list density="compact" lines="two">
            <v-list-item
              v-for="event in activity"
              :key="event.text"
              :title="event.text"
              :subtitle="event.when"
            >
              <template #prepend>
                <v-icon :icon="event.icon" :color="event.color" />
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { formatDistanceToNow } from "date-fns";
import { WidgetCategory } from "@/models.g";
import { WidgetListViewModel } from "@/viewmodels.g";

useTitle("Dashboard");

const crumbs = [
  { title: "Home", to: "/" },
  { title: "Dashboard", disabled: true },
];

const tab = ref("recent");

const list = new WidgetListViewModel();
list.$params.orderByDescending = "ModifiedOn";
list.$pageSize = 5;
list.$useAutoLoad({ immediate: true });
list.$count();

// Category totals and the "missing a date" count need every row, not just a page.
const all = new WidgetListViewModel();
all.$pageSize = 500;
all.$load();

const recentRows = computed(() => list.$items);

const undatedCount = computed(
  () => all.$items.filter((w) => !w.inventedOn).length,
);
const describedShare = computed(() =>
  all.$items.length
    ? Math.round(
        ((all.$items.length - undatedCount.value) / all.$items.length) * 100,
      )
    : 0,
);

const categoryRows = computed(() =>
  Object.entries(WidgetCategory)
    .filter(([, v]) => typeof v === "number")
    .map(([label, value]) => {
      const count = all.$items.filter((w) => w.category === value).length;
      return {
        label,
        value: value as WidgetCategory,
        count,
        share: all.$items.length
          ? Math.round((count / all.$items.length) * 100)
          : 0,
      };
    }),
);

const lastUpdated = computed(() => relative(all.$items[0]?.modifiedOn));

const stats = computed(() => [
  {
    label: "Total widgets",
    value: list.$count.result ?? "—",
    icon: "fa fa-palette",
    change: "+4",
    intent: "success",
    period: "this week",
  },
  ...categoryRows.value.map((row) => ({
    label: row.label,
    value: row.count,
    icon: "fa fa-clipboard-list",
    change: `${row.share}%`,
    intent: categoryColor(row.value),
    period: "of inventory",
  })),
]);

const headers = [
  { title: "Name", key: "name" },
  { title: "Category", key: "category" },
  { title: "Invented", key: "inventedOn" },
  { title: "Modified", key: "modifiedOn" },
  { title: "", key: "actions", align: "end" as const, sortable: false },
];

const people = [
  {
    name: "Ada Lovelace",
    role: "Administrator",
    color: "primary",
    online: true,
    owner: true,
  },
  {
    name: "Grace Hopper",
    role: "Editor",
    color: "success",
    online: true,
    owner: false,
  },
  {
    name: "Alan Turing",
    role: "Editor",
    color: "warning",
    online: false,
    owner: false,
  },
  {
    name: "Katherine Johnson",
    role: "Viewer",
    color: "error",
    online: false,
    owner: false,
  },
];

const activity = [
  {
    icon: "$success",
    color: "success",
    text: "Grace published Velvet Valve",
    when: "12 minutes ago",
  },
  {
    icon: "$edit",
    color: undefined,
    text: "Ada renamed Neon Nozzle's category",
    when: "1 hour ago",
  },
  {
    icon: "$warning",
    color: "warning",
    text: "Import skipped 2 rows without a name",
    when: "Yesterday",
  },
  {
    icon: "fa fa-trash-alt",
    color: "error",
    text: "Alan deleted Rusty Ratchet",
    when: "3 days ago",
  },
];

function categoryColor(category: WidgetCategory | null) {
  switch (category) {
    case WidgetCategory.Whizbangs:
      return "primary";
    case WidgetCategory.Sprecklesprockets:
      return "success";
    case WidgetCategory.Discombobulators:
      return "warning";
    default:
      return "neutral";
  }
}

function relative(date: Date | null | undefined) {
  return date ? formatDistanceToNow(date, { addSuffix: true }) : "—";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

function reload() {
  list.$load();
  all.$load();
}
</script>
