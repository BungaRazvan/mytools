<template>
  <span v-if="isPerformance" class="asterix">*</span>
</template>

<script>
export default {
  name: "Asterix",
  props: {
    isPerformance: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
