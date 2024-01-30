<template>
  <div class="game-title">
    <input
      class="game-number"
      type="number"
      @blur="changeOrder($event)"
      :value="order"
      min="0"
      :max="maxOrder"
      :style="{ width: 50 + (order - 1) * 0.05 + 'px' }"
    />

    <h1>- {{ title }}</h1>
  </div>
  <div class="game-info">
    <p>Play Time: {{ this.displayTime(time) }} hour/s</p>
    <p>
      Last Played:
      {{ this.checkDate(played, running) }}
    </p>
  </div>
</template>

<style lang="scss">
.game-title {
  h1 {
    display: inline;
  }

  .game-number {
    background-color: inherit;
    display: inline-block;
    border: none;
    color: #fff;
    font-size: 50px;
  }
}
</style>

<script>
export default {
  name: "Game",
  props: {
    title: String,
    time: Number,
    played: Date,
    running: Boolean,
    order: Number,
    maxOrder: Number,
    onChangeOrder: Function,
  },

  methods: {
    checkDate(date, isRunning) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (isRunning) {
        return "Today";
      }

      if (!date) {
        return "";
      }

      if (date.toDateString() === today.toDateString()) {
        return "Today";
      }

      if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      }

      return date
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
        .replace(/^\w+,\s/, "");
    },

    displayTime(time) {
      if (!time) {
        return 0;
      }

      return Math.floor(time / 3600);
    },

    changeOrder(event) {
      const newOrder = Number(event.target.value);

      // special case where the user migth type a invalid number
      if (newOrder == this.order) {
        event.target.value = this.order;
        return;
      }

      if (newOrder > event.target.max) {
        event.target.value = this.order;
        return;
      }

      if (newOrder < event.target.min) {
        event.target.value = this.order;
        return;
      }

      this.onChangeOrder(this.order, newOrder);
    },
  },
};
</script>
