<template>
  <div class="etf-detail-card">
    <div class="card-header">
      <h2 class="title">{{ etf.ef_name }}</h2>
    </div>

    <div class="summary-stats">
      <div class="stat-item">
        <span class="stat-label">Total Shares</span>
        <span class="stat-value">{{ formatShares(etf.total_shares) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Total Invested</span>
        <span class="stat-value">{{ formatCurrency(etf.total_spent) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Total Dividends</span>
        <span class="stat-value highlight">{{
          formatCurrency(etf.total_dividents)
        }}</span>
      </div>
    </div>

    <div class="info-grid">
      <div
        v-for="(event, index) in orderedEvents"
        :key="index"
        class="event-box"
        :class="{ 'next-priority': index === 0 }"
      >
        <h4 class="event-label">
          {{ index === 0 ? "Upcoming / Next" : "Recent" }}
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

    <ToggleSection
      title="Divident History"
      :condition="showDividentsHistory"
      :on-click="() => toggleSection('showDividentsHistory')"
      color="#ff4081"
      size="24"
    >
      <table>
        <thead>
          <tr>
            <th style="text-align: left">Date</th>
            <th>Total Received</th>
            <th>Shares</th>
            <th>Pay Per Share</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="divident in etf.dividents">
            <td>{{ formatDate(divident.ee_payment_date) }}</td>
            <td class="num">{{ formatCurrency(calculatePay(divident)) }}</td>

            <td class="num font-bold">
              {{ formatShares(divident.ee_eligible_shares_amount) }}
            </td>
            <td class="num opacity-70">
              {{ formatCurrency(divident.ee_pay_per_share) }}
            </td>
          </tr>
        </tbody>
      </table>
    </ToggleSection>

    <ToggleSection
      :condition="showPurchaseHistory"
      :on-click="() => toggleSection('showPurchaseHistory')"
      color="#ff4081"
      :size="24"
      title="Purchase History"
    >
      <table>
        <thead>
          <tr>
            <th style="text-align: left">Date</th>
            <th>Shares</th>
            <th>Total Cost</th>
            <th>Per Share</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="share in etf.shares" :key="share.efs_id">
            <td>{{ formatDate(share.efs_purchase_date) }}</td>
            <td class="num font-bold">
              {{ formatShares(share.efs_amount) }}
            </td>
            <td class="num">{{ formatCurrency(share.efs_total_price) }}</td>
            <td class="num opacity-70">
              {{ formatCurrency(calculatePerShare(share)) }}
            </td>
          </tr>
        </tbody>
      </table>
    </ToggleSection>
  </div>
</template>

<style lang="scss">
$pink: #ff4081;
$charcoal: #1c1c24;
$lighter-charcoal: #2a2a35;
$text-dim: #94a3b8;
$border: rgba(255, 255, 255, 0.05);

.etfs-container {
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
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    .summary-stats {
      display: flex;
      gap: 30px;
      margin-bottom: 25px;
      padding: 15px;
      background: rgba(0, 0, 0, 0.15);
      border-radius: 12px;
      border: 1px solid $border;

      .stat-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .stat-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: $text-dim;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 700;

          &.highlight {
            color: $pink;
          }
        }
      }
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

        .breakdown {
          font-weight: normal;
          opacity: 0.6;
          font-size: 12px;
        }
      }
    }

    .toggle-section {
      .toggle-container {
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

      .table-container {
        margin-top: 15px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        overflow-y: auto;
        max-height: 200px;

        &::-webkit-scrollbar {
          width: 5px;
          background-color: $charcoal;
        }

        &::-webkit-scrollbar-thumb {
          background-color: $pink;
          border-radius: 100px;
        }
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;

        th {
          padding: 12px;
          text-align: right;
          color: $text-dim;
          font-size: 11px;
          text-transform: uppercase;
          border-bottom: 1px solid $border;
          position: sticky;
          top: 0px;
          background: rgb(0, 0, 0);
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

        tbody tr:hover {
          background: rgba($pink, 0.03);
        }
      }

      &:-webkit-scrollbar {
        width: 20px;
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
}
</style>

<script>
import { ChevronDown, ChevronUp } from "lucide-vue-next";
import { formatDate, formatShares } from "./utils";
import ToggleSection from "./ToggleSection";

export default {
  name: "Etf",
  props: ["etf"],
  components: { ChevronDown, ChevronUp, ToggleSection },

  data() {
    return {
      showPurchaseHistory: false,
      showDividentsHistory: false,
    };
  },

  computed: {
    // Logic to determine which event block is "closer" to today
    orderedEvents() {
      const list = [];
      const now = new Date();

      // Helper to find the "active" date for an event
      const getNextRelevantDate = (event) => {
        const exDate = new Date(event.ee_ex_date);
        const payDate = new Date(event.ee_payment_date);

        // If we haven't hit the Ex-Date yet, that's the priority
        if (exDate > now) return exDate;
        // If Ex-Date passed but Payment is coming up, Payment is the priority
        if (payDate > now) return payDate;
        // If both passed, use the latest one to keep it at the end of the "past" pile
        return payDate;
      };

      if (this.etf.future_event) {
        list.push({
          ...this.etf.future_event,
          sortDate: getNextRelevantDate(this.etf.future_event),
        });
      }
      if (this.etf.recent_event) {
        list.push({
          ...this.etf.recent_event,
          sortDate: getNextRelevantDate(this.etf.recent_event),
        });
      }

      return list.sort((a, b) => {
        const isAPast = a.sortDate < now;
        const isBPast = b.sortDate < now;

        if (isAPast && !isBPast) return 1;
        if (!isAPast && isBPast) return 1;

        // 2. If both are future, sort ascending (sooner is left)
        if (!isAPast && !isBPast) return a.sortDate - b.sortDate;

        // 3. If both are past, sort descending (most recent is right-most in the past block)
        return a.sortDate - b.sortDate;
      });
    },
  },

  methods: {
    formatDate,
    formatShares,

    toggleSection(name) {
      this[name] = !this[name];
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
