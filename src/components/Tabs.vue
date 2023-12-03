<template>
  <div class="tabs-container">
    <div class="tab-headers" v-if="tabs" :class="{ center: isCenter }">
      <div
        class="tab-header"
        :class="[determineActive(tab)]"
        v-for="tab in tabs"
        @click="switchTab(tab)"
      >
        {{ tab }}
      </div>
    </div>

    <div class="tabs" v-for="tab in tabs">
      <slot v-if="currentTab === tab" :name="tab"></slot>
    </div>
  </div>
</template>

<style lang="scss">
.tabs-container {
  height: 100%;
  margin: 20px 0;

  .tab-headers {
    display: flex;
    flex-flow: wrap row;
    border: 1px solid #ccc;

    .tab-header {
      cursor: pointer;
      padding: 15px;
      flex: 1;

      &:hover,
      &.active {
        background-color: #484949;
      }
    }

    &.center {
      justify-content: center;
      text-align: center;
    }
  }
}
</style>

<script>
export default {
  name: "Tabs",
  props: ["tabs", "activeTab", "isCenter"],

  methods: {
    switchTab(tab) {
      this.currentTab = tab;
    },
    determineActive(tab) {
      if (tab == this.currentTab) {
        return "active";
      }
    },
  },
  data() {
    return {
      currentTab: this.activeTab
        ? this.activeTab
        : this.tabs
        ? this.tabs[0]
        : null,
    };
  },
};
</script>
