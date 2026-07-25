const state = () => ({
  view: "bills",
});

const mutations = {
  setView(state, view) {
    state.view = view;
  },
};

const getters = {
  view(state) {
    return state.view;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  getters,
};
