<template>
  <div>
    {{ this.displayTime(time) }}
    <button @click="toggleScript">
      {{ !this.runningScript ? "Start" : "Stop" }} Script
    </button>
  </div>
</template>

<script>
import { secondsToHms } from "@/lib/vue/dates";

export default {
  name: "GameResourceTracking",
  data() {
    return {
      runningScript: false,
      time: 0,
      intervalId: null,
    };
  },

  methods: {
    displayTime(time) {
      if (!time) {
        return "00:00:00";
      }

      return secondsToHms(time, "numbers");
    },

    toggleScript() {
      if (!this.runningScript) {
        window.ipc.send("startPython", { script: "screen" });
        this.time = 0;
        this.intervalId = setInterval(() => {
          this.time++;
        }, 1000);
      } else {
        window.ipc.send("stopPython");
        clearInterval(this.intervalId);
        this.intervalId = null;
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
