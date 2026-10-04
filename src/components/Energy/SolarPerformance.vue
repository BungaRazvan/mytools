<template>
  <header class="header-container">
    <div class="header-title">
      <h1 class="main-title">Solar Economy</h1>
      <p class="subtitle">Financial ROI and system efficiency overview</p>
    </div>

    <div class="header-actions">
      <CalendarHeaderPicker
        :showMonths="statsPeriodType == 'month'"
        :showYears="statsPeriodType == 'year'"
        v-if="statsPeriodType"
        @dateUpdated="handlePeriodChange"
      />

      <select v-model="statsPeriodType" class="header-selections">
        <option value="month">Monthly View</option>
        <option value="year">Yearly View</option>
        <option value="">Lifetime View</option>
      </select>
    </div>
  </header>

  <div class="energy-grid">
    <div class="primary-content">
      <div class="kpi-grid">
        <!-- Card 1: Net Savings -->
        <KpiCard label="Net Savings" type="row">
          <span class="kpi-value">
            {{ formatCurrency(stats.savings) }}
          </span>
        </KpiCard>

        <!-- Card 2: Actual Cost vs Theoretical -->

        <KpiCard label="Actual Cost" type="column">
          <span class="kpi-value">{{
            formatCurrency(stats.total_net_cost)
          }}</span>
        </KpiCard>

        <!-- Card 3: System Efficiency (RTE) -->
        <KpiCard label="Round Trip Efficiency (RTE)" type="column">
          <ArcGauge :value="stats.rte_percentage" />
        </KpiCard>
      </div>

      <section class="main-content"></section>
    </div>

    <div class="sidebar-container">
      <aside class="sidebar-ledger">
        <div class="legder-content">
          <div class="ledger-title">
            <ul class="ledger-list">
              <li class="ledger-item">
                <div class="icon">
                  <House color="#58a6ff" />
                </div>
                <div>
                  <span class="item-label"><span>Home Consumption</span></span>
                  <span class="item-value"
                    >{{ formatNumber(stats.home_consumption) }} kWh</span
                  >
                </div>
              </li>
              <li class="ledger-item">
                <div class="icon">
                  <UtilityPole color="#54a6ff" />
                </div>
                <div>
                  <span class="item-label"
                    >Grid Import <Asterisk :isPerformance="isPerformance"
                  /></span>
                  <span class="item-value"
                    >{{ formatNumber(stats.grid_import) }} kWh</span
                  >
                </div>
              </li>
              <li class="ledger-item">
                <div class="icon">
                  <Upload color="#54a6ff" />
                </div>
                <div>
                  <span class="item-label"
                    >Grid Export <Asterisk :isPerformance="isPerformance"
                  /></span>
                  <span class="item-value value-blue"
                    >{{ formatNumber(stats.grid_export) }} kWh</span
                  >
                </div>
              </li>
              <li class="ledger-item">
                <div class="icon">
                  <BadgePoundSterling color="#54a6ff" />
                </div>
                <div>
                  <span class="item-label">Projected Cost</span>
                  <span class="item-value value-green">{{
                    formatCurrency(stats.total_gross_cost)
                  }}</span>
                </div>
              </li>
              <li class="ledger-item">
                <div class="icon">
                  <Coins color="#54a6ff" />
                </div>
                <div>
                  <span class="item-label"
                    >Export Revenue <Asterisk :isPerformance="isPerformance"
                  /></span>
                  <span class="item-value value-green">{{
                    formatCurrency(stats.total_exported_revenue)
                  }}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import KpiCard from "./KpiCard.vue";
import ArcGauge from "./ArcGauge.vue";
import Asterisk from "./Asterix.vue";

import { formatCurrency, formatShares } from "@/components/Etfs/utils";
import CalendarHeaderPicker from "@/components/CalendarHeaderPicker";
import { isEmpty } from "lodash";

import {
  House,
  UtilityPole,
  Upload,
  BadgePoundSterling,
  Coins,
} from "lucide-vue-next";
export default {
  name: "SolarPerformance",
  components: {
    KpiCard,
    House,
    UtilityPole,
    Upload,
    BadgePoundSterling,
    Coins,
    CalendarHeaderPicker,
    ArcGauge,
    Asterisk,
  },

  watch: {
    async statsPeriodType(newStatsPeriodType) {
      const args = {
        statsPeriodType: newStatsPeriodType,
      };

      if (newStatsPeriodType == "month") {
        args["statsPeriod"] = this.statsPeriodMonth;
      }

      if (newStatsPeriodType == "year") {
        args["statsPeriod"] = this.statsPeriodYear;
      }

      const freshStats = await this.fetchPerformance(
        args.statsPeriodType,
        args.statsPeriod,
      );
      this.performance = freshStats;
    },
  },

  data() {
    return {
      statsPeriodType: "month",
      statsPeriodMonth: new Date().getMonth() + 1,
      statsPeriodYear: new Date().getFullYear(),

      performance: {},
      bill: {},
    };
  },

  methods: {
    formatCurrency(value) {
      return formatCurrency(value, { maximumFractionDigits: 2 });
    },

    formatNumber(value) {
      return formatShares(value, { maximumFractionDigits: 2 });
    },

    fetchPerformance: async (statsPeriodType, statsPeriod) => {
      const response = await window.ipc.receive("api", {
        method: "get",
        endpoint: "solar/performance",
        options: { useAPIKey: true, strip: true },
        body: { statsPeriodType, statsPeriod },
      });

      if (response.ok) {
        return response.data;
      }

      return {};
    },

    fetchBill: async (statsPeriod) => {
      const response = await window.ipc.receive("api", {
        method: "get",
        endpoint: "bills/electricity_costs",
        options: { useAPIKey: true, strip: true },
        body: { statsPeriod },
      });

      if (response.ok) {
        return response.data;
      }

      return {};
    },

    async handlePeriodChange(payload) {
      let statsPeriod = null;

      if (this.statsPeriodType == "month") {
        this.statsPeriodMonth = payload.month;
        statsPeriod = payload.month;

        this.bill = await this.fetchBill(this.statsPeriodMonth);
      }

      if (this.statsPeriodType == "year") {
        this.statsPeriodYear = payload.year;
        statsPeriod = payload.year;
      }

      const freshStats = await this.fetchPerformance(
        this.statsPeriodType,
        statsPeriod,
      );
      this.performance = freshStats;
    },
  },

  computed: {
    stats() {
      if (this.statsPeriodType == "month") {
        if (!isEmpty(this.bill)) {
          return {
            ...this.performance,
            ...this.bill,
          };
        }
      }

      return this.performance;
    },

    isPerformance() {
      return isEmpty(this.bill);
    },
  },

  async mounted() {
    const freshStats = await this.fetchPerformance(
      this.statsPeriodType,
      this.statsPeriodMonth,
    );

    const freshBill = await this.fetchBill(this.statsPeriodMonth);
    this.bill = freshBill;
    this.performance = freshStats;
  },
};
</script>
