<template>
  <div class="character-list">
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
            @click="addCharaterToTeam(character)"
          />
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.character-list {
  position: sticky;
  top: 0;

  .search {
    margin: 20px 0 20px 0;

    .name {
      width: 100%;
      background-color: #1c1d1e;
      color: #fff;
      font-size: 30px;
      border: none;

      &:focus-visible {
        outline: none;
        border: none;
      }
    }
  }

  .avatars {
    flex-wrap: wrap;
    display: flex;
    overflow-y: auto;
    height: 90vh;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .avatar {
    cursor: pointer;

    img {
      border-radius: 25%;
      margin: 5px;
    }
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

    addCharaterToTeam(character) {
      this.$store.dispatch("all", {
        mutation: "addCharaterToTeam",
        data: { character },
      });
    },
  },

  mounted() {
    const store = this.$store;
    const characters = store.getters.characters;

    if (!characters.length) {
      window.ipc
        .receive("readJsonFile", {
          folderPath: `${__static}/data/genshin/`,
          fileName: "characters.json",
        })
        .then((response) => {
          this.characters = response.data;
          this.displayCharacters = response.data;
          store.dispatch("all", {
            data: response.data,
            mutation: "setCharacters",
          });
        });

      return;
    }

    this.characters = characters;
    this.displayCharacters = characters;
  },
};
</script>
