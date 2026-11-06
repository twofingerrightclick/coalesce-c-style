<template>
  <v-container fluid class="py-6 px-6">
    <header class="d-flex flex-wrap align-end ga-3 mb-6">
      <div class="flex-grow-1">
        <h1 class="text-headline-medium">Widgets</h1>
        <div class="text-body-medium text-medium-emphasis">
          <c-list-range-display :list="list" /> · sorted by name
        </div>
      </div>
      <c-select
        v-model:key-value="jumpId"
        for="Widget"
        label="Jump to widget"
        style="width: 260px; flex: none"
        @update:key-value="(id) => id && open(id)"
      />
      <v-btn variant="flat" prepend-icon="$plus" @click="startCreate">
        New widget
      </v-btn>
    </header>

    <v-row>
      <v-col cols="12" md="7" xl="8">
        <v-card>
          <v-toolbar>
            <v-text-field
              v-model="list.$params.search"
              label="Search"
              placeholder="Search widgets"
              prepend-inner-icon="$search"
              clearable
              class="mx-3"
              style="max-width: 320px"
            />
            <c-list-filters :list="list" />
            <v-spacer />
            <v-btn
              icon="$loading"
              aria-label="Reload"
              :loading="list.$load.isLoading"
              @click="list.$load()"
            />
          </v-toolbar>

          <c-loader-status :loaders="{ 'no-initial-content': [list.$load] }">
            <c-table
              :list="list"
              :props="['name', 'category', 'inventedOn', 'modifiedOn']"
              @click:item="(w) => open(w.widgetId!)"
            />
            <v-empty-state
              v-if="list.$load.wasSuccessful && !list.$items.length"
              icon="$search"
              title="No matching widgets"
              text="Try other words, or clear the search to see every widget."
            >
              <template #actions>
                <v-btn color="neutral" @click="list.$params.search = ''">
                  Clear search
                </v-btn>
              </template>
            </v-empty-state>
          </c-loader-status>

          <v-divider />
          <c-list-pagination :list="list" class="pa-2" />
        </v-card>
      </v-col>

      <v-col cols="12" md="5" xl="4">
        <v-card v-if="!props.id" class="h-100">
          <v-empty-state
            icon="fa fa-palette"
            title="Select a widget"
            text="Pick one from the list to see its details and edit it."
          />
        </v-card>

        <v-card v-else>
          <c-loader-status
            :loaders="{
              'no-error-content no-initial-content': [item.$load],
              '': [item.$save, item.$delete],
            }"
          >
            <v-card-item>
              <div class="text-label-medium text-medium-emphasis">
                Widget #{{ item.widgetId }}
              </div>
              <v-card-title class="d-flex align-center ga-2">
                {{ item.name || "Untitled" }}
                <v-chip v-if="item.$isDirty" size="small" color="warning">
                  Unsaved
                </v-chip>
              </v-card-title>
              <template #append>
                <v-menu>
                  <template #activator="{ props: menuProps }">
                    <v-btn
                      v-bind="menuProps"
                      icon="fa fa-ellipsis-h"
                      variant="text"
                      color="neutral"
                      aria-label="More actions"
                    />
                  </template>
                  <v-list>
                    <v-list-item
                      title="Open in admin"
                      prepend-icon="fa fa-external-link-alt"
                      :to="`/admin/Widget/edit/${item.widgetId}`"
                    />
                    <v-list-item
                      title="Audit history"
                      prepend-icon="fa fa-clipboard-list"
                      to="/admin/audit"
                    />
                    <v-divider class="my-1" />
                    <v-list-item
                      title="Delete widget"
                      prepend-icon="fa fa-trash-alt"
                      base-color="error"
                      @click="confirmDelete = true"
                    />
                  </v-list>
                </v-menu>
              </template>
            </v-card-item>
            <v-divider />

            <v-card-text>
              <v-form ref="form" @submit.prevent="save">
                <c-input :model="item" for="name" />
                <c-input :model="item" for="category" />
                <c-datetime-picker
                  :model="item"
                  for="inventedOn"
                  date-kind="datetime"
                  hint="When the widget was first built"
                  persistent-hint
                />
              </v-form>

              <v-divider class="my-4" />
              <dl class="text-body-medium details">
                <dt class="text-medium-emphasis">Created</dt>
                <dd><c-display :model="item" for="createdOn" /></dd>
                <dt class="text-medium-emphasis">Modified</dt>
                <dd><c-display :model="item" for="modifiedOn" /></dd>
                <dt class="text-medium-emphasis">Modified by</dt>
                <dd>
                  <v-chip size="small" prepend-icon="fa fa-lock">
                    {{ item.modifiedById ?? "developmentuser" }}
                  </v-chip>
                </dd>
              </dl>
            </v-card-text>

            <v-card-actions>
              <v-btn
                color="neutral"
                :disabled="!item.$isDirty"
                prepend-icon="fa fa-undo"
                @click="discard"
              >
                Discard
              </v-btn>
              <v-spacer />
              <v-btn
                variant="flat"
                prepend-icon="fa fa-save"
                :loading="item.$save.isLoading"
                :disabled="!item.$isDirty"
                @click="save"
              >
                Save
              </v-btn>
            </v-card-actions>
          </c-loader-status>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="creating" max-width="520">
      <v-card
        title="New widget"
        subtitle="Widgets appear in the list once saved."
      >
        <v-card-text>
          <v-form ref="createForm" @submit.prevent="create">
            <c-input :model="draft" for="name" autofocus />
            <c-input :model="draft" for="category" />
            <c-datetime-picker :model="draft" for="inventedOn" />
          </v-form>
          <v-alert
            v-if="draft.$save.message"
            type="error"
            :text="draft.$save.message"
            class="mt-4"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="neutral" @click="creating = false">Cancel</v-btn>
          <v-btn
            variant="flat"
            :loading="draft.$save.isLoading"
            @click="create"
          >
            Create widget
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDelete" max-width="440">
      <v-card
        :title="`Delete ${item.name}?`"
        text="The widget and its history are removed for everyone. This can't be undone."
      >
        <v-card-actions>
          <v-spacer />
          <v-btn color="neutral" @click="confirmDelete = false">Cancel</v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="item.$delete.isLoading"
            @click="remove"
          >
            Delete widget
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="toast.show" :color="toast.color" :timeout="4000">
      {{ toast.text }}
      <template #actions>
        <v-btn variant="text" @click="toast.show = false">Dismiss</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { WidgetListViewModel, WidgetViewModel } from "@/viewmodels.g";

const props = defineProps<{ id?: number }>();
const route = useRoute();
const router = useRouter();

useTitle(() => (props.id ? item.name : null) ?? "Widgets");

const list = new WidgetListViewModel();
list.$params.orderBy = "Name";
list.$pageSize = 10;
list.$useAutoLoad({ wait: 200, immediate: true });

const item = new WidgetViewModel();
const form = useForm();
const jumpId = ref<number | null>(null);

watch(
  () => props.id,
  (id) => {
    if (id) item.$load(id);
  },
  { immediate: true },
);

const toast = reactive({
  show: false,
  text: "",
  color: undefined as string | undefined,
});
function notify(text: string, color?: string) {
  Object.assign(toast, { show: true, text, color });
}

function open(id: number) {
  router.push(`/workspace/${id}`);
}

async function save() {
  if (!(await form.value?.validate())?.valid) return;
  await item.$save();
  if (item.$save.wasSuccessful) {
    notify(`Saved ${item.name}`, "success");
    list.$load();
  }
}

async function discard() {
  await item.$load(props.id);
  notify("Changes discarded");
}

const confirmDelete = ref(false);
async function remove() {
  const name = item.name;
  await item.$delete();
  confirmDelete.value = false;
  if (item.$delete.wasSuccessful) {
    notify(`Deleted ${name}`, "error");
    list.$load();
    router.push("/workspace");
  }
}

const creating = ref(false);
const createForm = useForm(false);
const draft = shallowRef(new WidgetViewModel());
function startCreate() {
  draft.value = new WidgetViewModel();
  creating.value = true;
}

async function create() {
  if (!(await createForm.value?.validate())?.valid) return;
  const created = draft.value;
  await created.$save();
  if (created.$save.wasSuccessful) {
    creating.value = false;
    notify(`Created ${created.name}`, "success");
    list.$load();
    open(created.widgetId!);
  }
}

if (route.query.new) startCreate();
if (route.query.delete) confirmDelete.value = true;
</script>

<style lang="scss" scoped>
.details {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 8px 24px;
  align-items: center;

  dd {
    margin: 0;
  }
}
</style>
