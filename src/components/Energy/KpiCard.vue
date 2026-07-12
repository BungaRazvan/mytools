<template>
  <div class="kpi-card">
    <span class="kpi-label">{{ label }}</span>
    <div :class="'kpi-value-' + type">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "KpiCard",
  props: ["label", "type"],
};
</script>
