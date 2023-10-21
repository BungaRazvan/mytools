<template>
  <div class="timer">
    {{ this.displayTime(time) }}
    <button @click="toggleScript">
      {{ !this.runningScript ? "Start" : "Stop" }} Script
    </button>
  </div>

  <div class="items">
    <div class="item" v-for="(value, key) in items">
      <img :src="`img/star_rail/materials/${this.itemNametoImage(key)}`" />
      <div class="description">
        {{ this.itemToProperName(key) }} x{{ value }}
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.timer {
  margin-bottom: 20px;
}

.items {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  gap: 25px;

  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-basis: 15%;

    img {
      width: 150px;
      height: 150px;
    }

    .description {
      text-align: center;
      word-break: break-word;
      padding-top: 15px;
    }
  }
}
</style>

<script>
import { secondsToHms } from "@/lib/vue/dates";
import { mergeWith, isEmpty, isNumber } from "lodash";

export default {
  name: "GameResourceTracking",
  props: ["goBack"],

  data() {
    return {
      runningScript: false,
      time: 0,
      intervalId: null,
      items: {},
    };
  },

  methods: {
    itemToProperName(item) {
      let itemName = item;

      switch (itemName) {
        case "Strange Matter of":
          itemName += " Destruction";
          break;

        case "Conquerors Will":
          itemName = "Conqueror's Will";
          break;

        case "Thiefs Instinct":
          itemName = "Thief's Instinct";
          break;

        case "Usurpers Scheme":
          itemName = "Usurper’s Scheme";
          break;
      }

      return itemName;
    },

    itemNametoImage(item) {
      let itemName = this.itemToProperName(item);

      return itemName.replaceAll(" ", "_") + ".png";
    },

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

        if (!isEmpty(this.items)) {
          window.ipc.send("saveItems", {
            items: { ...this.items },
            time: this.time,
          });
        }

        this.items = {};
      }

      this.runningScript = !this.runningScript;
    },
  },

  mounted() {
    window.ipc.on("python-screen", (data) => {
      const items = JSON.parse(data);

      this.items = mergeWith(this.items, items, (srcValue, objValue) => {
        if (isNumber(objValue) && isNumber(srcValue)) {
          return objValue + srcValue;
        }
      });
    });
  },
};
</script>
