<template>
  <div class="etfs-container">
    <div class="etf-detail-card">
      <div class="card-header">
        <h2 class="title">Metrics</h2>
      </div>

      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">Invested</span>
          <span class="stat-value">{{ formatCurrency(stats.invested) }}</span>
        </div>

        <div class="stat-item">
          <span class="stat-label">Out-of-Pocket Cost</span>
          <span class="stat-value">{{
            formatCurrency(stats.out_of_pocket)
          }}</span>
        </div>

        <div class="stat-item">
          <span class="stat-label">Compounding Cost</span>
          <span class="stat-value">{{
            formatCurrency(stats.compounding_cost)
          }}</span>
        </div>

        <div class="stat-item">
          <span class="stat-label">Cumulative Dividents</span>
          <span class="stat-value">{{
            formatCurrency(stats.cumulative_dividends)
          }}</span>
        </div>

        <div class="stat-item">
          <span class="stat-label">Lifetime Dividend ROI</span>
          <span class="stat-value">{{ stats.dividend_roi }}%</span>
        </div>
      </div>

      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">Upcoming Dividends</span>
          <span class="stat-value">{{
            formatCurrency(stats.dividends_this_month)
          }}</span>
        </div>
      </div>
    </div>

    <Etf :key="etf.ef_id" :etf="etf" v-for="etf in etfs" />
  </div>
</template>

<script>
import Etf from "./Etf.vue";
import { formatCurrency } from "@/components/Etfs/utils";

export default {
  name: "EtfList",
  components: { Etf },

  data() {
    return {
      etfs: [],
      stats: {},
    };
  },

  methods: {
    formatCurrency(value) {
      return formatCurrency(value, { maximumFractionDigits: 2 });
    },

    async fetchEtfs() {
      const response = await window.ipc.receive("api", {
        method: "GET",
        endpoint: "etfs-list",
        options: { useAPIKey: true },
      });

      if (response.ok) {
        return response.data;
      }

      return {};
    },

    async fetchDasboard() {
      const response = await window.ipc.receive("api", {
        method: "GET",
        endpoint: "etfs-dashboard",
        options: { useAPIKey: true },
      });

      if (response.ok) {
        return response.data;
      }

      return {};
    },
  },

  mounted() {
    this.fetchEtfs().then((resp) => {
      this.etfs = resp;
    });
    this.fetchDasboard().then((resp) => {
      this.stats = resp;
    });
  },
};
</script>
