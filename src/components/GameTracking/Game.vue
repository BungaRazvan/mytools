<template>
  <div>
    <div class="title"></div>
    <h1>{{ title }}</h1>
    <div class="info">
      <p>Play Time: {{ this.displayTime(time) }} hour/s</p>
      <p>
        Last Played:
        {{ this.checkDate(played, running) }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Game",
  props: {
    title: String,
    time: Number,
    played: Date,
    running: Boolean,
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
  },
};
</script>
