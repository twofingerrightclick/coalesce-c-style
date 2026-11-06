<template>
  <v-container max-width="1120px" class="py-6">
    <header class="mb-6">
      <h1 class="text-headline-medium">Settings</h1>
      <div class="text-body-medium text-medium-emphasis">
        The Widget Works workspace, for everyone in it.
      </div>
    </header>

    <v-row>
      <v-col cols="12" md="3">
        <v-list nav class="settings-nav" density="compact">
          <v-list-item
            v-for="section in sections"
            :key="section.id"
            :title="section.title"
            :prepend-icon="section.icon"
            :active="active === section.id"
            :href="`#${section.id}`"
            @click="active = section.id"
          />
        </v-list>
      </v-col>

      <v-col cols="12" md="9">
        <v-form ref="form" v-model="valid" @submit.prevent="save">
          <v-card id="general" class="mb-6">
            <v-card-item
              title="General"
              subtitle="The workspace's name, where it is, and how its widgets are labelled."
            />
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="workspace.name"
                    label="Workspace name"
                    :rules="[required, maxLength(40)]"
                    counter="40"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="workspace.slug"
                    label="Address"
                    suffix=".widgets.app"
                    hint="Links to the workspace stop working when it changes."
                    persistent-hint
                    :rules="[required, slug]"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="workspace.description"
                    label="Description"
                    placeholder="What this workspace is for"
                    rows="3"
                    auto-grow
                    counter="200"
                    :rules="[maxLength(200)]"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="workspace.email"
                    label="Billing email"
                    type="email"
                    :rules="[required, email]"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="workspace.apiKey"
                    label="API key"
                    :type="showKey ? 'text' : 'password'"
                    readonly
                    :append-inner-icon="
                      showKey ? 'fa fa-eye-slash' : 'fa fa-eye'
                    "
                    @click:append-inner="showKey = !showKey"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card id="region" class="mb-6">
            <v-card-item
              title="Region"
              subtitle="Dates and amounts, for everyone in the workspace."
            />
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-autocomplete
                    v-model="workspace.timeZone"
                    label="Time zone"
                    :items="timeZones"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="workspace.currency"
                    label="Currency"
                    :items="currencies"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="workspace.dateFormat"
                    label="Date format"
                    :items="dateFormats"
                    item-title="title"
                    item-value="value"
                  >
                    <template #item="{ props: itemProps, item }">
                      <v-list-item
                        v-bind="itemProps"
                        :subtitle="item.example"
                      />
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-number-input
                    v-model="workspace.fiscalStart"
                    label="Fiscal year starts (month)"
                    :min="1"
                    :max="12"
                  />
                </v-col>
                <v-col cols="12">
                  <div class="text-label-large mb-2">First day of the week</div>
                  <v-btn-toggle v-model="workspace.weekStart" mandatory>
                    <v-btn value="sat">Saturday</v-btn>
                    <v-btn value="sun">Sunday</v-btn>
                    <v-btn value="mon">Monday</v-btn>
                  </v-btn-toggle>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card id="widgets" class="mb-6">
            <v-card-item
              title="Widgets"
              subtitle="Defaults for new widgets and how they're catalogued."
            />
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="workspace.defaultCategory"
                    label="Default category"
                    :items="categories"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-combobox
                    v-model="workspace.tags"
                    label="Suggested tags"
                    :items="tagSuggestions"
                    multiple
                    chips
                    closable-chips
                    hint="Type a new tag and press Enter"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-autocomplete
                    v-model="workspace.reviewers"
                    label="Reviewers"
                    :items="people"
                    multiple
                    chips
                    closable-chips
                    :rules="[
                      (v: string[]) =>
                        v.length > 0 || 'Pick at least one reviewer',
                    ]"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <c-datetime-picker
                    v-model="workspace.catalogueDate"
                    date-kind="date"
                    label="Next catalogue review"
                  />
                </v-col>
                <v-col cols="12">
                  <div class="text-label-large">Low-stock threshold</div>
                  <div class="text-body-small text-medium-emphasis mb-2">
                    Warn when fewer than {{ workspace.threshold }} units remain.
                  </div>
                  <v-slider
                    v-model="workspace.threshold"
                    :min="0"
                    :max="100"
                    :step="5"
                    thumb-label
                    show-ticks="always"
                    :ticks="[0, 25, 50, 75, 100]"
                  />
                </v-col>
                <v-col cols="12">
                  <div class="text-label-large mb-2">
                    Price range shown in reports
                  </div>
                  <v-range-slider
                    v-model="workspace.priceRange"
                    :min="0"
                    :max="1000"
                    :step="10"
                    thumb-label="always"
                    class="mt-6"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card id="notifications" class="mb-6">
            <v-card-item
              title="Notifications"
              subtitle="Switches take effect immediately."
            />
            <v-divider />
            <v-card-text>
              <v-switch
                v-model="workspace.notify.digest"
                label="Weekly digest"
                messages="A summary of changes every Monday morning."
              />
              <v-switch
                v-model="workspace.notify.mentions"
                label="Mentions"
                messages="When someone mentions you in a comment."
              />
              <v-switch
                v-model="workspace.notify.lowStock"
                label="Low stock"
                messages="When a widget drops below the threshold."
              />
              <v-switch
                label="Product news"
                disabled
                messages="Managed by your organisation."
              />

              <v-divider class="my-4" />
              <v-radio-group v-model="workspace.channel" label="Deliver to">
                <v-radio label="Email" value="email" />
                <v-radio label="Slack" value="slack" />
                <v-radio label="Both" value="both" />
              </v-radio-group>

              <div class="text-label-large mt-2 mb-1">Notify me about</div>
              <v-checkbox
                v-for="topic in topics"
                :key="topic"
                v-model="workspace.topics"
                :label="topic"
                :value="topic"
                hide-details
              />
              <v-checkbox
                v-model="workspace.terms"
                label="I agree to the notification policy"
                :rules="[
                  (v: boolean) => v || 'You need to agree before saving',
                ]"
                class="mt-2"
              />
            </v-card-text>
          </v-card>

          <v-expansion-panels id="advanced" class="mb-6" variant="accordion">
            <v-expansion-panel title="Advanced">
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="workspace.webhook"
                      label="Webhook URL"
                      placeholder="https://"
                      :rules="[url]"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="workspace.retention"
                      label="Keep audit logs for"
                      :items="['30 days', '90 days', '1 year', 'Forever']"
                    />
                  </v-col>
                </v-row>
                <v-checkbox
                  v-model="workspace.betaFeatures"
                  label="Try features before they're released"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel title="Data export">
              <v-expansion-panel-text>
                Download every widget as CSV or JSON. Large workspaces are
                emailed when ready.
                <div class="d-flex ga-2 mt-3">
                  <v-btn color="neutral" prepend-icon="fa fa-download"
                    >CSV</v-btn
                  >
                  <v-btn color="neutral" prepend-icon="fa fa-download"
                    >JSON</v-btn
                  >
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-card id="danger" class="mb-6">
            <v-card-item
              title="Delete workspace"
              subtitle="Removes every widget and member. This can't be undone."
            >
              <template #append>
                <v-btn color="error" @click="confirmDelete = true">
                  Delete workspace
                </v-btn>
              </template>
            </v-card-item>
          </v-card>

          <v-card class="save-bar">
            <v-card-actions>
              <span v-if="!valid" class="text-body-medium text-error ml-2">
                Fix the highlighted fields before saving.
              </span>
              <span v-else class="text-body-medium text-medium-emphasis ml-2">
                Changes apply to everyone in the workspace.
              </span>
              <v-spacer />
              <v-btn color="neutral" @click="reset">Cancel</v-btn>
              <v-btn type="submit" variant="flat" :loading="saving">
                Save changes
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-col>
    </v-row>

    <v-dialog v-model="confirmDelete" max-width="480">
      <v-card title="Delete Widget Works?">
        <v-card-text>
          <p class="mb-4">
            Every widget, member and audit entry is removed. Type the workspace
            name to confirm.
          </p>
          <v-text-field
            v-model="confirmName"
            :label="`Type ${workspace.name}`"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="neutral" @click="confirmDelete = false">Cancel</v-btn>
          <v-btn
            color="error"
            variant="flat"
            :disabled="confirmName !== workspace.name"
          >
            Delete workspace
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="saved" color="success" prepend-icon="$success">
      Settings saved
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
useTitle("Settings");

const sections = [
  { id: "general", title: "General", icon: "fa fa-cogs" },
  { id: "region", title: "Region", icon: "$calendar" },
  { id: "widgets", title: "Widgets", icon: "fa fa-palette" },
  { id: "notifications", title: "Notifications", icon: "$info" },
  { id: "advanced", title: "Advanced", icon: "fa fa-lock" },
  { id: "danger", title: "Delete workspace", icon: "fa fa-trash-alt" },
];
const active = ref("general");

const initial = () => ({
  name: "Widget Works",
  // Invalid on purpose so the page opens showing a validation error.
  slug: "Widget Works!",
  description: "",
  email: "billing@widgetworks",
  apiKey: "sk_live_51HxQe2c9a7f",
  timeZone: "America/Los_Angeles",
  currency: "Dollar ($)",
  dateFormat: "d MMM yyyy",
  fiscalStart: 4,
  weekStart: "mon",
  defaultCategory: "Whizbangs",
  tags: ["brass", "prototype"],
  reviewers: ["Ada Lovelace"],
  catalogueDate: new Date(2026, 11, 1) as Date | null,
  threshold: 25,
  priceRange: [120, 640],
  notify: { digest: true, mentions: true, lowStock: false },
  channel: "email",
  topics: ["New widgets", "Deletions"],
  terms: false,
  webhook: "hooks.example.com/widgets",
  retention: "90 days",
  betaFeatures: false,
});
const workspace = ref(initial());

const form = useForm();
const valid = ref<boolean | null>(null);
const saving = ref(false);
const saved = ref(false);
const showKey = ref(false);
const confirmDelete = ref(false);
const confirmName = ref("");

async function save() {
  if (!(await form.value?.validate())?.valid) return;
  saving.value = true;
  setTimeout(() => {
    saving.value = false;
    saved.value = true;
  }, 600);
}

function reset() {
  workspace.value = initial();
}

const required = (v: unknown) => !!v || "Required";
const maxLength = (n: number) => (v: string) =>
  !v || v.length <= n || `At most ${n} characters`;
const slug = (v: string) =>
  /^[a-z0-9-]+$/.test(v) || "Use lowercase letters, numbers and dashes";
const email = (v: string) =>
  /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) || "Enter a valid email address";
const url = (v: string) =>
  !v || /^https?:\/\//.test(v) || "Start with http:// or https://";

const timeZones = [
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Europe/Istanbul",
  "Asia/Tokyo",
];
const currencies = ["Dollar ($)", "Euro (€)", "Pound (£)", "Yen (¥)"];
const dateFormats = [
  { title: "Day Month Year", value: "d MMM yyyy", example: "6 Nov 2026" },
  { title: "Month Day, Year", value: "MMM d, yyyy", example: "Nov 6, 2026" },
  { title: "ISO", value: "yyyy-MM-dd", example: "2026-11-06" },
];
const categories = ["Whizbangs", "Sprecklesprockets", "Discombobulators"];
const tagSuggestions = ["brass", "prototype", "patented", "vintage", "fragile"];
const people = [
  "Ada Lovelace",
  "Grace Hopper",
  "Alan Turing",
  "Katherine Johnson",
];
const topics = ["New widgets", "Category changes", "Deletions", "Imports"];
</script>

<style lang="scss" scoped>
.settings-nav {
  position: sticky;
  top: 64px;
}

.save-bar {
  position: sticky;
  bottom: 16px;
  z-index: 1;
}
</style>
