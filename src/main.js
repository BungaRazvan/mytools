import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import { store } from "./lib/vue/store";

import App from "./App.vue";
import routes from "./lib/vue/routes";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);

app.use(router);
app.use(store);

app.mount("#app");
