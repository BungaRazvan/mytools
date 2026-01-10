<template>
  <div class="teams-manager-layout">
    <aside class="sidebar">
      <header class="sidebar-header">
        <button class="btn-minimal" @click="goBack">← Back</button>
        <button class="btn-primary" @click="saveConfig">Save Changes</button>
      </header>

      <div class="team-list">
        <Team
          v-for="(team, index) in teams"
          :key="team.name"
          :name="team.name"
          :characters="team.characters"
          :index="index"
          class="team-entry"
        />

        <button class="add-team-trigger" @click="addNewTeam">
          <span class="plus-icon">+</span> Add New Team
        </button>
      </div>
    </aside>

    <main
      class="active-panel"
      v-if="displayCharactersList || displayCharaterBuild"
    >
      <div class="panel-content card">
        <CharacterList v-if="displayCharactersList" />
        <CharacterBuild v-if="displayCharaterBuild" />
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.teams-manager-layout {
  display: flex;
  height: 100vh;
  background-color: #121216; // Deep dark background
  color: #eee;

  .sidebar {
    width: 550px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    padding: 20px;

    .sidebar-header {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;

      button {
        flex: 1;
        padding: 10px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
      }

      .btn-minimal {
        background: transparent;
        border: 1px solid #3f3f4e;
        color: #888;
        &:hover {
          color: #fff;
          border-color: #ff4081;
        }
      }

      .btn-primary {
        background: #2d873f;
        border: none;
        color: white;
        &:hover {
          background: #36a44c;
        }
      }
    }
  }

  .active-panel {
    flex: 1;
    position: sticky;
    height: 1px;
    top: 0px;

    .panel-content {
      max-width: 800px;
      margin: 0 auto;
      background: #1c1d1e;
      border-radius: 12px;

      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
  }

  .add-team-trigger {
    width: 100%;
    margin-top: 20px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.02);
    border: 2px dashed #3f3f4e;
    border-radius: 8px;
    color: #888;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: #fff;
      border-color: #2d873f;
      background: rgba(45, 135, 63, 0.05);
    }
  }
}

// Rarity Colors (Global or Shared)
:deep(.five-star) {
  background-color: #9f682a !important;
}
:deep(.four-star) {
  background-color: #68598d !important;
}
</style>

<script>
import { mapGetters } from "vuex";

import Team from "@/components/GenshinLoadouts/Team.vue";
import CharacterList from "@/components/GenshinLoadouts/CharacterList.vue";
import CharacterBuild from "@/components/GenshinLoadouts/CharacterBuild.vue";
import Tooltip from "@/components/Tooltip.vue";

export default {
  name: "GenshinLoadouts",
  props: ["goBack"],
  components: { Team, CharacterList, CharacterBuild, Tooltip },

  computed: {
    ...mapGetters(["displayCharaterBuild", "displayCharactersList", "teams"]),
  },

  methods: {
    saveConfig() {
      window.ipc.send("writeJsonFile", {
        fileName: "genshinLoadouts.json",
        data: JSON.parse(JSON.stringify(this.teams)),
        overwrite: true,
      });
    },

    addNewTeam() {
      this.$store.dispatch("all", {
        mutation: "addNewTeam",
      });
    },
  },

  mounted() {
    const store = this.$store;

    window.ipc
      .receive("readJsonFile", {
        fileName: "genshinLoadouts.json",
      })
      .then((data) => {
        if (!data) {
          data = { data: [{ name: `Team #1`, characters: [] }] };
        }

        store.dispatch("all", {
          data: data.data,
          mutation: "setTeams",
        });
      });
  },

  unmounted() {
    this.saveConfig();
  },
};
</script>
