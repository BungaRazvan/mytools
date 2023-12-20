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
  mergeItems(state, data) {
    state.items = mergeWith(state.items, data, (srcValue, objValue) => {
      if (isNumber(objValue) && isNumber(srcValue)) {
        return objValue + srcValue;
      } else if (isNumber(objValue) && !srcValue) {
        return objValue;
      }
    });
  },

  saveItems(state, data) {
    state.items = {};
    state.time = 0;

    if (!isEmpty(data.items)) {
      state.previousItems.unshift({
        ...data,
        date: new Date().toISOString(),
      });
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

  setPreviousItems(state, data) {
    state.previousRuns = [...state.previousItems, ...state.previousRuns];
    state.previousItems = data;
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
