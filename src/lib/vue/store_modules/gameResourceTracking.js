import { mergeWith, isEmpty, isNumber } from "lodash";
import { secondToMS } from "@/lib/vue/constants";

const state = () => ({
  isScriptRunning: false,
  intervalId: null,
  time: 0,
  items: {},
  previousItems: [],
  previousRuns: [],
});

const mutations = {
  mergeItems(state, items) {
    state.items = mergeWith(state.items, items, (srcValue, objValue) => {
      if (isNumber(objValue) && isNumber(srcValue)) {
        return objValue + srcValue;
      }
    });
  },

  saveItems(state, data) {
    state.items = {};
    state.time = 0;

    if (!isEmpty(data.items)) {
      state.previousItems.unshift(data);
    }
  },

  setTime(state) {
    state.intervalId = setInterval(() => {
      state.time += 1;
    }, secondToMS);
  },

  toggleRunningScript(state) {
    state.isScriptRunning = !state.isScriptRunning;
  },

  setPreviousRuns(state, data) {
    state.previousRuns = data;
  },
};

const getters = {
  items(state, getters, rootState) {
    return state.items;
  },

  previousItems(state, getters, rootState) {
    return state.previousItems;
  },

  isScriptRunning(state, getters, rootState) {
    return state.isScriptRunning;
  },

  resourceTime(state, getters, rootState) {
    return state.time;
  },

  resourceInterval(state, getters, rootState) {
    return state.intervalId;
  },

  previousRuns(state, getters, rootState) {
    return state.previousRuns;
  },
};

export default {
  state,
  mutations,
  getters,
};
