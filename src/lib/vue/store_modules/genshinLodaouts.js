import { genshinTeamLimit } from "@/lib/vue/constants";

const state = () => ({
  displayCharactersList: false,
  displayCharaterBuild: false,

  buildIndex: null,
  characterIndex: null,
  builds: [
    {
      name: "Build #1",
      characters: [
        {
          name: "Raiden Shogun",
          thumbnail: "Raiden_Shogun_Icon.webp",
          artifacts: [],
          weapon: null,
          rarity: 5,
        },
      ],
    },

    {
      name: "waifu team",
      characters: [
        {
          name: "Raiden Shogun",
          thumbnail: "Raiden_Shogun_Icon.webp",
          artifacts: [],
          weapon: null,
          rarity: 5,
        },
        {
          name: "Jean",
          type: "Character",
          rarity: 5,
          element: "Anemo",
          weapon: "Sword",
          region: "Mondstadt",
          thumbnail: "Jean_Icon.webp",
        },
        {
          name: "Eula",
          type: "Character",
          rarity: 5,
          element: "Cryo",
          weapon: "Claymore",
          region: "Mondstadt",
          thumbnail: "Eula_Icon.webp",
        },
        {
          name: "Yelan",
          type: "Character",
          rarity: 5,
          element: "Hydro",
          weapon: "Bow",
          region: "Liyue",
          thumbnail: "Yelan_Icon.webp",
        },
      ],
    },
  ],
});

const getters = {
  builds: (state, getters, rootState) => {
    return state.builds;
  },

  displayCharactersList: (state, getters, rootState) => {
    return state.displayCharactersList;
  },

  displayCharaterBuild: (state, getters, rootState) => {
    return state.displayCharaterBuild;
  },
};

const mutations = {
  toggleCharacterAction(state, data) {
    const { characterIndex, buildIndex, action } = data;
    const toggleStatus = state[action];
    const opositAction =
      action == "displayCharaterBuild"
        ? "displayCharactersList"
        : "displayCharaterBuild";

    state[opositAction] = false;

    if (
      state.buildIndex == buildIndex &&
      state.characterIndex != characterIndex
    ) {
      state.characterIndex = characterIndex;
      return;
    }

    if (
      state.buildIndex == buildIndex &&
      state.characterIndex == characterIndex
    ) {
      state.displayCharactersList = !toggleStatus;
      state.buildIndex = null;
      state.characterIndex = null;
      return;
    }

    if (toggleStatus && state.buildIndex != buildIndex) {
      state.buildIndex = buildIndex;
      state.characterIndex = characterIndex;
      return;
    }

    state.buildIndex = buildIndex;
    state.characterIndex = characterIndex;
    state[action] = !toggleStatus;
  },

  editBuildName(state, data) {
    const { name, index } = data;
    state.builds[index].name = name;
  },

  removeBuild(state, data) {
    const { index } = data;
    state.builds.splice(index, 1);
  },

  addCharaterToBuild(state, data) {
    const { character } = data;
    let characters = state.builds[state.buildIndex].characters;

    if (characters.length + 1 == genshinTeamLimit) {
      state.buildIndex = null;
      state.characterIndex = null;
      state.displayCharactersList = !state.displayCharactersList;
    }

    characters.push(character);
  },

  addNewBuild(state) {
    state.builds.push({
      name: `Build #${state.builds.length + 1}`,
      characters: [],
    });
  },
};

export default {
  state,
  getters,
  mutations,
};
