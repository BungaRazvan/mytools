import { createStore } from "vuex";

import genshinLodaouts from "./store_modules/genshinLodaouts";
import gamesTracking from "./store_modules/gamesTracking";
import gameResourceTracking from "./store_modules/gameResourceTracking";

const initialStore = {
  screen: "main",
  screenHistory: [],
  screenIndex: 0,
};

export const store = createStore({
  state: { ...initialStore },
  modules: { genshinLodaouts, gamesTracking, gameResourceTracking },

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
  },
});
