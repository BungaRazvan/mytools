<template>
  <div class="build-container">
    <div class="builds">
      <Build
        :name="build.name"
        :characters="build.characters"
        :key="build.name"
        :index="index"
        v-for="(build, index) in this.$store.getters.builds"
      />
      <div @click="this.addNewBuild">&plus; Add New Build</div>
    </div>

    <div class="panel" v-if="this.$store.getters.displayCharactersList">
      <CharacterList />
    </div>

    <div class="panel" v-if="this.$store.getters.displayCharaterBuild">
      <CharacterBuild />
    </div>
  </div>
</template>

<style lang="scss">
.build-container {
  display: flex;

  .builds {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
  }

  .panel {
    background-color: #1c1d1e;
    display: flex;
    padding-left: 25px;
    min-height: 20%;
    width: 100%;
    flex-wrap: wrap;
  }
  // 4-star character bg: #68598d
  // 5-star character bg: #9f682a
  .five-star {
    background-color: #9f682a !important;

    &.character {
      background-color: #9f682a !important;
    }
  }

  .four-star {
    background-color: #68598d !important;

    &.character {
      background-color: #68598d !important;
    }
  }
}
</style>

<script>
import Build from "@/components/GenshinLoadouts/Build.vue";
import CharacterList from "@/components/GenshinLoadouts/CharacterList.vue";
import CharacterBuild from "@/components/GenshinLoadouts/CharacterBuild.vue";
import Tooltip from "@/components/Tooltip.vue";

export default {
  name: "GenshinLoadouts",
  props: ["goBack"],
  components: { Build, CharacterList, CharacterBuild, Tooltip },

  methods: {
    addNewBuild() {
      this.$store.dispatch("all", {
        mutation: "addNewBuild",
      });
    },
  },

  mounted() {},
};
</script>
