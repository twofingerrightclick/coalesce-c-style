import { createRouter, createWebHistory } from "vue-router";
import {
  CAdminEditorPage,
  CAdminTablePage,
  CAdminAuditLogPage,
} from "coalesce-vue-vuetify3";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: () => import("./views/Home.vue"),
    },
    {
      path: "/widget/:id(\\d+)?",
      name: "widget-edit",
      component: () => import("./views/WidgetEdit.vue"),
      props: (r) => ({ id: +r.params.id }),
    },
    {
      path: "/admin",
      component: () => import("./views/Admin.vue"),
    },
    {
      path: "/dashboard",
      component: () => import("./views/showcase/Dashboard.vue"),
    },
    {
      path: "/workspace/:id(\\d+)?",
      component: () => import("./views/showcase/WidgetWorkspace.vue"),
      props: (r) => ({ id: r.params.id ? +r.params.id : undefined }),
    },
    {
      path: "/settings",
      component: () => import("./views/showcase/Settings.vue"),
    },
    {
      path: "/gallery",
      component: () => import("./views/showcase/Gallery.vue"),
    },
    {
      path: "/collage",
      component: () => import("./views/showcase/Collage.vue"),
    },
    {
      path: "/readme",
      component: () => import("./views/showcase/Readme.vue"),
      meta: { standalone: true },
    },
    {
      path: "/c-style",
      component: () => import("./views/CStyleKitchen.vue"),
    },

    // Coalesce admin routes
    {
      path: "/admin/:type",
      name: "coalesce-admin-list",
      component: titledAdminPage(CAdminTablePage),
      props: true,
    },
    {
      path: "/admin/:type/edit/:id?",
      name: "coalesce-admin-item",
      component: titledAdminPage(CAdminEditorPage),
      props: true,
    },
    {
      path: "/admin/audit",
      component: titledAdminPage(CAdminAuditLogPage),
      props: { type: "AuditLog" },
    },
    {
      name: "error-404",
      path: "/:pathMatch(.*)*",
      component: () => import("@/views/errors/NotFound.vue"),
    },
  ],
});

/** Creates a wrapper component that will pull page title from the
 *  coalesce admin page component and pass it to `useTitle`.
 */
function titledAdminPage<
  T extends
    | typeof CAdminTablePage
    | typeof CAdminEditorPage
    | typeof CAdminAuditLogPage,
>(component: T) {
  return defineComponent({
    setup() {
      const pageRef = ref<InstanceType<T>>();
      useTitle(() => pageRef.value?.pageTitle);
      return { pageRef };
    },
    render() {
      return h(component as any, {
        color: "primary",
        ref: "pageRef",
        ...this.$attrs,
      });
    },
  });
}

export default router;
