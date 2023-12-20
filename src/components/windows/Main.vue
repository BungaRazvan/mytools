<template>
  <div>
    <Navbar :minimal="false" />

    <MainScreen key="main-screen" v-if="this.screen() == 'main'" />
    <GameTracking
      key="game-tracking"
      v-if="this.screen() == 'gameTracking'"
      :goBack="this.goBack"
      :recordRunningGame="this.recordRunningGame"
      :calculateGameTime="this.calculateGameTime"
    />
    <GenshinLoadouts
      key="genshin-loadouts"
      v-if="this.screen() == 'genshinLoadouts'"
      :goBack="this.goBack"
    />
    <GameResourceTracking
      key="game-resource-tracking"
      v-if="this.screen() == 'gameResourceTracking'"
      :goBack="this.goBack"
    />
  </div>
</template>

<script>
import "@/assets/scss/style.scss";

import MainScreen from "@/components/screens/MainScreen.vue";
import GameTracking from "@/components/screens/GameTracking.vue";
import GenshinLoadouts from "@/components/screens/GenshinLoadouts.vue";
import GameResourceTracking from "@/components/screens/GameResourceTracking.vue";
import Navbar from "@/components/Navbar.vue";

export default {
  name: "App",
  components: {
    Navbar,
    MainScreen,
    GameTracking,
    GenshinLoadouts,
    GameResourceTracking,
  },

  methods: {
    screen() {
      return this.$store.state.screen;
    },

    goBack() {
      const store = this.$store;

      store.dispatch("all", {
        mutation: "navigateScreen",
        data: "back",
      });
    },
  },
};
</script>
