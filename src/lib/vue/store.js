import { forEach } from "lodash";
import { createStore } from "vuex";

const initialStore = {
  screen: "main",
  screenHistory: [],
  screenIndex: 0,
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
      state.screenHistory.splice(state.screenIndex + 1);
      state.screenHistory.push(state.screen);
      state.screenHistory.push(screen);
      state.screenIndex = state.screenHistory.length - 1;
      state.screen = screen;
    },

    navigateScreen(state, direction) {
      if (direction == "back") {
        if (state.screenIndex > 0) {
          state.screenIndex--;
        }

        state.screen = state.screenHistory[state.screenIndex];
      }

      if (direction == "forward") {
        if (state.screenIndex < state.screenHistory.length - 1) {
          state.screenIndex++;
          state.screen = state.screenHistory[state.screenIndex];
        }
      }
    },

    setGames(state, games) {
      state.screens.gamesTracking.gamesToCheck = games;
    },

    setGamesData(state, data) {
      state.screens.gamesTracking.gamesData = data;
    },

    setGameRunning(state, data) {
      const { name, running, elapsedSeconds } = data;

      forEach(state.screens.gamesTracking.gamesData, (game) => {
        if (game.app == name) {
          game.running = running;

          if (elapsedSeconds) {
            game.time += elapsedSeconds;
          }
        }
      });
    },

    setIntervalId(state, data) {
      state.screens.gamesTracking.intrervalId = data.intervalId;
    },
  },
});
