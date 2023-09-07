const state = () => ({
  builds: [
    {
      name: "Build #1",
      characters: [
        {
          name: "Raiden Shogun",
          image: "Raiden_Shogun_Icon.webp",
          artifacts: [],
          weapon: null,
          rarity: 5,
        },
      ],
    },
  ],
});

const getters = {
  builds: (state, getters, rootState) => {
    return state.builds;
  },
};

const mutations = {
  editBuildName(state, data) {
    const { name, index } = data;
    state.builds[index].name = name;
  },
  removeBuild(state, data) {
    const { index } = data;
    state.builds.splice(index, 1);
  },
};

export default {
  state,
  getters,
  mutations,
};
