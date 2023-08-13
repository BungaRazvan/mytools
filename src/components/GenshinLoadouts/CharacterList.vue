<template>
  <div class="container">
    <div class="search">
      <input
        class="name"
        type="text"
        placeholder="Search by Name"
        :value="this.characterName"
        @keyup="searchCharacter"
      />
    </div>
    <div class="avatars">
      <div class="avatar" v-for="character in this.displayCharacters">
        <Tooltip :text="character.name"
          ><img
            :class="character.rarity == 5 ? 'five-star' : 'four-star'"
            :src="`img/genshin/characters/${character.thumbnail}`"
          />
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.avatars {
  flex-wrap: wrap;
  display: flex;
}

.avatar {
  cursor: pointer;

  img {
    border-radius: 25%;
    margin: 5px;
  }
}
</style>

<script>
import Tooltip from "@/components/Tooltip.vue";

export default {
  name: "CharacterList",
  components: { Tooltip },

  data() {
    return {
      characters: [],
      displayCharacters: [],
      characterName: null,
    };
  },

  methods: {
    searchCharacter(e) {
      const characters = this.characters;
      this.characterName = e.target.value;

      if (!e.target.value) {
        this.displayCharacters = this.characters;
        return;
      }

      const foundCharacters = characters.filter((character) => {
        if (character.name.toLowerCase().includes(e.target.value)) {
          return character;
        }
      });

      this.displayCharacters = foundCharacters;
    },
  },

  mounted() {
    window.ipc
      .receive("readJsonFile", {
        folderPath: `${__static}/data/genshin/`,
        fileName: "characters.json",
      })
      .then((response) => {
        this.characters = response.data;
        this.displayCharacters = response.data;
      });
  },
};
</script>
