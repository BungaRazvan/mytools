<template>
  <div>
    <div @click="this.goBack" class="simple-btn btn pulse">Back</div>

    <div class="new-game-add" v-if="!addGame" @click="toggleAddGame">
      &plus; Add Game to Track
    </div>
    <div class="new-game-container" v-if="addGame">
      <div class="new-game-label">
        <label>New Game Label</label>
        <div>
          <input
            name="label"
            :value="gameData.label"
            @change="setGameData"
            type="text"
            class="new-game-label-input"
          />
        </div>
      </div>

      <div class="new-game-exec">
        <label>New Game Executable</label>
        <div>
          <input
            name="app"
            :value="gameData.app"
            @change="setGameData"
            type="text"
            class="new-game-app-input"
          />
        </div>
      </div>

      <button class="simple-btn btn save-btn raise" @click="trackNewGame">
        Save
      </button>
      <button class="simple-btn btn cancel-btn raise" @click="cancelNewGame">
        Cancel
      </button>
    </div>

    <div class="games" v-for="(game, index) in gamesData" :key="game.app">
      <Game
        :maxOrder="gamesData.length"
        :order="index + 1"
        :time="game.time"
        :title="game.label"
        :running="game.running"
        :played="game.played"
        :lastSession="game.lastSession"
        :onChangeOrder="onChangeOrder"
      />
    </div>
  </div>
</template>

<style lang="scss">
.save-btn,
.cancel-btn {
  padding: 0.5em 1.5em;
}

.games,
.new-game-label,
.new-game-exec {
  margin: 0.5em;
}

.new-game-container {
  .new-game-label-input,
  .new-game-app-input {
    width: 20%;
    font-size: 20px;
  }
}

.new-game-add {
  cursor: pointer;
}
</style>

<script>
import { map, omit, filter } from "lodash";
import { mapGetters } from "vuex";

import Game from "@/components/GameTracking/Game.vue";

export default {
  name: "GameTracking",
  props: ["goBack", "recordRunningGame", "calculateGameTime"],
  components: { Game },

  data() {
    return {
      addGame: false,
      gameData: {
        label: null,
        app: null,
        startTime: null,
        lastSession: null,
        time: null,
        running: null,
        played: null,
      },
      defaultGameData: {
        label: null,
        app: null,
        startTime: null,
        lastSession: null,
        time: null,
        running: null,
        played: null,
      },
    };
  },

  methods: {
    cancelNewGame() {
      this.toggleAddGame();
      this.gameData = {
        ...this.defaultGameData,
      };
    },

    toggleAddGame() {
      this.addGame = !this.addGame;
    },

    trackNewGame() {
      this.toggleAddGame();

      const store = this.$store;
      const trackingGames = [...this.trackingGames];
      const gamesData = [...this.gamesData];
      const listOfGames = map(trackingGames, "app");

      if (!this.gameData.app || !this.gameData.label) {
        return;
      }

      if (listOfGames.includes(this.gameData.app)) {
        return;
      }

      listOfGames.unshift(this.gameData.app);

      // stop checking for running games
      clearInterval(store.getters.intrervalId);

      for (let index in trackingGames) {
        const game = trackingGames[index];

        // save the current time if any games are opened
        if (game.startTime) {
          const elapsedSeconds = this.calculateGameTime(game.startTime);

          window.ipc.send("logRunningGame", {
            app: game.app,
            time: elapsedSeconds,
          });

          game.time += elapsedSeconds;
          game.lastSession += elapsedSeconds;
        }

        game.startTime = null;
      }

      store.dispatch("all", {
        mutation: "setGames",
        data: [...trackingGames, this.gameData],
      });

      // add the game to the dom
      gamesData.unshift({
        ...this.gameData,
      });

      store.dispatch("all", {
        mutation: "setGamesData",
        data: gamesData,
      });

      // start looking for running games again
      this.recordRunningGame(store.getters.trackingGames);

      // reset state
      this.gameData = {
        ...this.defaultGameData,
      };

      const gamesSettings = map(gamesData, (obj) =>
        omit(obj, [
          "time",
          "display",
          "running",
          "played",
          "startTime",
          "lastSession",
        ])
      );
      // save to settings
      window.ipc.send("setSetting", {
        setting: "trackingGames",
        data: gamesSettings,
      });
    },

    setGameData(e) {
      this.gameData = {
        ...this.gameData,
        [e.target.name]: e.target.value,
      };
    },

    getGameData() {
      const store = this.$store;

      window.ipc.receive("getGamesData").then((fileData) => {
        const gameData = [];

        this.trackingGames.map((game) => {
          let data = {};
          const fileGame = filter(fileData, (o) => {
            if (o.app == game.app) {
              return o;
            }
          });

          if (fileGame) {
            data = {
              ...fileGame[0],
              ...game,
            };
          } else {
            data = {
              ...game,
            };
          }

          gameData.push(data);
        });

        store.dispatch("all", {
          mutation: "setGamesData",
          data: gameData,
        });
      });
    },

    onChangeOrder(originalOrder, newOrder) {
      const store = this.$store;
      const trackingGames = [...this.trackingGames];
      const gamesData = [...this.gamesData];

      originalOrder = originalOrder - 1;
      newOrder = newOrder - 1;
      // Remove the item from its original position
      const [removedItemTracking] = trackingGames.splice(originalOrder, 1);
      const [removedItemGames] = gamesData.splice(originalOrder, 1);

      // Insert the item at the new position
      trackingGames.splice(newOrder, 0, removedItemTracking);
      gamesData.splice(newOrder, 0, removedItemGames);

      store.dispatch("all", {
        mutation: "setGamesData",
        data: gamesData,
      });

      store.dispatch("all", {
        mutation: "setGames",
        data: trackingGames,
      });

      window.ipc.send("setSetting", {
        setting: "trackingGames",
        data: map(trackingGames, (obj) => ({ ...obj })),
      });
    },
  },

  computed: {
    ...mapGetters(["gamesData", "trackingGames"]),
  },

  mounted() {
    this.getGameData();
  },
};
</script>
