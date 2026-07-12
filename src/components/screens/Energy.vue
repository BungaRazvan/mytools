<template>
  <header>
    <div @click="goBack" class="btn-back">Back</div>

    <div class="main-controls">
      <div class="button-row">
        <button @click="setView('solar')" class="btn-new">Solar Econmy</button>
        <button @click="setView('bills')" class="btn-new">Bills</button>
      </div>
    </div>
  </header>

  <div class="energy-dashbaord">
    <SolarEconomy v-if="view == 'solar'" />
    <Bills v-if="view == 'bills'" />
  </div>
</template>

<style lang="scss">
$color-blue: #58a6ff;
$text-muted: #8b949e;
$border-light: #21262d;

@mixin border($color: $color-blue) {
  border-radius: 0.5rem;
  border: 1px solid $color;
  box-shadow: 0 0 15px rgba($color, 0.15), inset 0 0 10px rgba($color, 0.05);
}

.energy-dashbaord {
  min-height: 100vh;
  padding: 1.5rem;
  font-family: system-ui, -apple-system, sans-serif;

  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 700;
    letter-spacing: -0.025em;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-radius: 1px solid $border-light;
    background-color: #0d1117;

    .header-title {
      .main-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #fff;
        letter-spacing: -0.025em;
        margin: 0;
      }

      .subtitle {
        font-size: 0.875rem;
        color: $text-muted;
        margin: 0.25rem 0 0 0;
      }
    }

    .header-actions {
      display: flex;
      justify-content: end;

      .header-selections {
        border-radius: 0.5rem;
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        outline: none;
        cursor: pointer;
        background-color: #161b22;
        color: #fff;
        @include border(#393e41);
      }
    }
  }

  .energy-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;

    @media (min-width: 1200px) {
      grid-template-columns: repeat(4, 1fr);
    }

    .primary-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      @media (min-width: 1200px) {
        grid-column: span 3;
      }

      .kpi-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;

        @media (min-width: 768px) {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      .kpi-card {
        @include border();
        padding: 1rem 1.25rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        /* Set a fixed height so all 3 cards stay uniform and compact */
        height: 140px;
        box-sizing: border-box;

        .kpi-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: $text-muted;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .kpi-value-row,
        .kpi-value-column {
          margin-top: auto; /* Keeps numbers/gauge pinned nicely near the bottom */
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }

        .kpi-value {
          font-size: 1.875rem;
          font-weight: 800;
          line-height: 1;
        }
      }
    }

    .sidebar-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;

      @media (min-width: 1200px) {
        grid-template-columns: 1fr;
      }

      .sidebar-ledger {
        @include border();
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .ledger-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.05em;
          margin-top: 0;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
        }

        .ledger-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .ledger-item {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          font-size: 1rem;
          gap: 1rem;
          @include border(#1b1f22);
          border: 0;
          border-bottom: 2px solid #1b1f22;

          .icon {
            background-color: #58a6ff30;
            padding: 0.7rem;
            border-radius: 2rem;
          }

          .item-label {
            display: flex;
            justify-content: space-between;
            gap: 1rem;
            align-items: center;
          }

          &:last-child {
            border-bottom: 0;
            padding-bottom: 0;
          }

          .item-value {
            font-size: 0.875rem;
            font-weight: 500;
            color: #fff;
          }
        }
      }
    }
  }

  .main-content {
    display: flex;
    flex-direction: column;
  }
}
</style>

<script>
import SolarEconomy from "@/components/Energy/SolarEconomy.vue";
import Bills from "@/components/Energy/Bills.vue";

import { mapGetters } from "vuex";

export default {
  name: "Energy",
  props: ["goBack"],
  components: {
    SolarEconomy,
    Bills,
  },

  computed: {
    ...mapGetters("energy", ["view"]),
  },

  methods: {
    setView(view) {
      const store = this.$store;

      store.dispatch("all", { mutation: "energy/setView", data: view });
    },
  },
};
</script>
