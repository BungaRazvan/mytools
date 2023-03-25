<template>
  <div class="dashboard display-animation">
    <WindowsTile />
  </div>
</template>

<script>
import "./assets/scss/style.scss";

import WindowsTile from "./components/WindowsTile.vue";

export default {
  name: "App",
  components: { WindowsTile },
};
</script>
