<template>
  <v-container max-width="1280px" class="py-6">
    <header class="mb-6">
      <v-breadcrumbs :items="crumbs" class="pa-0 mb-1" />
      <h1 class="text-headline-medium">Components</h1>
      <div class="text-body-medium text-medium-emphasis">
        Overlays, navigation and display pieces the other pages don't use.
      </div>
    </header>

    <div class="gallery">
      <v-card title="Menus" data-gallery="menus">
        <v-card-text class="d-flex flex-wrap ga-2">
          <v-menu>
            <template #activator="{ props }">
              <v-btn v-bind="props" append-icon="$dropdown" color="neutral">
                Sort by
              </v-btn>
            </template>
            <v-list
              v-model:selected="sort"
              select-strategy="single-independent"
            >
              <v-list-subheader>Sort widgets</v-list-subheader>
              <v-list-item title="Name" value="name" />
              <v-list-item title="Category" value="category" />
              <v-list-item title="Last modified" value="modified" />
            </v-list>
          </v-menu>
          <v-menu>
            <template #activator="{ props }">
              <v-btn v-bind="props" icon="fa fa-ellipsis-h" aria-label="More" />
            </template>
            <v-list>
              <v-list-item title="Edit" prepend-icon="$edit">
                <template #append><v-kbd>E</v-kbd></template>
              </v-list-item>
              <v-list-item title="Download" prepend-icon="fa fa-download" />
              <v-list-item
                title="Share"
                prepend-icon="fa fa-external-link-alt"
                disabled
              />
              <v-divider class="my-1" />
              <v-list-item
                title="Delete"
                prepend-icon="fa fa-trash-alt"
                base-color="error"
              />
            </v-list>
          </v-menu>
          <v-menu :close-on-content-click="false">
            <template #activator="{ props }">
              <v-btn v-bind="props" prepend-icon="fa fa-filter" color="neutral">
                Filters
              </v-btn>
            </template>
            <v-card min-width="280" title="Filter widgets">
              <v-card-text>
                <v-checkbox
                  v-for="c in categories"
                  :key="c"
                  :label="c"
                  hide-details
                />
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn>Apply</v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </v-card-text>
      </v-card>

      <v-card title="Tooltips and badges" data-gallery="tooltips">
        <v-card-text class="d-flex flex-wrap align-center ga-6">
          <v-tooltip text="Save changes (Ctrl+S)">
            <template #activator="{ props }">
              <v-btn v-bind="props" icon="fa fa-save" aria-label="Save" />
            </template>
          </v-tooltip>
          <v-tooltip
            text="Always-on tooltip"
            :model-value="true"
            location="bottom"
          >
            <template #activator="{ props }">
              <v-btn v-bind="props" color="neutral">Pinned tip</v-btn>
            </template>
          </v-tooltip>
          <v-badge content="12" color="error">
            <v-icon icon="$info" />
          </v-badge>
          <v-badge dot color="success">
            <v-avatar color="primary" variant="tonal">AL</v-avatar>
          </v-badge>
          <v-badge content="New" color="primary" inline />
          <v-badge content="99+" color="warning" inline />
        </v-card-text>
      </v-card>

      <v-card title="Chips" data-gallery="chips">
        <v-card-text>
          <v-chip-group v-model="chipFilter" column multiple filter>
            <v-chip v-for="c in categories" :key="c" :value="c">{{ c }}</v-chip>
          </v-chip-group>
          <div class="d-flex flex-wrap ga-2 mt-2">
            <v-chip color="success" label prepend-icon="$success"
              >Active</v-chip
            >
            <v-chip color="warning" label>Pending</v-chip>
            <v-chip color="error" label>Overdue</v-chip>
            <v-chip color="info" variant="outlined" label>Draft</v-chip>
            <v-chip closable>brass</v-chip>
            <v-chip size="large">Large</v-chip>
            <v-chip pill>
              <v-avatar start color="primary" variant="tonal">G</v-avatar>
              Grace
            </v-chip>
          </div>
        </v-card-text>
      </v-card>

      <v-card title="Avatars" data-gallery="avatars">
        <v-card-text class="d-flex flex-wrap align-center ga-3">
          <v-avatar size="x-small" color="primary">A</v-avatar>
          <v-avatar size="small" color="success" variant="tonal">GH</v-avatar>
          <v-avatar color="warning" variant="tonal">AT</v-avatar>
          <v-avatar size="large" color="neutral" variant="tonal">KJ</v-avatar>
          <v-avatar rounded="lg" color="error" variant="tonal">
            <v-icon icon="fa fa-palette" />
          </v-avatar>
          <div class="avatar-stack d-flex">
            <v-avatar
              v-for="n in ['AL', 'GH', 'AT', 'KJ']"
              :key="n"
              color="primary"
              variant="tonal"
              border
            >
              {{ n }}
            </v-avatar>
          </div>
        </v-card-text>
      </v-card>

      <v-card title="Stepper" class="span-2" data-gallery="stepper">
        <v-stepper
          v-model="step"
          :items="['Details', 'Category', 'Review']"
          flat
        >
          <template #[`item.1`]>
            <v-text-field label="Widget name" model-value="Brass Bellows" />
          </template>
          <template #[`item.2`]>
            <v-radio-group model-value="Whizbangs" label="Category">
              <v-radio v-for="c in categories" :key="c" :label="c" :value="c" />
            </v-radio-group>
          </template>
          <template #[`item.3`]>
            <v-alert
              type="info"
              text="Brass Bellows will be added to Whizbangs."
            />
          </template>
        </v-stepper>
      </v-card>

      <v-card title="Timeline" data-gallery="timeline">
        <v-card-text>
          <v-timeline density="compact" side="end" align="start">
            <v-timeline-item
              v-for="e in timeline"
              :key="e.title"
              :dot-color="e.color"
              size="small"
            >
              <div class="text-body-medium font-weight-medium">
                {{ e.title }}
              </div>
              <div class="text-body-small text-medium-emphasis">
                {{ e.when }}
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>

      <v-card title="Date picker" data-gallery="date">
        <v-date-picker v-model="date" show-adjacent-months />
      </v-card>

      <v-card title="Loading states" data-gallery="loading">
        <v-card-text>
          <v-skeleton-loader type="list-item-avatar-two-line" />
          <v-skeleton-loader type="paragraph" />
          <div class="d-flex align-center ga-4 mt-4">
            <v-progress-circular indeterminate />
            <v-progress-circular indeterminate color="neutral" />
            <v-progress-linear indeterminate />
          </div>
          <v-progress-linear :model-value="66" buffer-value="80" class="mt-4" />
        </v-card-text>
      </v-card>

      <v-card title="Ratings, OTP, file" data-gallery="inputs">
        <v-card-text>
          <v-rating v-model="rating" hover half-increments />
          <v-otp-input v-model="otp" length="6" class="mt-2" />
          <v-file-input label="Attach spec sheet" class="mt-2" />
        </v-card-text>
      </v-card>

      <v-card title="Slide group" class="span-2" data-gallery="slides">
        <v-slide-group v-model="slide" show-arrows class="pa-3">
          <v-slide-group-item
            v-for="n in 12"
            :key="n"
            v-slot="{ isSelected, toggle }"
          >
            <v-card
              :color="isSelected ? 'primary' : undefined"
              class="ma-2 d-flex align-center justify-center"
              height="80"
              width="120"
              variant="tonal"
              @click="toggle"
            >
              Widget {{ n }}
            </v-card>
          </v-slide-group-item>
        </v-slide-group>
      </v-card>

      <v-card title="Pagination" data-gallery="pagination">
        <v-card-text>
          <v-pagination v-model="page" :length="12" />
          <v-pagination
            v-model="page"
            :length="12"
            density="compact"
            variant="outlined"
            rounded
            class="mt-2"
          />
        </v-card-text>
      </v-card>

      <v-card title="Banner and sheet" class="span-2" data-gallery="banner">
        <v-banner
          lines="two"
          icon="$info"
          text="A new import format is available. Existing imports keep working."
        >
          <template #actions>
            <v-btn variant="text">Learn more</v-btn>
            <v-btn variant="text">Dismiss</v-btn>
          </template>
        </v-banner>
        <v-sheet class="ma-4 pa-4" border rounded>
          Sheet with a border, for grouping without elevation.
        </v-sheet>
      </v-card>

      <v-card title="Alerts" class="span-2" data-gallery="alerts">
        <v-card-text class="d-flex flex-column ga-3">
          <v-alert
            type="info"
            title="Heads up"
            text="Maintenance on Sunday from 02:00 to 03:00 UTC."
          />
          <v-alert
            type="success"
            text="All 40 widgets were imported."
            closable
          />
          <v-alert
            type="warning"
            title="Near your plan's limit"
            text="You've used 92% of your storage."
          />
          <v-alert
            type="error"
            title="Import failed"
            text="Row 12 has no name."
          />
          <v-alert text="An alert without a type." />
          <v-alert type="info" variant="tonal" text="A tonal info alert." />
        </v-card-text>
      </v-card>

      <v-card title="Lists" data-gallery="lists">
        <v-list density="compact">
          <v-list-subheader>Recent</v-list-subheader>
          <v-list-item
            title="Velvet Valve"
            subtitle="Discombobulators"
            prepend-icon="fa fa-palette"
            link
          />
          <v-list-item
            title="Neon Nozzle"
            subtitle="Sprecklesprockets"
            prepend-icon="fa fa-palette"
            link
            active
          />
          <v-list-group value="more">
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                title="More widgets"
                prepend-icon="fa fa-columns"
              />
            </template>
            <v-list-item title="Brass Bellows" link />
            <v-list-item title="Copper Coil" link />
          </v-list-group>
        </v-list>
      </v-card>

      <v-card title="Window + item group" data-gallery="window">
        <v-card-text>
          <v-btn-toggle v-model="windowStep" mandatory class="mb-3">
            <v-btn :value="0">Summary</v-btn>
            <v-btn :value="1">Specs</v-btn>
          </v-btn-toggle>
          <v-window v-model="windowStep">
            <v-window-item :value="0">
              <p class="text-body-medium">
                The Brass Bellows moves air through a tuned chamber.
              </p>
            </v-window-item>
            <v-window-item :value="1">
              <v-table density="compact">
                <tbody>
                  <tr>
                    <td>Weight</td>
                    <td>1.2 kg</td>
                  </tr>
                  <tr>
                    <td>Material</td>
                    <td>Brass</td>
                  </tr>
                </tbody>
              </v-table>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>

      <v-card title="Dialog and toast" data-gallery="overlays">
        <v-card-text class="d-flex flex-wrap ga-2">
          <v-dialog max-width="480">
            <template #activator="{ props }">
              <v-btn v-bind="props" color="neutral" data-open="dialog"
                >Open dialog</v-btn
              >
            </template>
            <template #default="{ isActive }">
              <v-card
                title="Archive 3 widgets?"
                text="Archived widgets are hidden from the list and kept for 90 days."
              >
                <v-card-actions>
                  <v-spacer />
                  <v-btn color="neutral" @click="isActive.value = false"
                    >Cancel</v-btn
                  >
                  <v-btn variant="flat" @click="isActive.value = false"
                    >Archive</v-btn
                  >
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
          <v-btn color="neutral" data-open="toast" @click="toast = true"
            >Show toast</v-btn
          >
          <v-btn color="neutral" @click="drawer = !drawer">Toggle drawer</v-btn>
        </v-card-text>
      </v-card>

      <v-card title="Speed dial" data-gallery="fab">
        <v-card-text class="d-flex align-center ga-4">
          <v-speed-dial location="end center">
            <template #activator="{ props }">
              <v-fab v-bind="props" icon="$plus" />
            </template>
            <v-btn key="1" icon="$edit" />
            <v-btn key="2" icon="fa fa-download" />
          </v-speed-dial>
          <v-fab prepend-icon="$plus" extended text="New widget" />
        </v-card-text>
      </v-card>
    </div>

    <v-navigation-drawer v-model="drawer" location="end" temporary width="360">
      <v-toolbar title="Widget details">
        <v-btn icon="$close" @click="drawer = false" />
      </v-toolbar>
      <v-list>
        <v-list-item title="Name" subtitle="Brass Bellows" />
        <v-list-item title="Category" subtitle="Whizbangs" />
      </v-list>
    </v-navigation-drawer>

    <v-snackbar v-model="toast" :timeout="4000">
      3 widgets archived
      <template #actions>
        <v-btn variant="text" @click="toast = false">Undo</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
useTitle("Components");

const crumbs = [
  { title: "Home", to: "/" },
  { title: "Showcase", to: "/dashboard" },
  { title: "Components", disabled: true },
];

const categories = ["Whizbangs", "Sprecklesprockets", "Discombobulators"];
const sort = ref(["modified"]);
const chipFilter = ref(["Whizbangs"]);
const step = ref(2);
const date = ref(new Date(2026, 10, 6));
const rating = ref(3.5);
const otp = ref("4821");
const slide = ref(2);
const page = ref(4);
const windowStep = ref(0);
const toast = ref(false);
const drawer = ref(false);

const timeline = [
  { title: "Widget created", when: "3 Nov, 09:12", color: "primary" },
  {
    title: "Category changed to Whizbangs",
    when: "4 Nov, 14:40",
    color: "neutral",
  },
  { title: "Low stock warning", when: "5 Nov, 08:03", color: "warning" },
  { title: "Restocked", when: "6 Nov, 10:30", color: "success" },
];
</script>

<style lang="scss" scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
  align-items: start;
}

.span-2 {
  grid-column: span 2;
}

.avatar-stack > * + * {
  margin-inline-start: -8px;
}
</style>
