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
          <div v-for="(stat, index) in subStats">
            {{ stat }}
          </div>
        </td>
        <td rowspan="5">
          <div v-for="artifact in artifacts">
            <img
              :alt="artifact.name"
              :src="`img/genshin/artifacts/${artifact.name.replaceAll(
                ' ',
                '_'
              )}_Flower.png`"
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
export default {
  name: "ArtifactsList",
  props: ["artifacts", "mainStats", "subStats"],
};
</script>
