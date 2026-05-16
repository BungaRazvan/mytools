<template>
  <div class="etf-schedule">
    <header>
      <div @click="goBack" class="btn-back">
        <span class="icon">←</span> Back
      </div>

      <div class="main-controls">
        <div class="button-row">
          <button @click="toggleView" class="btn-new">Switch View</button>
        </div>
      </div>
    </header>

    <EtfList v-if="view === 'list'" />

    <EtfCalendar v-if="view == 'calendar'" />
  </div>
</template>

<style lang="scss">
.etf-schedule {
  .etfs-container {
    display: flex;
    gap: 15px;
    flex-direction: column;
  }

  header {
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

    .main-controls {
      display: flex;
      align-items: center;

      .button-row {
        display: flex;
        gap: 12px;
      }
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

    .btn-new {
      background: #3f3f4e;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
    }
  }

  .est {
    font-size: 10px;
    background: #4b5563;
    padding: 1px 4px;
    border-radius: 3px;
    margin-right: 5px;
    color: #fff;
  }
}
</style>

<script>
import EtfCalendar from "@/components/EtfSchedule/EtfCalendar.vue";
import EtfList from "@/components/EtfSchedule/EtfList.vue";

export default {
  name: "EtfSchedule",
  props: ["goBack"],
  components: { EtfList, EtfCalendar },

  methods: {
    toggleView() {
      this.view = this.view == "calendar" ? "list" : "calendar";
    },
  },

  data() {
    return {
      view: "calendar",
    };
  },
};
</script>
