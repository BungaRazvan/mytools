<template>
  <header class="header-container">
    <div class="header-title">
      <h1 class="main-title">Bills</h1>
      <p class="subtitle">Breakdown of Bills</p>
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

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);

export default {
  name: "Bills",
  components: { Bar },

  data() {
    return {
      loading: true,
      monthlyBills: [],
    };
  },

  computed: {
    chartData() {
      // X-Axis Labels: Array of month strings ['Apr 2026', 'May 2026', 'Jun 2026']
      const months = this.monthlyBills.map((b) => b.month);

      return {
        labels: months,
        datasets: [
          {
            label: "Electricity",
            data: this.monthlyBills.map((b) => b.costs.electricity),
            usage: this.monthlyBills.map((b) => b.usage.electricity),
            backgroundColor: "#ffee8c",
            borderRadius: 4,
          },
          {
            label: "Gas",
            data: this.monthlyBills.map((b) => b.costs.gas),
            usage: this.monthlyBills.map((b) => b.usage.gas),
            backgroundColor: "#f97316",
            borderRadius: 4,
          },
          {
            label: "SEG",
            data: this.monthlyBills.map((b) => Math.abs(b.costs.seg)),
            usage: this.monthlyBills.map((b) => b.usage.seg),
            backgroundColor: "#10b981",
            borderRadius: 4,
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
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const label = ctx.dataset.label;
                const val = ctx.raw;
                console.log(ctx);

                return [
                  ` ${label}: £${val.toFixed(2)}`,
                  `kWh: ${ctx.dataset.usage[ctx.dataIndex]}`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: "Billing Month" },
          },
          y: {
            title: { display: true, text: "Amount (£)" },
            ticks: {
              callback: (val) => `£${val}`,
            },
          },
        },
      };
    },
  },

  methods: {
    fetchData: async (statsPeriodType, statsPeriod) => {
      const response = await window.ipc.receive("api", {
        method: "get",
        endpoint: "bills-stats",
        options: { useAPIKey: true, strip: true },
        body: { statsPeriodType, statsPeriod },
      });

      if (response.ok) {
        console.log(response.data);
        return response.data;
      }

      return [];
    },
  },

  async mounted() {
    const freshStats = await this.fetchData(
      this.statsPeriodType,
      this.statsPeriodMonth,
    );
    this.monthlyBills = freshStats;
  },
};
</script>
