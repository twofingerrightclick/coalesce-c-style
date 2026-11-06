import { createApp } from "vue";
import { createVuetify } from "vuetify";
import { createCoalesceVuetify } from "coalesce-vue-vuetify3";
import { cStyleBlueprint } from "c-style";
import { AxiosClient as CoalesceAxiosClient, isAxiosError } from "coalesce-vue";

import App from "./App.vue";
import router from "./router";
import {
  refreshUserInfo,
  globalProperties as userServiceProps,
} from "./user-service";

// Import global CSS and Fonts:
import "@fortawesome/fontawesome-free/css/all.css";
import "coalesce-vue-vuetify3/styles.css";
import "vuetify/styles";
import "c-style/styles";
import "@/styles/site.scss";

import $metadata from "@/metadata.g";
// viewmodels.g has side effects - it populates the global lookup on ViewModel and ListViewModel.
// This global lookup allows the admin page components to function.
import "@/viewmodels.g";

// SETUP: vuetify
const vuetify = createVuetify({
  blueprint: cStyleBlueprint({ colors: { primary: "#2563eb" } }),
});

// SETUP: coalesce-vue
CoalesceAxiosClient.defaults.baseURL = "/api";
CoalesceAxiosClient.defaults.withCredentials = true;
CoalesceAxiosClient.interceptors.response.use(undefined, (error) => {
  if (isAxiosError(error) && error.response?.status == 401) {
    console.warn("Received 401 from API endpoint. Refreshing for sign-in.");
    window.location.reload();
    return new Promise<void>(() => {
      /* Never resolving promise so failure doesn't momentarily propagate to UI before reload completes */
    });
  }
  return Promise.reject(error);
});

// SETUP: coalesce-vue-vuetify
const coalesceVuetify = createCoalesceVuetify({
  metadata: $metadata,
});


const app = createApp(App);
Object.defineProperties(
  app.config.globalProperties,
  Object.getOwnPropertyDescriptors(userServiceProps),
);

app.use(router);
app.use(vuetify);
app.use(coalesceVuetify);

refreshUserInfo()
  .then(() => {
    app.mount("#app");
  })
  .catch((e) => {
    console.error(e);
    alert(
      "Unable to contact the application server. Please refresh the page to try again.",
    );
  });
