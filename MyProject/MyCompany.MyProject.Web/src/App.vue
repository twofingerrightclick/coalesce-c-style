<template>
  <v-app id="vue-app">
    <v-app-bar v-if="!standalone" density="compact">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>
        <router-link to="/" style="color: inherit">
          MyCompany.MyProject
        </router-link>
      </v-toolbar-title>

      <v-menu bottom offset-y>
        <template #activator="{ props }">
          <v-list-item v-bind="props"> Settings </v-list-item>
        </template>
        <v-list min-width="300px">
          <v-list-item prepend-icon="fa fa-moon">
            <v-switch
              v-model="theme"
              label="Dark Mode"
              true-value="dark"
              false-value="light"
              hide-details
              class="ml-2"
              density="compact"
            />
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-navigation-drawer v-if="!standalone" v-model="drawer">
      <v-list>
        <v-list-item to="/" prepend-icon="fa fa-home" title="Home" />
        <v-list-item
          to="/widget"
          prepend-icon="fa fa-palette"
          title="Custom Page Example"
        />
        <v-list-subheader>Showcase</v-list-subheader>
        <v-list-item
          to="/dashboard"
          prepend-icon="fa fa-home"
          title="Dashboard"
        />
        <v-list-item
          to="/workspace"
          prepend-icon="fa fa-columns"
          title="Widgets"
        />
        <v-list-item
          to="/settings"
          prepend-icon="fa fa-cogs"
          title="Settings"
        />
        <v-list-item
          to="/gallery"
          prepend-icon="fa fa-palette"
          title="Components"
        />
        <v-list-item
          to="/readme"
          prepend-icon="fa fa-palette"
          title="README preview"
        />
        <v-divider></v-divider>
        <v-list-item to="/admin" prepend-icon="fa fa-cogs" title="Admin" />
      </v-list>

      <div
        class="position-absolute left-0 bottom-0 px-1 text-caption text-muted text-center"
      >
        {{ buildDate }}
      </div>
    </v-navigation-drawer>

    <v-main>
      <!-- https://stackoverflow.com/questions/52847979/what-is-router-view-key-route-fullpath -->
      <router-view v-slot="{ Component, route }">
        <transition name="router-transition" mode="out-in" appear>
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </v-main>

    <c-app-update-alert v-if="!standalone" />
  </v-app>
</template>

<script setup lang="ts">
import { useLocalStorage, usePreferredDark } from "@vueuse/core";
import { useTheme } from "vuetify";
import { format } from "date-fns-tz";

const drawer = ref<boolean | null>(null);
const route = useRoute();
const standalone = computed(() => route.meta.standalone === true);

const vuetifyTheme = useTheme();

const theme = useLocalStorage(
  "theme",
  usePreferredDark().value ? "dark" : "light",
);
watch(theme, (v) => vuetifyTheme.change(v), { immediate: true });

const buildDate = computed(() => {
  if (!BUILD_DATE) return "";
  return "build " + format(BUILD_DATE, "yyyy-MM-dd hh:mm a z");
});
</script>

<style lang="scss">
.router-transition-enter-active,
.router-transition-leave-active {
  transition: 0.1s ease-out;
}

.router-transition-enter-from,
.router-transition-leave-to {
  opacity: 0;
}
</style>
