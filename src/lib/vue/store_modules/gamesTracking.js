import { forEach } from "lodash";

const state = () => ({
  gamesToCheck: [],
  gamesData: [],
  intrervalId: null,
});

const mutations = {
  setGames(state, games) {
    state.gamesToCheck = games;
  },

  setGamesData(state, data) {
    state.gamesData = data;
  },

  setGameRunning(state, data) {
    const { name, running, elapsedSeconds } = data;

    forEach(state.gamesData, (game) => {
      if (game.app == name) {
        game.running = running;

        if (elapsedSeconds) {
          game.time += elapsedSeconds;
          game.played = new Date();
        }
      }
    });
  },

  setIntervalId(state, data) {
    state.intrervalId = data.intervalId;
  },
};

const getters = {
  trackingGames: (state, getters, rootState) => {
    return state.gamesToCheck;
  },

  gamesData: (state, getters, rootState) => {
    return state.gamesData;
  },

  intrervalId: (state, getters, rootState) => {
    return state.intrervalId;
  },
};

export default {
  state,
  mutations,
  getters,
};
