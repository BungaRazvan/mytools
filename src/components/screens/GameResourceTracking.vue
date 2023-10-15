<template>
  <div>
    <button @click="toggleScript">
      {{ !this.runningScript ? "Start" : "Stop" }} Script
    </button>
  </div>
</template>

<script>
export default {
  name: "GameResourceTracking",
  data() {
    return {
      runningScript: false,
    };
  },

  methods: {
    toggleScript() {
      if (!this.runningScript) {
        window.ipc.send("startPython", { script: "screen" });
      } else {
        window.ipc.send("stopPython");
      }

      this.runningScript = !this.runningScript;
    },
  },

  mounted() {
    window.ipc.on("python-screen", (data) => {
      console.log(JSON.parse(data));
    });
  },
};
</script>
