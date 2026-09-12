<template>
  <header class="header-container">
    <div class="header-title">
      <h1 class="main-title">Solar Generation</h1>
    </div>

    <div class="header-actions">
      <CalendarHeaderPicker
        :showMonths="false"
        :showYears="true"
        @dateUpdated="handleYearChange"
      />
    </div>
  </header>

  <div class="energy-grid">
    <div class="primary-content">
      <section class="main-content">
        <Bar :data="chartData" :options="chartOptions" />
      </section>
    </div>
  </div>
</template>

<script>
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import CalendarHeaderPicker from "@/components/CalendarHeaderPicker";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);

export default {
  name: "SolarGeneration",
  components: { Bar, CalendarHeaderPicker },

  watch: {
    async statsPeriodType(newStatsPeriodType) {
      const args = {
        statsPeriodType: newStatsPeriodType,
      };

      args["statsPeriod"] = this.statsYear;

      const freshStats = await this.fetchData(
        args.statsPeriodType,
        args.statsPeriod,
      );
      this.stats = freshStats;
    },
  },

  data() {
    return {
      statsYear: new Date().getFullYear(),
      stats: [],
      loading: true,
    };
  },

  computed: {
    chartData() {
      const months = this.stats.map((stat) => stat.month);

      return {
        labels: months,
        datasets: [
          {
            label: "Solar Generation",
            data: this.stats.map((stat) => stat.generated_energy),
            backgroundColor: "#4CAF50",
          },

          {
            label: "Home Consumption",
            data: this.stats.map((stat) => stat.consumed_energy),
            backgroundColor: "#2196F3",
          },
        ],
      };
    },

    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
        },

        scales: {
          x: {
            title: {
              display: true,
              text: "Month",
            },
          },
          y: {
            title: {
              display: true,
              text: "kWh",
            },
          },
        },
      };
    },
  },

  methods: {
    async fetchData(statsYear) {
      const response = await window.ipc.receive("api", {
        method: "get",
        endpoint: `solar/generation`,
        body: { statsYear },
        options: { useAPIKey: true },
      });

      console.log("fetchData response:", response);

      if (response.ok) {
        return response.data;
      }

      return [];
    },

    async handleYearChange(event) {
      this.statsYear = event.year;

      const freshStats = await this.fetchData(this.statsYear);
      this.stats = freshStats;
      this.loading = false;
    },
  },

  async mounted() {
    const freshStats = await this.fetchData(this.statsYear);
    this.stats = freshStats;
    this.loading = false;
  },
};
</script>
