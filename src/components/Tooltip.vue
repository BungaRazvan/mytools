<template>
  <span :data-text="this.text" class="tooltip"><slot></slot></span>
</template>

<style lang="scss">
.tooltip {
  position: relative; /* making the .tooltip span a container for the tooltip text */

  &::before {
    content: attr(data-text);
    font-size: 25px;
    position: absolute;

    transform: translate(-50%);
    top: 25%;
    left: 50%;

    width: max-content;
    padding: 10px;
    border-radius: 10px;
    background-color: #000;

    opacity: 0;
    transition: 0.5s opacity;
    z-index: 1;
  }

  &:hover {
    &::before {
      opacity: 1;
    }
  }
}
</style>

<script>
export default {
  name: "Tooltip",
  props: ["text"],
};
</script>
