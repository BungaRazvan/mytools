<template>
  <div class="calendar-nav-bar">
    <!-- If we have a valid date, show the full Interactive Picker Controls -->

    <!-- Month Picker Group -->
    <div class="nav-group" v-if="showMonths">
      <button @click="changeMonth(-1)" class="nav-arrow">&lt;</button>

      <div class="label-wrapper">
        <span @click="openMonthPicker" class="nav-label clickable-label">
          {{ currentMonthLabel }}
        </span>
        <input
          ref="monthInput"
          type="month"
          class="hidden-picker"
          @input="onMonthSelect"
        />
      </div>

      <button @click="changeMonth(1)" class="nav-arrow">&gt;</button>
    </div>

    <!-- Year Picker Group -->
    <div class="nav-group" v-if="showYears">
      <button @click="changeYear(-1)" class="nav-arrow">&lt;</button>

      <div class="label-wrapper">
        <span @click="toggleYearDropdown" class="nav-label clickable-label">
          {{ currentYear }}
        </span>

        <select
          v-if="showYearDropdown"
          ref="yearSelect"
          v-model="currentYear"
          class="year-dropdown"
          @change="onYearSelect"
          @blur="showYearDropdown = false"
        >
          <option v-for="year in yearRange" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>

      <button @click="changeYear(1)" class="nav-arrow">&gt;</button>
    </div>

    <!-- Fallback State: No Date Selected (Lifetime View / All Time) -->
  </div>
</template>

<script>
export default {
  name: "CalendarHeaderPicker",

  props: {
    modelValue: {
      type: Date,
      required: false,
      default: null,
    },

    showMonths: {
      required: false,
      type: Boolean,
      default: false,
    },
    showYears: {
      required: false,
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      internalDate: null,
      showYearDropdown: false,
      currentYear: 2026,
    };
  },

  computed: {
    currentMonthLabel() {
      return this.internalDate
        ? this.internalDate
            .toLocaleString("default", { month: "short" })
            .toUpperCase()
        : "";
    },

    yearRange() {
      const startYear = 2020;
      const endYear = 2035;
      const years = [];
      for (let y = startYear; y <= endYear; y++) {
        years.push(y);
      }
      return years;
    },
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(newDate) {
        if (newDate) {
          this.internalDate = new Date(newDate);
          this.currentYear = this.internalDate.getFullYear();
        } else {
          this.internalDate = new Date();
        }
      },
    },
  },

  methods: {
    changeMonth(direction) {
      if (!this.internalDate) return;
      const newDate = new Date(this.internalDate);
      newDate.setMonth(newDate.getMonth() + direction);
      this.internalDate = newDate;
      this.currentYear = this.internalDate.getFullYear();
      this.emitDateChange();
    },
    changeYear(direction) {
      if (!this.internalDate) return;
      const newDate = new Date(this.internalDate);
      newDate.setFullYear(newDate.getFullYear() + direction);
      this.internalDate = newDate;
      this.currentYear = this.internalDate.getFullYear();
      this.emitDateChange();
    },
    openMonthPicker() {
      if (!this.internalDate) return;
      const formattedMonth = `${this.internalDate.getFullYear()}-${String(
        this.internalDate.getMonth() + 1,
      ).padStart(2, "0")}`;
      this.$refs.monthInput.value = formattedMonth;
      this.$refs.monthInput.showPicker();
    },
    onMonthSelect(event) {
      if (!event.target.value) return;
      const [year, month] = event.target.value.split("-");
      this.internalDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      this.currentYear = this.internalDate.getFullYear();
      this.emitDateChange();
    },
    toggleYearDropdown() {
      this.showYearDropdown = !this.showYearDropdown;
      if (this.showYearDropdown) {
        this.$nextTick(() => {
          this.$refs.yearSelect.focus();
        });
      }
    },
    onYearSelect() {
      if (!this.internalDate) return;
      const newDate = new Date(this.internalDate);
      newDate.setFullYear(this.currentYear);
      this.internalDate = newDate;
      this.showYearDropdown = false;
      this.emitDateChange();
    },
    emitDateChange() {
      this.$emit("update:modelValue", this.internalDate);
      this.$emit("dateUpdated", {
        month: this.internalDate.getMonth() + 1,
        year: this.internalDate.getFullYear(),
        rawDate: this.internalDate,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
$color-blue: #58a6ff;
$bg-dark: #161b22;
$border-color: #393e41;

.calendar-nav-bar {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  background-color: $bg-dark;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid $border-color;
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 38px;

  .nav-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .nav-arrow {
      background: transparent;
      border: none;
      color: $color-blue;
      font-weight: 900;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0 0.25rem;
      outline: none;
      user-select: none;

      &:hover {
        color: #fff;
      }
    }

    .label-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-label {
      font-weight: 800;
      font-size: 1rem;
      color: #fff;
      min-width: 40px;
      text-align: center;
      letter-spacing: 0.05em;
      user-select: none;
    }

    .clickable-label {
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;

      &:hover {
        background-color: rgba($color-blue, 0.15);
        color: $color-blue;
      }
    }

    .hidden-picker {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      pointer-events: none;
    }

    .year-dropdown {
      position: absolute;
      top: 110%;
      left: 50%;
      transform: translateX(-50%);
      background-color: #21262d;
      color: #fff;
      border: 1px solid $border-color;
      border-radius: 0.25rem;
      padding: 0.25rem;
      font-size: 0.9rem;
      outline: none;
      z-index: 10;
      max-height: 150px;
    }
  }

  .nav-group-static {
    color: #8b949e;
    font-weight: 700;
    font-size: 0.95rem;
    letter-spacing: 0.025em;
    user-select: none;
  }
}
</style>
