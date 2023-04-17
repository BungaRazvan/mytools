import { forEach } from "lodash";
import { createStore } from "vuex";

const initialStore = {
  screen: "main",
  screens: {
    gamesTracking: {
      gamesToCheck: [],
      gamesData: [],
      intrervalId: null,
    },
  },
};

export const store = createStore({
  state: { ...initialStore },

  getters: {
    trackingGames: (state) => {
      return state.screens.gamesTracking.gamesToCheck;
    },

    gamesData: (state) => {
      return state.screens.gamesTracking.gamesData;
    },

    intrervalId: (state) => {
      return state.screens.gamesTracking.intrervalId;
    },
  },

  actions: {
    all: (context, payload) => {
      const { mutation, data } = payload;

      context.commit(mutation, data);
    },
  },

  mutations: {
    changeScreen(state, screen) {
      state.screen = screen;
    },

    setGames(state, games) {
      state.screens.gamesTracking.gamesToCheck = games;
    },
    // setGameData(data) {},

    setGamesData(state, data) {
      state.screens.gamesTracking.gamesData = data;
    },

    setGameRunning(state, data) {
      const { name, running } = data;

      forEach(state.screens.gamesTracking.gamesData, (game) => {
        if (game.app == name) {
          game.running = running;
        }
      });
    },

    setIntervalId(state, data) {
      state.screens.gamesTracking.intrervalId = data.intervalId;
    },
  },
});
