<template>
  <div>
    <MainScreen key="main-screen" v-if="this.screen() == 'main'" />
    <GameTracking key="game-tracking" v-if="this.screen() == 'gameTracking'" />
  </div>
</template>

<script>
import "./assets/scss/style.scss";

import MainScreen from "@/components/screens/MainScreen.vue";
import GameTracking from "@/components/screens/GameTracking.vue";

export default {
  name: "App",
  components: { MainScreen, GameTracking },

  methods: {
    screen() {
      return this.$store.state.screen;
    },
  },

  mounted() {
    const secondToMS = 1000;
    const store = this.$store;

    let gamesToCheck = [];

    window.ipc.send("getSettingsFile");
    window.ipc.receive("getSettingsFile", (data) => {
      if (data?.gamesToCheck?.length) {
        gamesToCheck = data.gamesToCheck;
      }
    });

    const intervalId = setInterval(() => {
      // TODO i will need to cancel this when i add a new game
      gamesToCheck.map((game) => {
        window.ipc.send("isGameRunning", game.name);
        window.ipc.receive("isGameRunning", (data) => {
          if (data[game.name]) {
            if (!game.startTime) {
              // Game has just started running - record the start time
              game.startTime = new Date();
            }

            store.dispatch("all", {
              mutation: "setGameRunning",
              data: { running: true, name: game.name },
            });
          }

          if (
            Object.keys(data)[0] == game.name &&
            !data[game.name] &&
            game.startTime != null
          ) {
            const elapsedSeconds = Math.floor(
              (new Date() - game.startTime) / secondToMS
            );
            game.startTime = null;

            store.dispatch("all", {
              mutation: "setGameRunning",
              data: { running: false, name: game.name },
            });
            window.ipc.send("logRunningGame", {
              app: game.name,
              time: elapsedSeconds,
            });
          }
        });
      });
    }, secondToMS);

    store.dispatch("all", {
      mutation: "setIntervalId",
      data: { intervalId },
    });
  },
};
</script>
