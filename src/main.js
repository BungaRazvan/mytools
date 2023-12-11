import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import { store } from "./lib/vue/store";

import App from "./App.vue";
import routes from "./lib/vue/routes";

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const app = createApp(App);

app.use(router);
app.use(store);

app.mount("#app");
