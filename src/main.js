import { createApp } from "vue";

import App from "./App.vue";
import { store } from "./lib/vue/store";

createApp(App).use(store).mount("#app");
