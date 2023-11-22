import { map } from "lodash";

import { genshinTeamLimit } from "@/lib/vue/constants";

const state = () => ({
  displayCharactersList: false,
  displayCharaterBuild: false,

  teamIndex: null,
  characterIndex: null,
  selectedBuild: {},
  teams: [
    {
      name: "Team #1",
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
      name: "team #2",
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

  characters: [],
  preBuilds: [],
});

const getters = {
  teams: (state, getters, rootState) => {
    return state.teams;
  },

  displayCharactersList: (state, getters, rootState) => {
    return state.displayCharactersList;
  },

  displayCharaterBuild: (state, getters, rootState) => {
    return state.displayCharaterBuild;
  },

  teamIndex: (state, getters, rootState) => {
    return state.teamIndex;
  },
  characterIndex: (state, getters, rootState) => {
    return state.characterIndex;
  },

  characters: (state, getters, rootState) => {
    return state.characters;
  },

  preBuilds: (state, getters, rootState) => {
    return state.preBuilds;
  },
  selectedBuild: (state, getters, rootState) => {
    return state.selectedBuild;
  },
};

const mutations = {
  toggleCharacterAction(state, data) {
    const { characterIndex, teamIndex, action } = data;
    const toggleStatus = state[action];

    const opositAction =
      action == "displayCharaterBuild"
        ? "displayCharactersList"
        : "displayCharaterBuild";

    state[opositAction] = false;
    state.selectedBuild = {};

    if (
      state.teamIndex == teamIndex &&
      state.characterIndex != characterIndex
    ) {
      state.characterIndex = characterIndex;
      return;
    }

    if (
      state.teamIndex == teamIndex &&
      state.characterIndex == characterIndex
    ) {
      state[action] = !toggleStatus;
      state.teamIndex = null;
      state.characterIndex = null;
      return;
    }

    if (toggleStatus && state.teamIndex != teamIndex) {
      state.teamIndex = teamIndex;
      state.characterIndex = characterIndex;
      return;
    }

    state.teamIndex = teamIndex;
    state.characterIndex = characterIndex;
    state[action] = !toggleStatus;
  },

  editTeamName(state, data) {
    const { name, index } = data;
    state.teams[index].name = name;
  },

  removeTeam(state, data) {
    const { index } = data;
    state.teams.splice(index, 1);
  },

  addCharaterToTeam(state, data) {
    const { character } = data;
    let characters = state.teams[state.teamIndex].characters;

    const names = map(characters, "name");

    if (names.includes(character.name)) {
      return;
    }

    if (characters.length + 1 == genshinTeamLimit) {
      state.teamIndex = null;
      state.characterIndex = null;
      state.displayCharactersList = !state.displayCharactersList;
    }

    characters.push(character);
  },

  removeCharacter(state, data) {
    const { characterIndex, teamIndex } = data;
    let characters = state.teams[teamIndex].characters;

    if (state.displayCharactersList) {
      state.displayCharactersList = false;
    }

    if (state.displayCharaterBuild) {
      state.displayCharaterBuild = false;
    }

    state.teamIndex = null;
    state.characterIndex = null;
    characters.splice(characterIndex, 1);
  },

  addNewTeam(state) {
    state.teams.push({
      name: `Team #${state.teams.length + 1}`,
      characters: [],
    });
  },

  setCharacters(state, data) {
    state.characters = data;
  },

  setPreBuilds(state, data) {
    state.preBuilds = data;
  },

  setSelectedBuild(state, data) {
    console.log(data);
    state.selectedBuild = data;
  },
};

export default {
  state,
  getters,
  mutations,
};
