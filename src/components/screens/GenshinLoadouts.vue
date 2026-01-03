<template>
  <div class="teams-container">
    <div class="teams">
      <div class="btn-container">
        <div class="simple-btn btn fill" @click="goBack">Back</div>
        <div class="simple-btn btn raise" @click="saveConfig">Save</div>
      </div>

      <Team
        :name="team.name"
        :characters="team.characters"
        :key="team.name"
        :index="index"
        v-for="(team, index) in teams"
      />
      <div class="new-team" @click="addNewTeam">&plus; Add New Team</div>
    </div>

    <div class="panel container" v-if="displayCharactersList">
      <CharacterList />
    </div>

    <div class="panel container" v-if="displayCharaterBuild">
      <CharacterBuild />
    </div>
  </div>
</template>

<style lang="scss">
.table {
  width: 100%;
  margin-top: 25px;
  border-collapse: collapse;
}

.teams-container {
  display: flex;

  .teams {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
  }

  .new-team {
    cursor: pointer;
    margin-top: 10px;
  }

  .panel {
    position: sticky;
    top: 0;

    background-color: #1c1d1e;

    padding-left: 25px;
    height: 100vh;
    width: 100%;
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
