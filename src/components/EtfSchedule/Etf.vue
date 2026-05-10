<template>
  <div class="etf-detail-card">
    <header class="card-header">
      <h2 class="title">{{ etf.ef_name }}</h2>
      <div class="ticker-badge">{{ etf.ef_ticker }}</div>
    </header>

    <div class="info-grid">
      <div
        v-for="(event, index) in orderedEvents"
        :key="index"
        class="event-box"
        :class="{ 'next-priority': index === 0 }"
      >
        <h4 class="event-label">
          {{ index === 0 ? "Upcoming / Next" : "Following / Recent" }}
        </h4>

        <p>
          <span class="label">
            <span v-if="event.ee_ex_estimated" class="est">EST</span> Ex Date:
          </span>
          <span class="value">{{ formatDate(event.ee_ex_date) }}</span>
        </p>

        <p>
          <span class="label">
            <span v-if="event.ee_payment_estimated" class="est">EST</span> Pay
            Date:
          </span>
          <span class="value">{{ formatDate(event.ee_payment_date) }}</span>
        </p>

        <p v-if="event.ee_pay_per_share">
          <span class="label">Total Pay:</span>
          <span class="value highlight">
            &pound;{{ calculatePay(event) }}
          </span>
        </p>
        <p v-else>
          <span class="label">Eligible Shares:</span>
          <span class="value">{{
            formatShares(event.ee_eligible_shares_amount)
          }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$pink: #ff4081;
$charcoal: #1c1c24;
$lighter-charcoal: #2a2a35;
$text-dim: #94a3b8;
$border: rgba(255, 255, 255, 0.05);

.etf-detail-card {
  padding: 24px;
  background: $charcoal;
  border-radius: 16px;
  border: 1px solid $border;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
  color: #fff;
  margin-bottom: 20px;

  .card-header {
    display: flex;
    align-items: baseline;
    gap: 15px;
    margin-bottom: 20px;

    .title {
      font-size: 32px;
      font-weight: 800;
      margin: 0;
    }

    .ticker-badge {
      background: rgba($pink, 0.1);
      color: $pink;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }

  .event-box {
    background: $lighter-charcoal;
    padding: 16px;
    border-radius: 12px;
    border-left: 4px solid #3f3f4e;

    &.future {
      border-left-color: $pink;
    }

    .event-label {
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 1px;
      color: $text-dim;
      margin-bottom: 12px;
    }

    p {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
      font-size: 15px;

      .label {
        color: $text-dim;
      }
      .value {
        font-weight: 600;
      }
      .highlight {
        color: $pink;
      }

      .est {
        font-size: 10px;
        background: #4b5563;
        padding: 1px 4px;
        border-radius: 3px;
        margin-right: 5px;
        color: #fff;
      }

      .breakdown {
        font-weight: normal;
        opacity: 0.6;
        font-size: 12px;
      }
    }
  }

  .history {
    .history-toggle {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 10px 0;

      h4 {
        font-size: 16px;
        font-weight: 600;
        white-space: nowrap;
        margin: 0;
      }

      .line {
        height: 1px;
        background: $border;
        width: 100%;
      }
    }

    .purchases-container {
      margin-top: 15px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      overflow: hidden;
    }

    .purchases-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;

      th {
        padding: 12px;
        text-align: left;
        color: $text-dim;
        font-size: 11px;
        text-transform: uppercase;
        border-bottom: 1px solid $border;
      }

      td {
        padding: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.02);
      }

      .num {
        text-align: right;
      }
      .font-bold {
        font-weight: 700;
        color: #fff;
      }
      .opacity-70 {
        opacity: 0.7;
      }

      tbody tr:hover {
        background: rgba($pink, 0.03);
      }
    }
  }
}

/* Animations */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
</style>

<script>
import { ChevronDown, ChevronUp } from "lucide-vue-next";
import { formatDate, formatShares } from "./utils";

export default {
  name: "Etf",
  props: ["etf"],
  components: { ChevronDown, ChevronUp },

  data() {
    return {
      showPurchaseHistory: false,
      recentEvent: null,
      futureEvent: null,
    };
  },

  computed: {
    // Logic to determine which event block is "closer" to today
    orderedEvents() {
      const list = [];

      // Add events to a temporary list if they exist
      if (this.etf.future_event) {
        list.push({ ...this.etf.future_event, type: "future" });
      }
      if (this.etf.recent_event) {
        list.push({ ...this.etf.recent_event, type: "recent" });
      }

      // Sort them so the one closest to "Now" (or the earliest date) is first
      return list.sort((a, b) => {
        const dateA = new Date(a.ee_ex_date || a.ee_payment_date);
        const dateB = new Date(b.ee_ex_date || b.ee_payment_date);
        return dateA - dateB;
      });
    },
  },

  methods: {
    formatDate,
    formatShares,

    togglePurchaseHistory() {
      this.showPurchaseHistory = !this.showPurchaseHistory;
    },

    calculatePay(event) {
      if (!event.ee_pay_per_share) return "0.00";
      const total =
        parseFloat(event.ee_eligible_shares_amount) *
        parseFloat(event.ee_pay_per_share);
      return total.toFixed(2);
    },

    calculatePerShare(share) {
      const price =
        parseFloat(share.efs_total_price) / parseFloat(share.efs_amount);

      return price.toFixed(3);
    },

    formatCurrency(value, currencyType = "pound") {
      const amount = parseFloat(value || 0);
      const symbol = currencyType === "pound" ? "en-GB" : "de-DE";
      const currency = currencyType === "pound" ? "GBP" : "EUR";

      return new Intl.NumberFormat(symbol, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
      }).format(amount);
    },
  },
};
</script>
