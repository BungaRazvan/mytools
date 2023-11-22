<template>
  <div class="team">
    <label class="team-label">
      <i
        @click="this.toggleEditTeamName"
        class="material-icons edit-icon"
        v-if="!this.editTeamName"
        >edit_note</i
      >
      <i v-if="this.editTeamName" class="material-icons edit-icon">done</i>
      <input
        class="edit-name"
        @blur="editName($event, this.index)"
        :disabled="!this.editTeamName"
        :value="this.name"
      />
      <i @click="removeTeam(this.index)" class="material-icons delete-icon"
        >delete</i
      >
    </label>
    <div class="team-characters">
      <div
        class="character"
        :key="`${this.index}-${index}-${character.name}`"
        @click="
          toggleCharacterAction(
            $event,
            index,
            this.index,
            'displayCharaterBuild'
          )
        "
        :class="[
          determineStar(character.rarity),
          determineActive(index, this.index),
        ]"
        v-for="(character, index) in this.characters"
      >
        <img :src="`/img/genshin/characters/${character.thumbnail}`" />
      </div>
      <div
        v-for="_ in this.genshinTeamLimit - this.characters.length"
        class="character"
        @click="
          toggleCharacterAction($event, _, this.index, 'displayCharactersList')
        "
      >
        <i class="material-icons">add</i>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.team {
  width: 500px;
  margin-top: 10px;

  .team-label {
    display: flex;
    align-items: center;
    align-content: center;
    font-size: 40px;

    .edit-name {
      background-color: #282a2c;
      color: #fff;
      border: 0;
      font-size: 40px;
      width: 100%;

      &:focus-visible {
        outline: none;
      }
    }
  }

  i {
    font-size: 40px;
    padding-right: 5px;
    padding-bottom: 5px;
    cursor: pointer;

    &.edit-icon {
      &:hover {
        color: #108718;
      }
    }

    &.delete-icon {
      margin-left: auto;
      margin-right: 10px;

      &:hover {
        color: #6c1c1c;
      }
    }

    &:last-child {
      float: right;
    }
  }

  .team-characters {
    display: flex;
    flex-grow: 1;
    justify-content: space-around;

    .character {
      margin: 10px;
      width: 105px;
      height: 105px;
      background-color: #1c1d1e;
      border-radius: 10%;
      justify-content: center;
      align-items: center;
      display: flex;
      cursor: pointer;
      overflow: hidden;

      &.active {
        border: 5px solid #c0ff40;
        border-left: 0;
        border-right: 0;
      }

      i {
        font-size: 100%;
        color: #737476;
      }
    }
  }
}
</style>

<script>
import { genshinTeamLimit } from "@/lib/vue/constants";

export default {
  name: "Team",
  props: ["name", "characters", "index"],
  methods: {
    determineStar(rarity) {
      return rarity == 5 ? "five-star" : rarity == 4 ? "four-star" : "";
    },

    determineActive(characterIndex, teamIndex) {
      const store = this.$store.getters;

      if (
        store.displayCharaterBuild &&
        store.teamIndex == teamIndex &&
        store.characterIndex == characterIndex
      ) {
        return "active";
      }
    },

    editName(event, index) {
      this.editTeamName = !this.editTeamName;
      this.$store.dispatch("all", {
        mutation: "editTeamName",
        data: { index: index, name: event.target.value },
      });
    },

    toggleEditTeamName() {
      this.editTeamName = !this.editTeamName;
    },

    toggleCharacterAction(event, characterIndex, teamIndex, action) {
      const store = this.$store;
      const getters = store.getters;

      // if (
      //   action == "displayCharaterBuild" &&
      //   getters.characterIndex == characterIndex &&
      //   getters.teamIndex == teamIndex
      // ) {
      //   return;
      // }

      if (event.ctrlKey && action == "displayCharaterBuild") {
        store.dispatch("all", {
          data: { characterIndex, teamIndex },
          mutation: "removeCharacter",
        });
        return;
      }

      store.dispatch("all", {
        data: { characterIndex, teamIndex, action },
        mutation: "toggleCharacterAction",
      });
    },

    removeTeam(index) {
      this.$store.dispatch("all", {
        mutation: "removeTeam",
        data: { index },
      });
    },
  },

  data() {
    return {
      editTeamName: false,
      genshinTeamLimit: genshinTeamLimit,
    };
  },
};
</script>
