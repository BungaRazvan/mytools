import { map, isEmpty } from "lodash";

import { genshinTeamLimit } from "@/lib/vue/constants";

const state = () => ({
  displayCharactersList: false,
  displayCharaterBuild: false,

  buildName: "",
  teamIndex: null,
  characterIndex: null,

  selectedBuild: {},
  teams: [],
  characters: [],
  preBuilds: [],
  allArtifacts: [],
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

  buildName: (state, getters, rootState) => {
    return state.buildName;
  },

  allArtifacts: (state, getters, rootState) => {
    return state.allArtifacts;
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
    state.buildName = "";

    const characterBuild =
      state.teams[teamIndex].characters[characterIndex]?.build;

    if (!isEmpty(characterBuild)) {
      state.selectedBuild = characterBuild;
      state.buildName = characterBuild.name;
    }

    if (
      toggleStatus &&
      state.teamIndex == teamIndex &&
      state.characterIndex == characterIndex
    ) {
      state.teamIndex = null;
      state.characterIndex = null;
      state[action] = false;
      return;
    }

    if (toggleStatus) {
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
    const teamIndex = state.teamIndex;

    if (index == teamIndex) {
      state.teamIndex = null;
      state.characterIndex = null;
      state.selectedBuild = {};
      state.displayCharaterBuild = false;
      state.displayCharactersList = false;
    }

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

  setBuildName(state, data) {
    state.buildName = data;
  },

  setCharacters(state, data) {
    state.characters = data;
  },

  setTeams(state, data) {
    state.teams = data;
  },

  setPreBuilds(state, data) {
    state.preBuilds = data;
  },

  setSelectedBuild(state, data) {
    state.selectedBuild = data;
  },

  setBuild(state) {
    state.teams[state.teamIndex].characters[state.characterIndex].build =
      state.selectedBuild;
  },

  setAllArtifacts(state, data) {
    state.allArtifacts = data;
  },
};

export default {
  state,
  getters,
  mutations,
};
