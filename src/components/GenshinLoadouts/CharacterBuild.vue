<template>
  <div class="character-build-wrapper">
    <div class="build-selector-container">
      <div class="select-wrapper">
        <select
          name="builds"
          class="custom-build-select"
          @change="chooseBuild"
          v-model="buildName"
        >
          <option value="" disabled selected>— Choose Character Build —</option>
          <option
            :value="build.name"
            v-for="build in allBuilds()"
            :key="build.name"
          >
            {{ build.name }}
          </option>
        </select>
        <span class="select-arrow">▼</span>
      </div>
    </div>

    <div class="chosen-build-card" v-if="selectedBuild && selectedBuild.name">
      <Tabs
        :tabs="['Artifacts', 'Weapon']"
        activeTab="Artifacts"
        :isCenter="true"
      >
        <template v-slot:Artifacts>
          <div class="tab-content-area">
            <ArtifactsList
              :mainStats="selectedBuild.main_stats"
              :artifacts="selectedBuild.artifacts"
              :subStats="selectedBuild.sub_stats"
            />
          </div>
        </template>

        <template v-slot:Weapon>
          <div class="tab-content-area">
            <WeaponsList
              :weapon="selectedBuild.weapon"
              :substitutes="selectedBuild.substitute"
            />
          </div>
        </template>
      </Tabs>

      <footer class="build-confirmation">
        <button @click="setBuild" class="btn-confirm-build">
          Apply to Character
        </button>
      </footer>
    </div>

    <div v-if="!selectedBuild || !selectedBuild.name" class="empty-build-state">
      <p>Select a build from the menu above to view recommendations.</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.character-build-wrapper {
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.build-selector-container {
  .select-wrapper {
    position: relative;
    width: 100%;

    .custom-build-select {
      width: 100%;
      height: 50px;
      appearance: none;
      background: rgba(255, 255, 255, 0.03);
      border: none;
      border-bottom: 2px solid #3f3f4e;
      color: #fff;
      font-size: 1.2rem;
      font-weight: 600;
      text-align: center;
      padding: 0 40px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: #2d873f;
        background: rgba(45, 135, 63, 0.05);
      }

      option {
        color: #1c1d1e;
      }
    }

    .select-arrow {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: #666;
      font-size: 0.8rem;
    }
  }
}

.chosen-build-card {
  background: #1c1d1e;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.tab-content-area {
  padding: 20px;
}

.build-confirmation {
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);

  .btn-confirm-build {
    width: 100%;
    padding: 14px;
    background: #2d873f;
    border: none;
    border-radius: 6px;
    color: white;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;

    &:hover {
      background: #36a44c;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.empty-build-state {
  text-align: center;
  padding: 60px 20px;
  color: #555;
  font-style: italic;
  border: 2px dashed rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}
</style>

<script>
import { find } from "lodash";
import { mapGetters } from "vuex";

import { store } from "@/lib/vue/store";

import Tabs from "@/components/Tabs.vue";

import WeaponsList from "./WeaponsList.vue";
import ArtifactsList from "./ArtifactsList.vue";

export default {
  name: "CharacterBuild",
  components: { Tabs, WeaponsList, ArtifactsList },

  computed: {
    ...mapGetters(["selectedBuild"]),

    buildName: {
      get() {
        const getters = this.$store.getters;

        return getters.buildName;
      },

      set(value) {
        const getters = this.$store;
        store.dispatch("all", {
          mutation: "setBuildName",
          data: value,
        });
      },
    },
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

      return getters.teams[teamIndex].characters[characterIndex];
    },

    chooseBuild() {
      const getters = this.$store.getters;

      if (getters.buildName) {
        const builds = this.allBuilds();
        const build = find(builds, (build) => build.name == getters.buildName);
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

    setBuild() {
      this.$store.dispatch("all", {
        mutation: "setBuild",
      });
    },
  },

  mounted() {
    const store = this.$store;
    const preBuilds = store.getters.preBuilds;

    if (!preBuilds.length) {
      window.ipc
        .receive("readJsonFile", {
          folderPath: `$__static/data/genshin/`,
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
