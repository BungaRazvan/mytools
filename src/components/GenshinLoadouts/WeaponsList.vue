<template>
  <table class="table weapons-table">
    <tbody>
      <tr>
        <th>Best Weapon</th>
        <td class="center">
          <img :src="this.itemNametoImage(this.weapon, 'weapon')" />
          <div>
            <span>{{ weapon }} </span>
          </div>
        </td>
      </tr>
      <tr>
        <th>Replacements</th>
        <td class="column center">
          <div v-for="substitute in substitutes">
            <img :src="this.itemNametoImage(substitute, 'weapon')" />
            <div>{{ substitute }}</div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style lang="scss">
.weapons-table {
  font-size: 25px;
  width: 100%;

  tr {
    border: 1px solid #464545;

    th {
      background-color: #464545;
      padding: 10px;
      border: 1px solid #1e1d1d;
    }
  }

  .center {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .column {
    display: flex;
    flex-flow: row wrap;
    text-align: center;

    div {
      flex-basis: 25%;
    }
  }

  img {
    width: 100px;
  }
}
</style>

<script>
export default {
  name: "WeaponsList",
  props: ["weapon", "substitutes"],

  methods: {
    itemNametoImage(itemName) {
      return "img/genshin/weapons/" + itemName.replaceAll(" ", "_") + ".png";
    },
  },
};
</script>
