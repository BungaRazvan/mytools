<template>
  <table class="table artifacts-table">
    <tbody>
      <tr>
        <th></th>
        <th>Main Stat</th>
        <th>Sub stats</th>
        <th>Set</th>
      </tr>
      <tr>
        <td>Flower</td>
        <td>HP</td>
        <td rowspan="5">
          <div v-for="stat in subStats">
            {{ stat }}
          </div>
        </td>
        <td rowspan="5">
          <div v-for="(artifact, index) in artifacts">
            <img
              :alt="artifact.name"
              :src="artifactNameToImage(artifact.name)"
              v-if="!artifact.name.includes('Any')"
            />

            <hr v-if="artifact.name.includes('Any') && index != 0" />
            <ImageList
              v-if="artifact.name.includes('Any')"
              :images="findArtifacts(artifact.name)"
            />
            <div>x {{ artifact.no }}</div>
            <div>{{ artifact.name }}</div>
          </div>
        </td>
      </tr>
      <tr>
        <td>Feather</td>
        <td>ATK</td>
      </tr>
      <tr>
        <td>Sands</td>
        <td>{{ mainStats.sands }}</td>
      </tr>
      <tr>
        <td>Goblet</td>
        <td>{{ mainStats.goblet }}</td>
      </tr>
      <tr>
        <td>Circlet</td>
        <td>{{ mainStats.circlet }}</td>
      </tr>
    </tbody>
  </table>

  <div class="extra-info">
    For the 5th piece pick any set. Just make sure it has the right main and sub
    stats
  </div>
</template>

<style lang="scss">
.artifacts-table {
  font-size: 25px;

  th {
    background-color: #464545;
  }

  td {
    border: 1px solid #464545;
    text-align: center;
    padding: 10px;

    div {
      margin: 15px 0;
    }
  }

  tr {
    border: 2px solid #464545;
  }
}

.extra-info {
  margin: 10px 0;
}
</style>

<script>
import { mapGetters } from "vuex";
import { filter, map } from "lodash";

import ImageList from "@/components/ImageList.vue";

export default {
  name: "ArtifactsList",
  props: ["artifacts", "mainStats", "subStats"],
  components: { ImageList },

  computed: {
    ...mapGetters(["allArtifacts"]),
  },

  methods: {
    findArtifacts(setName) {
      let stat = setName.replaceAll("Any", "").replaceAll("Bonus", "").trim();

      if (stat == "ATK%") {
        stat = "ATK";
      }

      const artifacts = filter(this.allArtifacts, (artifact) => {
        if (artifact.bonus["2-piece"].includes(stat)) {
          return artifact;
        }
      });

      return map(artifacts, (artifact) =>
        this.artifactNameToImage(artifact.set_name)
      );
    },

    artifactNameToImage(name) {
      return `img/genshin/artifacts/${name.replaceAll(" ", "_")}_Flower.png`;
    },
  },

  mounted() {
    const store = this.$store;

    if (!this.allArtifacts.length) {
      window.ipc
        .receive("readJsonFile", {
          folderPath: `$__static/data/genshin/`,
          fileName: "artifacts.json",
        })
        .then((data) => {
          store.dispatch("all", {
            mutation: "setAllArtifacts",
            data: data.data,
          });
        });
    }
  },
};
</script>
