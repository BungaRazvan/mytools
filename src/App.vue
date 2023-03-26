<template>
  <div class="dashboard display-animation">
    <WindowsTile color="pink" title="Amazon" />
    <WindowsTile color="blue" shape="sqr" title="Game Tracking" />
  </div>
</template>

<script>
import "./assets/scss/style.scss";

import WindowsTile from "./components/WindowsTile.vue";

export default {
  name: "App",
  components: { WindowsTile },
  methods: {
    showTiles: () => {
      const speed = 200;
      const containers = document.querySelectorAll(".display-animation");

      containers.forEach((container) => {
        container.childNodes.forEach((children) => {
          const offset = children.offsetLeft * 0.8 + children.offsetTop;
          const delay = parseFloat(offset / speed).toFixed(2);
          children.style.animationDelay = delay;
          children.classList.add("animated");
        });
      });
    },
  },

  mounted() {
    this.showTiles();
  },
};
</script>
