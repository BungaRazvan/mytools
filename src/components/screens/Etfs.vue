<template>
  <header>
    <div @click="goBack" class="btn-back"><span class="icon">←</span> Back</div>

    <div class="main-controls">
      <div class="button-row">
        <button @click="setView('calendar')" class="btn-new">Calendar</button>
        <button @click="setView('list')" class="btn-new">List</button>
      </div>
    </div>
  </header>

  <EtfCalendar v-if="view == 'calendar'" />
  <EtfList v-if="view == 'list'" />
</template>

<style lang="scss">
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
</style>

<script>
import EtfCalendar from "@/components/Etfs/EtfCalendar.vue";
import EtfList from "@/components/Etfs/EtfList.vue";

import { mapGetters } from "vuex";

export default {
  name: "Etfs",
  props: ["goBack"],
  components: { EtfCalendar, EtfList },

  computed: {
    ...mapGetters("etfs", ["view"]),
  },

  methods: {
    setView(view) {
      const store = this.$store;

      store.dispatch("all", { mutation: "etfs/setView", data: view });
    },
  },
};
</script>
