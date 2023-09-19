<template>
  <div class="build">
    <label class="build-label">
      <i
        @click="this.toggleEditBuildName"
        class="material-icons edit-icon"
        v-if="!this.editBuildName"
        >edit_note</i
      >
      <i v-if="this.editBuildName" class="material-icons edit-icon">done</i>
      <input
        class="edit-name"
        @blur="editName($event, this.index)"
        :disabled="!this.editBuildName"
        :value="this.name"
      />
      <i @click="removeBuild(this.index)" class="material-icons delete-icon"
        >delete</i
      >
    </label>
    <div class="build-characters">
      <div
        class="character"
        @click="
          toggleCharacterAction(index, this.index, 'displayCharaterBuild')
        "
        :class="[
          character.rarity == 5
            ? 'five-star'
            : character.rarity == 4
            ? 'four-star'
            : '',
        ]"
        v-for="(character, index) in this.characters"
      >
        <img :src="`/img/genshin/characters/${character.thumbnail}`" />
      </div>
      <div
        v-for="_ in this.genshinTeamLimit - this.characters.length"
        class="character"
        @click="toggleCharacterAction(_, this.index, 'displayCharactersList')"
      >
        <i class="material-icons">add</i>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.build {
  width: 500px;
  margin-top: 10px;

  .build-label {
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

  .build-characters {
    display: flex;
    flex-grow: 1;
    justify-content: space-around;

    .character {
      margin: 10px;
      width: 105px;
      height: 105px;
      background-color: #1c1d1e;
      border-radius: 20%;
      justify-content: center;
      align-items: center;
      display: flex;
      cursor: pointer;

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
  name: "Build",
  props: ["name", "characters", "index"],
  methods: {
    editName(event, index) {
      this.editBuildName = !this.editBuildName;
      this.$store.dispatch("all", {
        mutation: "editBuildName",
        data: { index: index, name: event.target.value },
      });
    },

    toggleEditBuildName() {
      this.editBuildName = !this.editBuildName;
    },

    toggleCharacterAction(characterIndex, buildIndex, action) {
      this.$store.dispatch("all", {
        data: { characterIndex, buildIndex, action },
        mutation: "toggleCharacterAction",
      });
    },

    removeBuild(index) {
      this.$store.dispatch("all", {
        mutation: "removeBuild",
        data: { index },
      });
    },
  },

  data() {
    return {
      editBuildName: false,
      genshinTeamLimit: genshinTeamLimit,
    };
  },
};
</script>
