<template>
  <div class="character-build">
    <div class="header">
      <select
        name="builds"
        class="builds"
        @change="chooseBuild(buildName)"
        v-model="buildName"
      >
        <option value="" selected>Select Build</option>
        <option :value="build.name" v-for="build in allBuilds()">
          {{ build.name }}
        </option>
      </select>
    </div>

    <div class="choosen-build" v-if="selectedBuild.name">
      <Tabs
        :tabs="['Artifacts', 'Weapon']"
        activeTab="Artifacts"
        :isCenter="true"
      >
        <template v-slot:Artifacts>
          <ArtifactsList
            :mainStats="selectedBuild.main_stats"
            :artifacts="selectedBuild.artifacts"
            :subStats="selectedBuild.sub_stats"
          />
        </template>

        <template v-slot:Weapon>
          <WeaponsList
            :weapon="selectedBuild.weapon"
            :substitutes="selectedBuild.substitute"
          />
        </template>
      </Tabs>
    </div>

    <div v-if="selectedBuild.name">
      <div class="btn offset">Set Build</div>
    </div>
  </div>
</template>

<style lang="scss">
.teams-container {
  .panel {
    padding-right: 25px;
    height: 100% !important;
    min-height: 100vh;
  }
}

.character-build {
  .builds {
    width: 100%;
    height: 40px;
    border: none;
    color: #fff;
    margin: 20px 0 10px 0;
    background-color: #1c1d1e;
    font-size: 30px;
    text-align-last: center;
    text-align: center;

    &:focus-visible {
      outline: none;
      border: none;
    }
  }
}
</style>

<script>
import { find } from "lodash";
import { mapGetters } from "vuex";

import Tabs from "@/components/Tabs.vue";

import WeaponsList from "./WeaponsList.vue";
import ArtifactsList from "./ArtifactsList.vue";

export default {
  name: "CharacterBuild",
  components: { Tabs, WeaponsList, ArtifactsList },

  computed: {
    ...mapGetters(["selectedBuild"]),
  },

  methods: {
    allBuilds() {
      const getters = this.$store.getters;
      const preBuilds = getters.preBuilds;

      return preBuilds[this.chatacter().name];
    },

    chatacter() {
      const getters = this.$store.getters;
      const teamIndex = getters.teamIndex;
      const characterIndex = getters.characterIndex;

      if (teamIndex == null || !characterIndex == null) {
        return {};
      }

      const character = getters.teams[teamIndex].characters[characterIndex];

      return character;
    },

    chooseBuild(buildName) {
      if (buildName) {
        const builds = this.allBuilds();
        const build = find(builds, (build) => build.name == buildName);
        this.$store.dispatch("all", {
          mutation: "setSelectedBuild",
          data: build,
        });
        return;
      }

      this.$store.dispatch("all", {
        mutation: "setSelectedBuild",
        data: {},
      });
    },

    itemNametoImage(itemName, type) {
      let imgPath = "img/genshin";

      if (type == "weapon") {
        imgPath += "/weapons/Weapon_" + itemName.replaceAll(" ", "_") + ".png";

        return imgPath;
      }
    },
  },

  data() {
    return {
      choosedBuild: {},
      buildName: "",
    };
  },

  mounted() {
    const store = this.$store;
    const preBuilds = store.getters.preBuilds;

    if (!preBuilds.length) {
      window.ipc
        .receive("readJsonFile", {
          folderPath: `${__static}/data/genshin/`,
          fileName: "prebuilds.json",
        })
        .then((data) => {
          store.dispatch("all", {
            data: data,
            mutation: "setPreBuilds",
          });
        });
    }
  },
};
</script>
