<template>
  <div class="dashboard display-animation">
    <WindowsTile
      @click="this.changeScreen('gameTracking')"
      color="blue"
      title="Game Tracking"
    />
    <!-- <WindowsTile
      @click="this.changeScreen('genshinLoadouts')"
      color="purple"
      title="Genshin Loadouts"
      shape="sqr"
    /> -->
    <WindowsTile
      @click="this.changeScreen('gameResourceTracking')"
      color="cyan"
      title="Game Resource Tracking"
      shape="sqr"
    />
  </div>
</template>

<script>
import WindowsTile from "@/components/WindowsTile.vue";
import { store } from "@/lib/vue/store";

export default {
  name: "MainScreen",
  components: { WindowsTile },

  methods: {
    showTiles() {
      const speed = 200;
      const containers = document.querySelectorAll(".display-animation");

      containers.forEach((container) => {
        Array.from(container.children).forEach((children) => {
          const offset = children.offsetLeft * 0.8 + children.offsetTop;
          const delay = parseFloat(offset / speed).toFixed(2);
          children.style.animationDelay = delay;
          children.classList.add("animated");
        });
      });
    },

    changeScreen(screen) {
      const store = this.$store;
      setTimeout(() => {
        store.dispatch("all", {
          mutation: "changeScreen",
          data: screen,
        });
      }, 400);
    },
  },

  mounted() {
    this.showTiles();
  },

  data() {
    return { store };
  },
};
</script>
