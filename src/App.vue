<template>
  <div>
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
  </div>
</template>

<script>
import "./assets/scss/style.scss";

import MainScreen from "@/components/screens/MainScreen.vue";
import GameTracking from "@/components/screens/GameTracking.vue";
import GenshinLoadouts from "@/components/screens/GenshinLoadouts.vue";

import { secondToMS } from "@/lib/vue/constants";

export default {
  name: "App",
  components: { MainScreen, GameTracking, GenshinLoadouts },

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

    goBackOrForward() {
      const store = this.$store;

      // Add a mousedown event listener to the element
      document.addEventListener("mousedown", (event) => {
        switch (event.button) {
          case 4:
            store.dispatch("all", {
              mutation: "navigateScreen",
              data: "forward",
            });
            break;
          case 3:
            store.dispatch("all", {
              mutation: "navigateScreen",
              data: "back",
            });
            break;
        }
      });
    },

    calculateGameTime(endDate) {
      return Math.floor((new Date() - endDate) / secondToMS);
    },

    recordRunningGame(gamesToCheck) {
      const store = this.$store;

      const intervalId = setInterval(() => {
        gamesToCheck.map((game) => {
          window.ipc.receive("isGameRunning", game.app).then((data) => {
            if (data[game.app]) {
              if (!game.startTime) {
                // Game has just started running - record the start time
                game.startTime = new Date();
              }

              store.dispatch("all", {
                mutation: "setGameRunning",
                data: { running: true, name: game.app },
              });
            }

            if (
              Object.keys(data)[0] == game.app &&
              !data[game.app] &&
              game.startTime != null
            ) {
              const elapsedSeconds = this.calculateGameTime(game.startTime);
              game.startTime = null;

              store.dispatch("all", {
                mutation: "setGameRunning",
                data: {
                  running: false,
                  name: game.app,
                  elapsedSeconds,
                },
              });
              window.ipc.send("logRunningGame", {
                app: game.app,
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
  },

  mounted() {
    this.goBackOrForward();
    const store = this.$store;

    window.ipc.receive("getSetting", "trackingGames").then((data) => {
      store.dispatch("all", {
        mutation: "setGames",
        data: data || [],
      });

      this.recordRunningGame(store.getters.trackingGames);
    });
  },
};
</script>
