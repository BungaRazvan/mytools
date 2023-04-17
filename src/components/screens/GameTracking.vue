<template>
  <div>
    <div
      class="game-info"
      :class="{ 'game-running': game.running }"
      v-for="game in this.$store.getters.gamesData"
      :key="game.app"
    >
      <div class="title"></div>
      <h1>{{ game.app }}</h1>
      <div class="info">
        <p>PLAY TIME: {{ game.time }} hour/s</p>
        <p>
          LAST PLAYED:
          {{ this.checkDate(game.played, game.running) }}
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.game-info {
  &.game-running {
    color: #a972cb;
  }
}
</style>

<script>
export default {
  name: "GameTracking",

  methods: {
    checkDate(date, isRunning) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (isRunning) {
        return "Today";
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

    getGameData() {
      const store = this.$store;

      window.ipc.send("getGamesDataCSV");
      window.ipc.receive("getGamesDataCSV", (data) => {
        store.dispatch("all", {
          mutation: "setGamesData",
          data: data,
        });
      });
    },
  },

  mounted() {
    this.getGameData();
  },
};
</script>
