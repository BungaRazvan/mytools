<template>
  <div class="game-resource-tracking">
    <header class="tracking-header">
      <div @click="goBack" class="btn-back">
        <span class="icon">←</span> Back
      </div>

      <div class="main-controls" v-if="tesseractInstalled">
        <div class="session-timer">
          <span class="label">Duration</span>
          <span class="time-val">{{ displayTime(resourceTime) }}</span>
        </div>

        <div class="button-row">
          <button
            @click="toggleScript"
            class="btn-action"
            :class="isScriptRunning ? 'btn-stop' : 'btn-start'"
          >
            {{ isScriptRunning ? "Stop Script" : "Start Script" }}
          </button>

          <button v-if="isScriptRunning" @click="newRun" class="btn-new">
            New Run
          </button>
        </div>
      </div>
    </header>

    <div v-if="!tesseractInstalled" class="alert-error">
      <p>
        Google Tesseract is missing.
        <strong>OCR tracking will not work.</strong>
      </p>
      <a @click="openTesseract">Install Tesseract</a>
    </div>

    <section class="current-run">
      <h2 class="section-title">Current Session Items</h2>
      <div class="items-grid main-grid">
        <Item
          v-for="(value, key) in items"
          :key="key"
          :amount="value"
          :name="key"
        />
        <div v-if="!Object.keys(items).length" class="empty-msg">
          Waiting for script data...
        </div>
      </div>
    </section>

    <section class="history-list" v-if="previousRuns.length">
      <h2 class="section-title">Previous Runs</h2>

      <div
        v-for="(run, index) in previousRuns"
        :key="'run-' + index"
        class="run-card"
      >
        <div class="run-info">
          <span class="run-duration">⏱ {{ displayTime(run.time) }}</span>
          <span class="run-date">{{ displayDate(run.date) }}</span>
        </div>
        <div class="items-grid scrollable-grid">
          <Item
            v-for="(value, key) in run.items"
            :key="key"
            :amount="value"
            :name="key"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss">
.game-resource-tracking {
  padding: 24px;
  background: #121216;
  min-height: 100vh;
  color: #eee;

  // Header Bar
  .tracking-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #1c1c24;
    padding: 16px 24px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    margin-bottom: 32px;
    position: sticky;
    top: 0px;
    z-index: 50;
  }

  .btn-back {
    color: #ff4081;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: translateX(-3px);
    }
  }

  .session-timer {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-right: 20px;

    .label {
      font-size: 0.65rem;
      text-transform: uppercase;
      color: #888;
    }

    .time-val {
      font-family: monospace;
      font-size: 1.4rem;
      color: #2d873f;
    }
  }

  .main-controls {
    display: flex;
    align-items: center;
  }

  .button-row {
    display: flex;
    gap: 12px;
  }

  // Section Headers
  .section-title {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #666;
    margin-bottom: 16px;
    padding-left: 8px;
    border-left: 3px solid #3f3f4e;
  }

  // Grid Logic
  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 16px;
    padding: 20px;
    background: #18181f;
    border-radius: 12px;

    &.main-grid {
      border: 1px solid rgba(45, 135, 63, 0.2);
    }
  }

  // History Run Cards
  .run-card {
    background: #1c1c24;
    border-radius: 12px;
    margin-bottom: 24px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.03);

    .run-info {
      background: rgba(0, 0, 0, 0.3);
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .run-duration {
        color: #2d873f;
        font-weight: bold;
        font-size: 0.9rem;
      }

      .run-date {
        color: #888;
        font-size: 0.8rem;
      }
    }

    .scrollable-grid {
      background: transparent;
      padding: 16px;
    }
  }

  // Buttons
  .btn-action {
    padding: 10px 20px;
    border-radius: 6px;
    border: none;
    font-weight: bold;
    cursor: pointer;
    color: #fff;
  }

  .btn-start {
    background: #2d873f;

    &:hover {
      background: #36a44c;
    }
  }

  .btn-stop {
    background: #b33939;

    &:hover {
      background: #d34a4a;
    }
  }

  .btn-new {
    background: #3f3f4e;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
  }

  .alert-error {
    background: rgba(179, 57, 57, 0.1);
    border: 1px solid #b33939;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    a {
      color: #fff;
      text-decoration: underline;
      cursor: pointer;
    }
  }

  .empty-msg {
    grid-column: 1 / -1;
    text-align: center;
    color: #555;
    padding: 20px;
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
      fileName: "gameResourceTracking.json",
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
          window.ipc.send("writeFile", {
            fileName: this.fileName,
            data: JSON.stringify({
              game: "StarRail",
              items: { ...this.items },
              time: this.resourceTime,
              date: new Date().toISOString(),
            }),
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
        window.ipc.send("writeFile", {
          fileName: this.fileName,
          data: JSON.stringify({
            game: "StarRail",
            items: { ...this.items },
            time: this.resourceTime,
            date: new Date().toISOString(),
          }),
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
        .receive("readJsonFile", { fileName: this.fileName })
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
