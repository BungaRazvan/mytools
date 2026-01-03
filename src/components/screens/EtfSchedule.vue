<template>
  <div class="etfs-container" v-for="etf in etfs">
    <Etf :key="etf.ef_id" :etf="etf" />
  </div>
</template>

<style lang="scss">
.etfs-container {
  display: flex;
  gap: 15px;
  flex-direction: column;
}
</style>

<script>
import Etf from "@/components/EtfSchedule/Etf.vue";

export default {
  name: "EtfSchedule",
  props: ["goBack"],
  components: { Etf },

  methods: {
    async fetchEtfs() {
      const response = await window.ipc.receive("api", {
        method: "GET",
        endpoint: "list-etfs",
        options: { useAPIKey: true },
      });

      if (response.ok) {
        return response.data;
      }
    },
  },

  data() {
    return {
      etfs: [],
    };
  },

  mounted() {
    this.fetchEtfs().then((resp) => {
      this.etfs = resp;
    });
  },
};
</script>
