<template>
  <svg
    class="sparkline-svg"
    :class="{ glowing: isHighlighted }"
    viewBox="0 0 100 30"
    preserveAspectRatio="none"
  >
    <path :d="pathData" :fill="`url(#${gradientId})`" />
    <path :d="lineData" fill="none" class="stroke-line" />
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
        <stop
          offset="0%"
          :stop-color="
            isHighlighted
              ? 'rgba(74, 222, 128, 0.25)'
              : 'rgba(255, 255, 255, 0.03)'
          "
        />
        <stop
          offset="100%"
          :stop-color="
            isHighlighted ? 'rgba(16, 185, 129, 0)' : 'rgba(255, 255, 255, 0)'
          "
        />
      </linearGradient>
    </defs>
  </svg>
</template>

<script>
export default {
  name: "Sparkline",
  props: {
    history: {
      type: Array,
      required: true,
    },
    isHighlighted: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // Random fallback ID to keep separate gradient elements safe on the DOM
      gradientId: `sparkline-grad-${Math.random()
        .toString(36)
        .substring(2, 9)}`,
    };
  },
  computed: {
    normalizedPoints() {
      if (!this.history || this.history.length === 0) return [];
      if (this.history.length === 1)
        return [
          { x: 0, y: 15 },
          { x: 100, y: 15 },
        ];

      const min = Math.min(...this.history);
      const max = Math.max(...this.history);
      const range = max - min === 0 ? 1 : max - min;

      return this.history.map((val, index) => {
        const x = (index / (this.history.length - 1)) * 100;
        // Map elements into our 30px high boundary container cleanly
        const y = 27 - ((val - min) / range) * 24;
        return { x, y };
      });
    },
    lineData() {
      if (this.normalizedPoints.length === 0) return "";
      return this.normalizedPoints.reduce((acc, p, i) => {
        return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
      }, "");
    },
    pathData() {
      if (this.normalizedPoints.length === 0) return "";
      return `${this.lineData} L 100 30 L 0 30 Z`;
    },
  },
};
</script>

<style lang="scss" scoped>
.sparkline-svg {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  pointer-events: none;
  opacity: 0.5;

  .stroke-line {
    stroke: rgba(255, 255, 255, 0.12);
    stroke-width: 1.25;
  }

  &.glowing {
    opacity: 1;
    .stroke-line {
      stroke: rgba(74, 222, 128, 0.5);
      stroke-width: 1.5;
    }
  }
}
</style>
