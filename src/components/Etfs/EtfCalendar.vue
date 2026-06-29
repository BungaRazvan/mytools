<template>
  <div class="calendar-wrapper">
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
        <div class="popover-header">
          {{ selectedEvent.ee_etf.ef_name }}
        </div>
        <p>
          <strong>Eligible Shares:</strong>
          {{ formatShares(selectedEvent.ee_eligible_shares_amount) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import { flatMap } from "lodash";
import { formatShares } from "./utils";

export default {
  name: "EtfCalendar",
  components: { FullCalendar },

  computed: {
    calendarEvents() {
      return flatMap(this.events, (event) => {
        const items = [];
        const baseProps = { allDay: true, extendedProps: { ...event } };

        if (event.ee_ex_date) {
          items.push({
            ...baseProps,
            title: `Ex: ${event.ee_etf.ef_name}`,
            date: event.ee_ex_date,
            className: "event-secondary",
          });
        }
        if (event.ee_payment_date) {
          items.push({
            ...baseProps,
            title: `Pay: ${event.ee_etf.ef_name}`,
            date: event.ee_payment_date,
            className: "event-secondary",
          });
        }
        return items;
      });
    },
  },

  data() {
    return {
      selectedEvent: null,
      showPopover: false,
      popoverPosition: { x: 0, y: 0 },
      events: [],
      calendarOptions: {
        plugins: [dayGridPlugin],
        initialView: "dayGridMonth",
        dayMaxEvents: 4,
        handleWindowResize: true,
        contentHeight: "auto",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "",
        },
        eventClick: (info) => {
          const rect = info.el.getBoundingClientRect();
          const eventData = info.event.extendedProps;

          this.selectedEvent = eventData;

          // Position the custom popover slightly higher than the clicked pill
          // to avoid covering the other items in the 'More' list
          this.popoverPosition = {
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          };

          this.showPopover = true;
        },
      },
    };
  },
  // ... (methods, fetchEvents, mounted, and beforeUnmount remain the same as previous)
  methods: {
    formatShares,
    async fetchEvents() {
      const response = await window.ipc.receive("api", {
        method: "GET",
        endpoint: "etfs-events",
        options: { useAPIKey: true },
      });
      return response.ok ? response.data : [];
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
/* Color variables from your header/button section */
$btn-back-pink: #ff4081;
$btn-new-charcoal: #3f3f4e;
$header-bg: #1c1c24;
$border-subtle: rgba(255, 255, 255, 0.05);

.calendar-wrapper {
  max-width: 100%;
  background: $header-bg;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid $border-subtle;
}

.fc {
  color: white;
  --fc-border-color: #2d2d39;
  --fc-button-bg-color: #3f3f4e;
  --fc-button-border-color: transparent;
  --fc-button-hover-bg-color: #4f4f61;
  --fc-button-active-bg-color: #ff4081;

  .fc-daygrid-day-frame {
    min-height: 65px !important;
  }

  .fc-col-header-cell {
    padding: 8px 0;
    background: rgba(255, 255, 255, 0.02);
    font-weight: 600;
    font-size: 13px;
  }

  .fc-daygrid-event {
    background-color: $btn-new-charcoal !important;
    border: none !important;
    border-radius: 4px !important;
    margin: 1px 2px !important;
    padding: 2px 5px !important;
    transition: background 0.2s;

    &:hover {
      background-color: lighten($btn-new-charcoal, 10%) !important;
      cursor: pointer;
    }
  }

  .fc-event-title {
    font-size: 10px;
    font-weight: 500;
    color: #e0e0e0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .fc-daygrid-day-number {
    font-size: 12px;
    padding: 4px 8px;
  }

  .fc-day-today {
    background: rgba(255, 64, 129, 0.05) !important;

    .fc-daygrid-day-number {
      color: $btn-back-pink;
      font-weight: bold;
    }
  }

  .fc-button-primary {
    text-transform: capitalize;
    font-size: 14px;
    font-weight: 600;
  }

  .fc-daygrid-more-link {
    color: $btn-back-pink;
    font-size: 11px;
    font-weight: 700;
  }
}

.fc-theme-standard .fc-popover {
  background: #1c1c24 !important; /* Your header-bg color */
  border: 1px solid rgba(255, 64, 129, 0.3) !important; /* Subtle pink border */
  border-radius: 12px !important;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.6) !important;
  z-index: 10000;

  /* The Header of the Popover (e.g., "May 4, 2026") */
  .fc-popover-header {
    background: #2a2a35 !important;
    padding: 10px 12px !important;
    border-radius: 12px 12px 0 0 !important;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .fc-popover-title {
      color: #fff !important;
      font-weight: 700;
      font-size: 14px;
    }

    .fc-popover-close {
      color: $btn-back-pink !important; // The pink "X"
      opacity: 1;
      font-size: 18px;
      cursor: pointer;
    }
  }

  /* The body containing the list of events */
  .fc-popover-body {
    padding: 10px !important;
    background: #1c1c24 !important;
    display: flex;
    flex-direction: column;
    gap: 6px;

    /* Styling the event pills inside the popover */
    .fc-daygrid-event {
      background: #3f3f4e !important; /* btn-new-charcoal */
      border-left: 3px solid $btn-back-pink !important;
      margin: 0 !important;
      padding: 6px 10px !important;

      .fc-event-title {
        color: #fff !important;
        font-size: 12px !important;
      }

      &:hover {
        background: #4f4f61 !important;
      }
    }
  }
}

.fc-daygrid-more-link {
  color: $btn-back-pink !important;
  font-weight: 700 !important;
  font-size: 11px !important;
  text-decoration: none !important;
  padding: 2px 4px;

  &:hover {
    text-decoration: underline !important;
  }
}

.custom-popover {
  position: fixed;
  transform: translate(-50%, -100%);
  z-index: 999999 !important;
  padding-bottom: 10px;

  .popover-content {
    background: #2a2a35;
    color: white;
    padding: 14px;
    border-radius: 10px;
    width: 280px;
    border: 1px solid $btn-back-pink; /* Subtle pink border for the popover */
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);

    strong {
      color: $btn-back-pink;
    }

    p {
      margin: 5px 0;
      font-size: 13px;
      line-height: 1.4;
    }
  }
}
</style>
