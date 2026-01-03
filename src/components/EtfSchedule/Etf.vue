<template>
  <div class="etf">
    <h2 class="title">{{ etf.ef_name }}</h2>

    <div class="info-grid" v-if="etfEvent || etfNextEvent">
      <div v-if="etfEvent">
        <p>
          <span>
            <span v-if="etfEvent.ee_ex_estimated">(Est)</span>Ex Dividend
            Date:</span
          >
          {{ formatDate(etfEvent.ee_ex_date) }}
        </p>
        <p>
          <span>
            <span v-if="etfEvent.ee_payment_estimated">(Est)</span>Payment
            Date:</span
          >
          {{ formatDate(etfEvent.ee_payment_date) }}
        </p>
        <p v-if="etfEvent.ee_pay_per_share">
          <span>Est Pay:</span>
          {{ calculatePay(etf.events) }} =>
          {{ formatShares(etfEvent.ee_eligible_shares_amount) }} x
          {{ etfEvent.ee_pay_per_share || "0.00" }}
        </p>
        <p v-else>
          <span>Eligible Shares:</span>
          {{ formatShares(etfEvent.ee_eligible_shares_amount) }}
        </p>
      </div>

      <div v-if="etfNextEvent">
        <p>
          <span
            ><span v-if="etfNextEvent.ee_ex_estimated">(Est)</span> Next Ex
            Date:</span
          >
          {{ formatDate(etfNextEvent.ee_ex_date) }}
        </p>
        <p>
          <span
            >Next
            <span v-if="etfNextEvent.ee_payment_estimated">(Est)</span> Payment
            Date:</span
          >
          {{ formatDate(etfNextEvent.ee_payment_date) }}
        </p>
        <p>
          <span>Eligible Shares:</span>
          {{ formatShares(etfNextEvent.ee_eligible_shares_amount) }}
        </p>
      </div>
    </div>

    <div class="history">
      <div class="header" @click="togglePurchaseHistory">
        <ChevronDown v-if="!showPurchaseHistory" color="white" :size="32" />
        <ChevronUp v-else color="white" :size="32" />

        <h4>Purchase History</h4>
      </div>

      <transition name="expand">
        <div v-if="showPurchaseHistory" class="purchases">
          <table class="purchases-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Shares</th>
                <th>Amount</th>
                <th>Per Share</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="share in etf.shares" :key="share.efs_id">
                <td>{{ formatDate(share.efs_purchase_date) }}</td>
                <td class="num">{{ formatShares(share.efs_amount) }}</td>
                <td class="num">{{ formatCurrency(share.efs_total_price) }}</td>
                <td class="num">{{ calculatePerShare(share) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </transition>
    </div>
  </div>
</template>

<style lang="scss">
.etf {
  padding: 10px;
  color: #e5e7eb;
  background: #0f172a;

  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border-radius: 12px;

  .title {
    margin-bottom: 10px;
    color: #fff;
    margin: 10px 0;
    font-size: 40px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    border-top: 1px solid #1e293b;
    border-bottom: 1px solid #1e293b;
    padding: 12px;

    p {
      margin: 8px;
      font-size: 20px;

      span {
        color: #94a3b8;
        margin-right: 8px;
      }
    }
  }

  .history {
    font-size: 25px;

    .header {
      cursor: pointer;

      display: flex;
      align-items: center;
      margin: 12px 0;
      // border-top: 1px solid #1e293b;
      height: 50px;
    }

    .purchases {
      max-height: 300px;
      overflow: auto;

      &::-webkit-scrollbar {
        width: 10px;
        background-color: #0f172a;
      }

      &::-webkit-scrollbar-thumb {
        background-color: #020617;
      }
    }

    .purchases-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 20px;

      thead {
        background: #020617;
      }

      th {
        padding: 10px 12px;
        text-transform: uppercase;
        font-size: 20px;
        color: #94a3b8;
        text-align: left;
      }

      td {
        padding: 012px;
        border-bottom: 1px solid #1e293b;

        .num {
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
      }

      tr:last-child td {
        border-bottom: none;
      }

      tbody tr:hover {
        background: #020617;
      }
    }
  }
}

/* Expand animation */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>

<script>
import { ChevronDown, ChevronUp } from "lucide-vue-next";

export default {
  name: "Etf",
  props: ["etf"],
  components: { ChevronDown, ChevronUp },

  data() {
    return {
      showPurchaseHistory: false,
      etfEvent: null,
      etfNextEvent: null,
    };
  },

  methods: {
    togglePurchaseHistory() {
      this.showPurchaseHistory = !this.showPurchaseHistory;
    },

    getEvents(events) {
      if (events && events.length == 1) {
        this.etfEvent = events[0];
      }

      if (events && events.length > 1) {
        this.etfEvent = events[0];
        this.etfNextEvent = events[1];
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "TBD";
      const date = new Date(dateStr);

      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },

    formatShares(amount) {
      // Formats 11.80540000 -> 11.8054
      return (
        parseFloat(amount).toLocaleString("en-GB", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 8,
        }) || "0.00"
      );
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

  mounted() {
    this.getEvents(this.etf.events);
  },
};
</script>
