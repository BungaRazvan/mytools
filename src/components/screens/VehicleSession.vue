<template>
  <div class="session-dashboard">
    <!-- Left: Session List Sidebar -->
    <SessionSidebar
      :sessions="sessions"
      :selectedSessions="selectedSessions"
      :toggleSession="toggleSession"
    />

    <!-- Right: Map on top + Efficiency Canvas lower section below -->
    <main class="session-main">
      <SessionRouteMap
        v-if="selectedSessions.length"
        :sessions="sessionDetails"
        :loading="detailsLoading"
        :error="detailsError"
      />
      <!-- Lower Section (from Efficiency Canvas, styled for Dark Matter Tech) -->

      <SessionEfficiencyPanel
        v-if="selectedSessions.length"
        :sessions="sessionDetails"
      />
    </main>
  </div>
</template>

<script>
import SessionSidebar from "@/components/VehicleSessions/SessionSidebar.vue";
import SessionRouteMap from "@/components/VehicleSessions/SessionRouteMap.vue";
import SessionEfficiencyPanel from "@/components/VehicleSessions/SessionEfficiencyPanel.vue";

export default {
  name: "SessionView",
  components: { SessionSidebar, SessionRouteMap, SessionEfficiencyPanel },

  data() {
    return {
      sessions: [],
      selectedSessions: [],
      sessionDetails: [],
      summary: null,
      detailsLoading: false,
      detailsError: null,
      detailRequestId: 0,
    };
  },

  methods: {
    async toggleSession(session, event) {
      const isSelected = this.selectedSessions.some(
        (selected) => selected.id === session.id,
      );
      const addToSelection = event?.ctrlKey || event?.metaKey;

      if (addToSelection && this.selectedSessions.length > 0) {
        this.selectedSessions = isSelected
          ? this.selectedSessions.filter(
              (selected) => selected.id !== session.id,
            )
          : [...this.selectedSessions, session];
      } else {
        this.selectedSessions = [session];
      }

      const requestId = ++this.detailRequestId;
      const ids = this.selectedSessions.map((selected) => Number(selected.id));
      this.detailsError = null;
      this.sessionDetails = [];

      if (ids.length === 0) {
        this.detailsLoading = false;
        return;
      }

      if (!ids.every(Number.isSafeInteger)) {
        this.detailsError = "Selected trips contain an invalid session ID.";
        this.detailsLoading = false;
        return;
      }

      this.detailsLoading = true;

      try {
        const details = await this.fetchSessionDetails(ids);
        if (requestId === this.detailRequestId) {
          this.sessionDetails = details;
        }
      } catch (error) {
        if (requestId === this.detailRequestId) {
          this.detailsError =
            error instanceof Error
              ? error.message
              : "Failed to load selected trip details.";
        }
      } finally {
        if (requestId === this.detailRequestId) {
          this.detailsLoading = false;
        }
      }
    },

    async fetchSessionDetails(ids) {
      const params = ids.length === 1 ? { id: ids[0] } : { ids };
      const response = await window.ipc.receive("api", {
        method: "GET",
        endpoint: "vehicle/session_details",
        body: params,
        options: { useAPIKey: true, strict: true },
      });

      if (!response.ok) {
        return [];
      }

      return response.data;
    },

    async fetchSessions() {
      const response = await window.ipc.receive("api", {
        method: "GET",
        endpoint: "vehicle/sessions",
        options: { useAPIKey: true, strict: true },
      });

      if (response.ok) {
        return response.data;
      }

      return [];
    },
  },

  async mounted() {
    // Any initialization logic can be placed here
    this.sessions = await this.fetchSessions();
  },
};
</script>

<style>
.session-dashboard {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 1rem;
  min-height: 100%;
  background: #090b0f;
  color: #f4f4f5;
  padding: 1rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.panel-header h2 {
  font-size: 0.95rem;
  margin: 0;
}

.session-cards {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.session-row {
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  background: #171b24;
  border: 1px solid #262c3a;
  cursor: pointer;
}

.session-row.active {
  border-color: #38bdf8;
  background: #142230;
}

.session-type {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #a1a1aa;
  margin-top: 4px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #38bdf8;
}

.dot.charge {
  background: #22c55e;
}

.session-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.map-panel,
.usage-panel {
  padding: 0.9rem 1rem;
}

.chart-placeholder {
  height: 130px;
  border-radius: 8px;
  background: #0b0e14;
  border: 1px solid #1e2430;
  display: grid;
  place-items: center;
  color: #71717a;
  margin-bottom: 0.85rem;
}

.link-action {
  background: none;
  border: none;
  color: #38bdf8;
  font-size: 0.78rem;
  cursor: pointer;
}
</style>
