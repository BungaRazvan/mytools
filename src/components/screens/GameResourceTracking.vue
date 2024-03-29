<template>
  <div class="game-resource-tracking">
    <div class="container">
      <div @click="goBack" class="back-button">
        <div class="btn pulse">Back</div>
      </div>

      <div v-if="!tesseractInstalled">
        This program required Google's Tesseract Software. Please install it
        from
        <a @click="openTesseract">here</a>
      </div>

      <div class="timer" v-if="tesseractInstalled">
        {{ displayTime(resourceTime) }}

        <div
          @click="toggleScript"
          class="btn"
          :class="{ danger: isScriptRunning, slide: !isScriptRunning }"
        >
          {{ !isScriptRunning ? "Start" : "Stop" }} Script
        </div>
        <div @click="newRun" v-if="isScriptRunning" class="btn slide">
          New Run
        </div>
      </div>
    </div>

    <div class="items">
      <Item :amount="value" :name="key" v-for="(value, key) in items" />
    </div>

    <div class="previous-items">
      <div v-for="item in previousItems">
        <div class="divider">
          <p>{{ displayTime(item.time) }}</p>
        </div>

        <div class="items">
          <Item
            :amount="value"
            :name="key"
            v-for="(value, key) in item.items"
          />
        </div>
      </div>
    </div>

    <div class="previous-runs">
      <div v-for="run in previousRuns">
        <div class="divider">
          <p>{{ displayTime(run.time) }}</p>

          <p class="right">{{ displayDate(run.date) }}</p>
        </div>

        <div class="items">
          <Item :amount="value" :name="key" v-for="(value, key) in run.items" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.game-resource-tracking {
  button,
  .btn {
    display: inline;
    cursor: pointer;
    padding: 0.5em 0.5em;
  }

  .container {
    display: flex;
    justify-content: center;
    align-items: center;

    .back-button {
      flex: 1;
    }

    .timer {
      flex: 2;
      margin: 20px 0;
    }

    a {
      text-decoration: underline;
      color: #1d61a5;
    }
  }

  .items {
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    gap: 25px;
    margin-top: 25px;
  }

  .right {
    float: right;
    clear: both;
  }

  .divider {
    position: relative;
    margin-top: 50px;

    p {
      position: relative;
      display: inline-block;
      padding: 0 10px;
      margin: 0 20px;
      top: -17px;

      background-color: #282a2c;
    }

    &::before {
      content: "";
      display: block;
      border-top: 1px solid #fff;
    }
  }
}
</style>

<script>
import { secondsToHms } from "@/lib/vue/dates";
import { isEmpty, reverse } from "lodash";
import { mapGetters } from "vuex";

import { displayDate } from "@/lib/vue/dates";

import Item from "@/components/GameResourceTracking/Item";

export default {
  name: "GameResourceTracking",
  props: ["goBack"],
  components: { Item },

  data() {
    return {
      tesseractInstalled: false,
    };
  },

  methods: {
    openTesseract() {
      window.ipc.send("openBrowser", {
        url: "https://tesseract-ocr.github.io/tessdoc/Installation.html",
      });
    },

    displayTime(time) {
      if (!time) {
        return "00:00:00";
      }

      return secondsToHms(time, "numbers");
    },

    displayDate(date) {
      return new Date(date).toDateString();
    },

    toggleScript() {
      const store = this.$store;

      if (!this.isScriptRunning) {
        window.ipc.send("startPython", { script: "star_rail_items" });

        store.dispatch("all", {
          mutation: "setTime",
        });
      } else {
        window.ipc.send("stopPython");
        clearInterval(this.resourceInterval);

        if (!isEmpty(this.items)) {
          window.ipc.send("saveItems", {
            items: { ...this.items },
            time: this.resourceTime,
          });
        }

        store.dispatch("all", {
          mutation: "saveItems",
          data: {
            items: this.items,
            time: this.resourceTime,
          },
        });
      }

      store.dispatch("all", { mutation: "toggleRunningScript" });
    },

    newRun() {
      const store = this.$store;

      if (!isEmpty(this.items)) {
        window.ipc.send("saveItems", {
          items: { ...this.items },
          time: this.resourceTime,
        });
      }

      store.dispatch("all", {
        mutation: "saveItems",
        data: {
          items: this.items,
          time: this.resourceTime,
        },
      });
    },
  },

  computed: {
    ...mapGetters([
      "isScriptRunning",
      "items",
      "previousItems",
      "resourceTime",
      "resourceInterval",
      "previousRuns",
    ]),
  },

  mounted() {
    const store = this.$store;

    window.ipc.receive("checkForTesseract").then((data) => {
      this.tesseractInstalled = data;
    });

    if (!this.previousRuns.length && !this.previousItems.length) {
      window.ipc
        .receive("readJsonFile", { fileName: "gameResourceTracking.json" })
        .then((data) => {
          store.dispatch("all", {
            mutation: "setPreviousRuns",
            data: reverse(data.data) || [],
          });
        });
    }
  },

  unmounted() {
    const store = this.$store;

    if (this.previousItems.length && !this.isScriptRunning) {
      store.dispatch("all", { mutation: "setPreviousItems", data: [] });
    }
  },
};
</script>
