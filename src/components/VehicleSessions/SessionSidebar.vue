<template>
  <aside class="session-sidebar">
    <div class="panel-header">
      <h2>Sessions</h2>
      <span class="count-pill">{{ sessions.length }}</span>
      <span v-if="selectedSessions.length" class="selected-count">
        {{ selectedSessions.length }} selected
      </span>
    </div>

    <div class="session-groups">
      <div
        v-for="group in groupedSessions"
        :key="group.dateKey"
        class="date-group"
      >
        <div class="date-header">{{ group.label }}</div>

        <div
          v-for="s in group.items"
          :key="s.id"
          class="session-row"
          :class="{ active: isSelected(s) }"
          role="button"
          tabindex="0"
          :aria-pressed="isSelected(s)"
          @click="toggleSession(s, $event)"
          @keydown.enter.prevent="toggleSession(s, $event)"
          @keydown.space.prevent="toggleSession(s, $event)"
        >
          <div class="session-info">
            <div class="row-top">
              <span class="session-time">
                {{ formatTime(s.started_at) }}
                <template v-if="s.ended_at">
                  → {{ formatTime(s.ended_at) }}</template
                >
              </span>
              <span
                class="session-type-pill"
                :class="(s.activity_type || 'drive').toLowerCase()"
              >
                {{ s.activity_type }}
              </span>
            </div>

            <div class="row-sub">
              <span
                v-if="s.start_odometer_km != null && s.end_odometer_km != null"
              >
                {{ (s.end_odometer_km - s.start_odometer_km).toFixed(1) }} km
              </span>
              <span v-if="s.start_soc != null && s.end_soc != null">
                · SoC {{ Math.round(s.start_soc) }}% →
                {{ Math.round(s.end_soc) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { formatTime } from "@/components/VehicleSessions/utils.js";

export default {
  name: "SessionSidebar",
  props: {
    sessions: { type: Array, default: () => [] },
    selectedSessions: { type: Array, default: () => [] },
    toggleSession: { type: Function, required: true },
  },

  computed: {
    groupedSessions() {
      const groups = [];
      const byKey = new Map();

      const todayStr = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      for (const s of this.sessions) {
        const dt = s.started_at ? new Date(s.started_at) : null;
        const hasValidDate = dt && !Number.isNaN(dt.getTime());
        const dateKey = hasValidDate
          ? dt.toISOString().slice(0, 10)
          : "unknown";

        if (!byKey.has(dateKey)) {
          const dStr = hasValidDate ? dt.toDateString() : null;
          let label;

          if (!hasValidDate) {
            label = "Unknown date";
          } else if (dStr === todayStr) {
            label = "Today";
          } else if (dStr === yesterdayStr) {
            label = "Yesterday";
          } else {
            label = dt.toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          }

          const group = { dateKey, label, items: [] };
          byKey.set(dateKey, group);
          groups.push(group);
        }

        byKey.get(dateKey).items.push(s);
      }

      return groups;
    },
  },

  methods: {
    formatTime,
    isSelected(session) {
      return this.selectedSessions.some(
        (selected) => selected.id === session.id,
      );
    },
  },
};
</script>

<style lang="scss">
.session-sidebar,
.dark-panel {
  background: #11141a;
  border: 1px solid #222733;
  border-radius: 10px;
}

.session-sidebar {
  padding: 0.85rem;
}

.session-groups {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  padding-right: 2px;
}

.date-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.date-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #11141a;
  padding: 2px 4px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #71717a;
}

.session-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  background: #171b24;
  border: 1px solid #262c3a;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.row-top,
.row-sub {
  min-width: 0;
}

.selected-count {
  color: #38bdf8;
  font-size: 0.72rem;
}

.session-row:hover {
  border-color: #3f485c;
}

.session-row.active {
  border-color: #38bdf8;
  background: #142230;
}

.row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.session-time {
  font-size: 0.84rem;
  font-weight: 600;
  color: #f4f4f5;
}

.session-type-pill {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(56, 189, 248, 0.14);
  color: #38bdf8;
}

.session-type-pill.charge {
  background: rgba(34, 197, 94, 0.14);
  color: #4ade80;
}

.row-sub {
  font-size: 0.75rem;
  color: #a1a1aa;
  margin-top: 4px;
}
</style>
