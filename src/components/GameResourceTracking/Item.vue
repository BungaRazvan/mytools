<template>
  <div class="item">
    <img :src="this.itemNametoImage(name)" />
    <div class="description">{{ name }} x{{ amount }}</div>
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
    itemNametoImage(item) {
      const itemName = item.replaceAll(" ", "_");

      return `img/star_rail/materials/${itemName}.png`;
    },
  },
};
</script>
