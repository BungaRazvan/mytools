<template>
  <div class="item">
    <img :src="`img/star_rail/materials/${this.itemNametoImage(name)}`" />
    <div class="description">
      {{ this.itemToProperName(name) }} x{{ amount }}
    </div>
  </div>
</template>

<style lang="scss">
.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-basis: 15%;

  img {
    width: 150px;
    height: 150px;
  }

  .description {
    text-align: center;
    word-break: break-word;
    padding-top: 15px;
  }
}
</style>

<script>
export default {
  name: "Items",
  props: ["amount", "name"],

  methods: {
    itemToProperName(item) {
      let itemName = item;

      if (item.includes("Strange")) {
        itemName = "Strange Matter of Destruction";
        return itemName;
      }

      switch (itemName) {
        case "Conquerors Will":
          itemName = "Conqueror's Will";
          break;

        case "Thiefs Instinct":
          itemName = "Thief's Instinct";
          break;

        case "Usurpers Scheme":
          itemName = "Usurper’s Scheme";
          break;
      }

      return itemName;
    },

    itemNametoImage(item) {
      let itemName = this.itemToProperName(item);

      return itemName.replaceAll(" ", "_") + ".png";
    },
  },
};
</script>
