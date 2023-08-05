<template>
  <div>
    <div @click="this.goBack" class="btn pulse">Back</div>

    <div class="new-game-add" v-if="!addGame" @click="toggleAddGame">
      &plus; Add Games to Track
    </div>
    <div class="new-game-container" v-if="addGame">
      <div class="new-game-label">
        <label>New Game Label</label>
        <div>
          <input
            name="new-game-label"
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
            name="new-game-game-app"
            :value="gameData.app"
            @change="setGameData"
            type="text"
            class="new-game-app-input"
          />
        </div>
      </div>

      <button class="save-btn raise" @click="trackNewGame">Save</button>
      <button class="cancel-btn raise" @click="cancelNewGame">Cancel</button>
    </div>

    <div
      class="game-info"
      :class="{ 'game-running': game.running }"
      v-for="game in this.$store.getters.gamesData"
      :key="game.app"
    >
      <Game
        :time="game.time"
        :title="game.label"
        :running="game.running"
        :played="game.played"
      />
    </div>
  </div>
</template>

<style lang="scss">
.game-info {
  &.game-running {
    color: #a972cb;
  }
}

.save-btn,
.cancel-btn {
  padding: 0.5em 1.5em;
}

.game-info,
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
        time: null,
        display: null,
        running: null,
        played: null,
      },
      defaultGameData: {
        label: null,
        app: null,
        startTime: null,
        time: null,
        display: null,
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
      const trackingGames = store.getters.trackingGames;
      const gamesData = store.getters.gamesData;
      const listOfGames = map(trackingGames, "app");

      if (!this.gameData.app || !this.gameData.label) {
        return;
      }

      if (listOfGames.includes(this.gameData.app)) {
        return;
      }

      listOfGames.push(this.gameData.app);

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
        }
        game.startTime = null;
      }
      store.dispatch("all", {
        mutation: "setGames",
        data: [...trackingGames, this.gameData],
      });

      // add the game to the dom
      gamesData.push({
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
        omit(obj, ["time", "display", "running", "played", "startTime"])
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
      const trackingGames = store.getters.trackingGames;

      window.ipc.receive("getGamesData").then((fileData) => {
        const gameData = [];

        trackingGames.map((game) => {
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
  },

  mounted() {
    this.getGameData();
  },
};
</script>
