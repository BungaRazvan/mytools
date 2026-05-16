<template>
  <div class="etfs-container">
    <Etf :key="etf.ef_id" :etf="etf" v-for="etf in etfs" />
  </div>
</template>

<script>
import Etf from "./Etf.vue";

export default {
  name: "EtfList",
  components: { Etf },

  data() {
    return {
      etfs: [],
    };
  },

  methods: {
    async fetchEtfs() {
      const response = await window.ipc.receive("api", {
        method: "GET",
        endpoint: "etfs-list",
        options: { useAPIKey: true },
      });

      if (response.ok) {
        return response.data;
      }
    },
  },

  mounted() {
    this.fetchEtfs().then((resp) => {
      this.etfs = resp;
    });
  },
};
</script>
