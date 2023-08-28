<template>
  <div class="build">
    <label class="build-label">
      <i class="material-icons edit-icon">edit_note</i>
      <span>{{ this.name }}</span>
      <i class="material-icons delete-icon">delete</i>
    </label>
    <div class="build-characters">
      <div
        class="character"
        :class="[
          character.rarity == 5
            ? 'five-star'
            : character.rarity == 4
            ? 'four-star'
            : '',
        ]"
        v-for="(character, index) in this.characters"
      >
        <img :src="`/img/genshin/characters/${character.image}`" />
      </div>
      <div v-for="_ in 4 - this.characters.length" class="character">
        <i class="material-icons">add</i>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.build {
  .build-label {
    display: flex;
    align-items: center;
    align-content: center;
    font-size: 40px;
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
export default {
  name: "Build",
  props: ["name", "characters"],
};
</script>
