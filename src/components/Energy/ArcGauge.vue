<template>
  <div class="arc-gauge-wrapper">
    <svg viewBox="0 0 200 110" class="gauge-svg">
      <!-- Glow Filter -->
      <defs>
        <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Background Track Arc -->
      <path
        d="M 20 95 A 80 80 0 0 1 180 95"
        fill="none"
        stroke="#1c2533"
        stroke-width="14"
        stroke-linecap="round"
      />

      <!-- Active Progress Arc -->
      <path
        d="M 20 95 A 80 80 0 0 1 180 95"
        fill="none"
        stroke="#38bdf8"
        stroke-width="14"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        filter="url(#cyan-glow)"
        class="gauge-progress"
      />

      <!-- Large Centered Percentage Text -->
      <text x="100" y="95" text-anchor="middle" class="gauge-text">
        {{ formattedValue }}
      </text>
    </svg>
  </div>
</template>

<script>
export default {
  name: "ArcGauge",
  props: {
    value: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    min: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      radius: 80,
    };
  },
  computed: {
    circumference() {
      return Math.PI * this.radius;
    },
    clampedPercentage() {
      const val = Number(this.value) || 0;
      const pct = ((val - this.min) / (this.max - this.min)) * 100;
      return Math.min(Math.max(pct, 0), 100);
    },
    strokeDashoffset() {
      return (
        this.circumference - (this.clampedPercentage / 100) * this.circumference
      );
    },
    formattedValue() {
      const val = Number(this.value) || 0;
      return `${val.toFixed(1)}%`;
    },
  },
};
</script>

<style scoped>
.arc-gauge-wrapper {
  width: 100%;
  max-width: 160px; /* Slightly wider wrapper to give text room to breathe */
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.gauge-svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}

.gauge-progress {
  transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.gauge-text {
  fill: #ffffff;
  font-size: 2.1rem; /* Increased from 1.4rem for clear visual hierarchy */
  font-weight: 800; /* Bold weight matching £3.95 / £1.80 titles */
  font-family: system-ui, -apple-system, sans-serif;
  letter-spacing: -0.03em;
}
</style>
