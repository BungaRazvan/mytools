<template>
  <div class="item-slot" :title="name">
    <div class="icon-wrapper">
      <div class="item-image-placeholder">
        <span class="item-initial">
          <img
            v-if="!imageError"
            :src="itemNametoImage(name)"
            :alt="name"
            @error="imageError = true"
            class="item-img"
          />

          <div v-if="imageError" class="letter-placeholder">
            {{ name.charAt(0).toUpperCase() }}
          </div>
        </span>
      </div>
      <div class="amount-badge">x{{ amount }}</div>
    </div>
    <div class="item-label">{{ name }}</div>
  </div>
</template>

<style lang="scss" scoped>
.item-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90px;

  .icon-wrapper {
    position: relative;
    width: 80px;
    height: 80px;
    background: linear-gradient(180deg, #4b4d5e 0%, #323345 100%);
    border-radius: 8px;
    border-bottom: 4px solid #909399;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }

  .item-image-placeholder {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .item-initial {
      font-size: 2rem;
      color: rgba(255, 255, 255, 0.1);
      font-weight: bold;

      img {
        width: 100%;
        height: 100%;
        margin-top: 15px;
      }
    }
  }

  .amount-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 1rem;
    font-weight: 800;
    text-align: right;
    padding: 2px 6px;
  }

  .item-label {
    margin-top: 6px;
    font-size: 1rem;
    color: #fff;
    text-align: center;
    text-transform: capitalize;
    display: -webkit-box;

    -webkit-box-orient: vertical;
    overflow: hidden;
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

  data() {
    return {
      imageError: false,
    };
  },
};
</script>
