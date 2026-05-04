<template>
  <FullCalendar :options="{ ...calendarOptions, events: calendarEvents }" />
  <div
    v-if="showPopover"
    class="custom-popover"
    :style="{
      top: popoverPosition.y + 'px',
      left: popoverPosition.x + 'px',
    }"
  >
    <div class="popover-content">
      <p>
        <span
          ><span v-if="selectedEvent.ee_payment_estimated">(Est)</span> Eligible
          Shares:</span
        >
        {{ formatShares(selectedEvent.ee_eligible_shares_amount) }}
      </p>
    </div>
  </div>
</template>

<script>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import { flatMap, concat } from "lodash";
import { formatShares } from "./utils";

export default {
  name: "EtfCalendar",
  props: ["etfs"],
  components: {
    FullCalendar,
  },

  computed: {
    calendarEvents() {
      return concat(
        [],
        flatMap(this.events, (event) => {
          const dates = [];
          const items = { allDay: true };

          if (event.ee_ex_date) {
            dates.push({
              ...items,
              title: event.ee_etf.ef_name + " Ex Date",
              date: event.ee_ex_date,
              ...event,
            });
          }

          if (event.ee_payment_date) {
            let title = " Payment Date";

            dates.push({
              ...items,
              title: event.ee_etf.ef_name + title,
              date: event.ee_payment_date,
              paymentDate: true,
              ...event,
            });
          }

          return dates;
        }),
      );
    },
  },

  data() {
    return {
      selectedEvent: null,
      showPopover: false,
      popoverPosition: { x: 0, y: 0 },
      events: [],

      calendarOptions: {
        dayMaxEvents: 2,
        plugins: [dayGridPlugin],
        initialView: "dayGridMonth",
        events: [],

        eventClick: (info) => {
          const rect = info.el.getBoundingClientRect();
          const event = info.event.extendedProps;

          const popoverWidth = 640;
          const popoverHeight = 150;

          let x = rect.left + rect.width / 2;
          let y = rect.top;

          // --- horizontal clamp ---
          if (x + popoverWidth / 2 > window.innerWidth) {
            x = window.innerWidth - popoverWidth / 2 - 10;
          }

          if (x - popoverWidth / 2 < 0) {
            x = popoverWidth / 2 + 10;
          }

          // --- vertical flip (if too close to top) ---
          let position = "top";
          if (y - popoverHeight < 0) {
            y = rect.bottom;
            position = "bottom";
          }

          this.selectedEvent = event;
          this.popoverPosition = { x, y, position };
          this.showPopover = true;
        },
      },
    };
  },

  methods: {
    formatShares,

    async fetchEvents() {
      const response = await window.ipc.receive("api", {
        method: "GET",
        endpoint: "etfs-events",
        options: { useAPIKey: true },
      });

      if (response.ok) {
        return response.data;
      }
    },

    handleOutsideClick(e) {
      if (
        !e.target.closest(".custom-popover") &&
        !e.target.closest(".fc-event")
      ) {
        this.showPopover = false;
      }
    },
  },

  async mounted() {
    document.addEventListener("click", this.handleOutsideClick);

    this.events = await this.fetchEvents();
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
  },
};
</script>

<style lang="scss">
.calendar-wrapper {
  max-width: 700px;
  margin: 0 auto;
}

.fc {
  .fc-daygrid-day-frame {
    min-height: 90px; /* reduce vertical stretch */
    height: 90px;
  }

  .fc-daygrid-event {
    white-space: normal !important;
    width: 100%;
  }

  .fc-event-title {
    white-space: normal !important;
    overflow: visible !important;
    font-size: 12px;
    line-height: 1.2;
  }

  .fc-daygrid-event {
    padding: 2px 4px;
    border-radius: 4px;
  }

  .fc-daygrid-day-bottom {
    font-size: 20px;
    padding: 10px 0;
  }

  .fc-media-screen .fc-direction-ltr .fc-theme-standard {
    background: #1f2937;
  }
}

.fc-theme-standard .fc-popover {
  background: #1f2937;
}

/* Popover container */
.fc-popover {
  background: #1f2937; /* dark theme */
  color: #fff;
  border-radius: 8px;
  padding: 8px;
  min-width: 260px;
  max-width: 320px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);

  .fc-event {
    background: #3b82f6;
    border: none;
    border-radius: 6px;
    padding: 6px 8px;
    font-size: 12px;

    white-space: normal !important;
    overflow: visible !important;
    text-overflow: unset !important;
  }

  .fc-event-title {
    white-space: normal !important;
    line-height: 1.3;
    word-break: break-word;
  }
}

.fc-popover-header {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

/* Event list container */
.fc-popover-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #1f2937;
}

.custom-popover {
  position: fixed;
  transform: translate(-50%, -100%);
  z-index: 9999;
}

.popover-content {
  background: #1f2937;
  color: white;
  padding: 12px;
  border-radius: 8px;
  width: 320px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}
</style>
