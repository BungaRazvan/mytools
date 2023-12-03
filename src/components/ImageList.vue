<template>
  <div class="image-container">
    <img v-for="img in images" :src="img" />
  </div>
</template>

<style lang="scss"></style>

<script>
export default {
  name: "ImageList",
  props: ["images"],
};
</script>
