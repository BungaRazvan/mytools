<template>
  <div>
    <div class="admin-wrapper">
      <nav class="nav-header">
        <button @click="goBack" class="btn-back">
          <span class="arrow">←</span> Back
        </button>
      </nav>

      <div v-if="!addGame" @click="toggleAddGame" class="add-game-trigger">
        <span class="plus-icon">+</span> Add New Game to Track
      </div>

      <transition name="slide-fade">
        <div class="card new-game-card" v-if="addGame">
          <div class="card-header">
            <h3>Add New Game</h3>
            <p>Register a new executable to start tracking play time.</p>
          </div>

          <div class="form-body">
            <div class="input-field">
              <label>Display Name</label>
              <input
                name="label"
                :value="gameData.label"
                @input="setGameData"
                placeholder="e.g. Cyberpunk 2077"
                type="text"
              />
            </div>

            <div class="input-field">
              <label>Executable Path</label>
              <input
                name="app"
                :value="gameData.app"
                @input="setGameData"
                placeholder="C:\Games\Cyberpunk2077.exe"
                type="text"
              />
            </div>
          </div>

          <div class="form-footer">
            <button class="btn btn-save" @click="trackNewGame">
              Save Game
            </button>
            <button class="btn btn-cancel" @click="cancelNewGame">
              Cancel
            </button>
          </div>
        </div>
      </transition>
    </div>

    <div class="game" v-for="(game, index) in gamesData" :key="game.app">
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
.admin-wrapper,
.game {
  padding: 20px;
}

.nav-header {
  margin-bottom: 2rem;

  .btn-back {
    background: transparent;
    border: none;
    color: #ff4081;

    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;

    opacity: 0.8;

    font-weight: 700;
  }
}

.add-game-trigger {
  border: 2px dashed #3f3f4e;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #888;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;

  &:hover {
    border-color: #2d873f;
    color: #fff;
    background: rgba(45, 135, 63, 0.05);
  }
}

.new-game-card {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  margin-bottom: 2rem;

  .card-header {
    margin-bottom: 1.5rem;

    h3 {
      margin: 0;
      font-size: 1.55rem;
    }

    p {
      margin: 4px 0 0;
      font-size: 0.85rem;
      color: #888;
    }
  }
}

.form-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.input-field {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #aaa;
    font-weight: bold;
  }

  input {
    background: #1a1a21;
    border: 1px solid #3f3f4e;
    border-radius: 6px;
    padding: 12px;
    color: #fff;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: #2d873f;
    }
  }
}

.form-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  .btn {
    padding: 10px 24px;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.1s;

    &:active {
      transform: scale(0.98);
    }
  }

  .btn-save {
    background: #2d873f;
    border: none;
    color: #fff;
    &:hover {
      background: #36a44c;
    }
  }

  .btn-cancel {
    background: transparent;
    border: 1px solid #3f3f4e;
    color: #888;
    &:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
    }
  }
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from {
  transform: translateY(-20px);
  opacity: 0;
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
