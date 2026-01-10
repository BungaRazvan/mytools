<template>
  <div class="card" :class="{ 'is-running': running }">
    <div class="header game-header">
      <div class="order-wrapper">
        <input
          class="order-input"
          type="number"
          :value="order"
          :min="0"
          :max="maxOrder"
          @blur="changeOrder"
          @keyup.enter="$event.target.blur()"
        />
      </div>
      <h2 class="game-title">{{ title }}</h2>
      <span v-if="running" class="status-badge">Live</span>
    </div>

    <div class="game-stats">
      <div class="stat-item">
        <span class="stat-label">Play Time</span>
        <span class="stat-value">{{ hoursPlayed }} hrs</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Last Played</span>
        <span class="stat-value">{{ formattedLastPlayed }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Session</span>
        <span class="stat-value">{{ secondsToHms(lastSession) }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.card {
  &.is-running {
    border-left-color: #2d873f;
    background: #1e2621;

    .status-badge {
      background: #2d873f;
      color: white;
    }
  }
}

.order-input {
  background: inherit;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #fff;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 8px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #2d873f;
  }

  &::-webkit-inner-spin-button {
    background-color: #1e1e26;
    width: 10px;
    // -webkit-appearance: none;
  }
}

.game-title {
  font-size: 1.5rem;
  margin: 0;
  flex-grow: 1;
}

.status-badge {
  font-size: 0.75rem;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: bold;
}

.game-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1rem;
  font-weight: 500;
  margin-top: 4px;
}
</style>

<script>
import { secondsToHms } from "@/lib/vue/dates";

export default {
  name: "GameCard",
  props: {
    title: String,
    time: Number,
    played: Date,
    running: Boolean,
    order: Number,
    maxOrder: Number,
    lastSession: Number,
    onChangeOrder: Function,
  },
  computed: {
    hoursPlayed() {
      return Math.floor((this.time || 0) / 3600);
    },
    formattedLastPlayed() {
      return this.checkDate(this.played, this.running);
    },
  },
  methods: {
    secondsToHms,
    checkDate(date, isRunning) {
      if (isRunning) {
        return "Today";
      }

      if (!date) {
        return "Never";
      }

      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

      if (isSameDay(date, today)) {
        return "Today";
      }

      if (isSameDay(date, yesterday)) {
        return "Yesterday";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    changeOrder(event) {
      const newOrder = Number(event.target.value);
      if (newOrder === this.order || newOrder > this.maxOrder || newOrder < 0) {
        event.target.value = this.order;
        return;
      }
      this.onChangeOrder(this.order, newOrder);
    },
  },
};
</script>
