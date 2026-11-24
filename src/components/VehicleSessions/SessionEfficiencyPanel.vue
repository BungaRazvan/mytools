<template>
  <section class="dark-panel efficiency-panel">
    <div class="panel-header">
      <span>EV/ICE Usage</span>
      <span class="muted-inline">
        {{ stats.electricDistanceKm.toFixed(1) }} km EV ·
        {{ stats.fuelConsumedLiters.toFixed(2) }} L fuel
      </span>
    </div>

    <!-- EV / ICE Usage Bar -->
    <div
      class="usage-bar-track"
      :title="`EV ${stats.evSharePct.toFixed(
        1,
      )}% · ICE ${stats.iceSharePct.toFixed(1)}%`"
    >
      <div class="bar-seg ev" :style="{ width: `${stats.evSharePct}%` }"></div>
      <div
        class="bar-seg ice"
        :style="{ width: `${stats.iceSharePct}%` }"
      ></div>
    </div>

    <div class="usage-meta-row">
      <span
        ><i class="dot ev"></i>Electric: {{ stats.evSharePct.toFixed(1) }}% ({{
          stats.electricDistanceKm.toFixed(1)
        }}
        km)</span
      >
      <span
        ><i class="dot ice"></i>ICE / Other: {{ stats.iceSharePct.toFixed(1) }}%
        ({{ stats.iceDistanceKm.toFixed(1) }} km)</span
      >
    </div>

    <!-- 4 Summary Cards -->
    <div class="summary-grid">
      <!-- 1. Trip Summary -->
      <div class="metric-card">
        <div class="metric-label">Trip Summary</div>
        <div class="metric-value">
          {{ stats.hasDistance ? `${stats.distanceKm.toFixed(1)} km` : "— km" }}
        </div>
        <div class="metric-sub">{{ stats.durationText }}</div>
      </div>

      <!-- 2. Efficiency Metrics -->
      <div class="metric-card">
        <div class="metric-label">Efficiency Metrics</div>
        <div class="metric-value accent-emerald">
          {{ stats.hasEvShare ? `${stats.evSharePct.toFixed(1)}%` : "—%" }}
        </div>
        <div class="metric-sub">
          Electric share · +{{ stats.recuperatedKwh.toFixed(2) }} kWh regen
        </div>
      </div>

      <!-- 3. Battery Health -->
      <div class="metric-card">
        <div class="metric-label">Battery Health</div>
        <div class="metric-value">
          {{ stats.endSoc != null ? `${Math.round(stats.endSoc)}%` : "—%" }}
        </div>
        <div class="metric-sub">{{ stats.socRangeText }}</div>
      </div>

      <!-- 4. Fuel Cost -->
      <div class="metric-card">
        <div class="metric-label">Fuel Cost</div>
        <div class="metric-value accent-amber">
          {{ stats.hasFuel ? `£${stats.estFuelCost.toFixed(2)}` : "—" }}
        </div>
        <div class="metric-sub">
          <span> {{ stats.fuelConsumedLiters.toFixed(2) }} L </span>
          <span v-if="fuelPricePerLitre !== null">
            @ £ {{ fuelPricePerLitre.toFixed(2) }}/L
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
function numOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatDuration(seconds) {
  if (seconds == null || seconds <= 0) return "Duration";
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return hrs > 0 ? `${hrs}h ${remMins}m` : `${mins}m`;
}

export default {
  name: "SessionEfficiencyPanel",
  props: {
    sessions: {
      type: Array,
      default: () => [],
    },
    fuelPricePerLitre: {
      type: Number,
      default: null,
    },
  },
  computed: {
    stats() {
      let distanceKm = 0;
      let hasDistance = false;
      let electricDistanceKm = 0;
      let fuelConsumedLiters = 0;
      let hasFuel = false;
      let recuperatedKwh = 0;
      let durationSeconds = 0;
      let firstStartSoc = null;
      let lastEndSoc = null;

      for (const item of this.sessions) {
        console.log(item);
        const sum = item?.summary;

        const dist = numOrNull(sum.distance_km ?? item?.total_distance_km);
        if (dist != null) {
          distanceKm += dist;
          hasDistance = true;
        }

        const evDist = numOrNull(
          sum.electric_distance_km ?? item?.electric_distance_km,
        );
        if (evDist != null) {
          electricDistanceKm += evDist;
        }

        const fuel = numOrNull(
          sum.fuel_consumed_liters ?? item?.fuel_consumed_liters,
        );
        if (fuel != null) {
          fuelConsumedLiters += fuel;
          hasFuel = true;
        }

        const regen = numOrNull(sum.recuperated_kwh ?? item?.recuperated_kwh);
        if (regen != null) {
          recuperatedKwh += regen;
        }

        let dur = numOrNull(sum.duration_seconds);
        if (dur == null && item?.started_at && item?.ended_at) {
          const diff =
            (new Date(item.ended_at).getTime() -
              new Date(item.started_at).getTime()) /
            1000;
          if (diff > 0) dur = Math.floor(diff);
        }
        if (dur != null) {
          durationSeconds += dur;
        }

        const sSoc = numOrNull(sum.start_soc ?? item?.start_soc);
        const eSoc = numOrNull(sum.battery_soc ?? sum.end_soc ?? item?.end_soc);
        if (firstStartSoc == null && sSoc != null) firstStartSoc = sSoc;
        if (eSoc != null) lastEndSoc = eSoc;
      }

      const hasEvShare = hasDistance && distanceKm > 0;
      const evSharePct = hasEvShare
        ? Math.min(100, Math.max(0, (electricDistanceKm / distanceKm) * 100))
        : 0;
      const iceSharePct = hasEvShare ? Math.max(0, 100 - evSharePct) : 0;
      const iceDistanceKm = Math.max(0, distanceKm - electricDistanceKm);

      const socRangeText =
        firstStartSoc != null && lastEndSoc != null
          ? `${Math.round(firstStartSoc)}% → ${Math.round(lastEndSoc)}% SoC`
          : "State of charge";

      return {
        distanceKm,
        hasDistance,
        electricDistanceKm,
        iceDistanceKm,
        fuelConsumedLiters,
        hasFuel,
        recuperatedKwh,
        hasEvShare,
        evSharePct,
        iceSharePct,
        durationText: formatDuration(durationSeconds),
        endSoc: lastEndSoc,
        socRangeText,
        estFuelCost: this.fuelPricePerLitre
          ? fuelConsumedLiters * this.fuelPricePerLitre
          : null,
      };
    },
  },
};
</script>

<style scoped>
.efficiency-panel {
  padding: 0.9rem 1rem;
  background: #11141a;
  border: 1px solid #222733;
  border-radius: 10px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.65rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #f4f4f5;
}

.muted-inline {
  font-size: 0.75rem;
  font-weight: 400;
  color: #94a3b8;
}

.usage-bar-track {
  display: flex;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: #1b202c;
}

.bar-seg.ev {
  background: #10b981;
  transition: width 0.25s ease;
}

.bar-seg.ice {
  background: #f59e0b;
  transition: width 0.25s ease;
}

.usage-meta-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.45rem;
  margin-bottom: 0.85rem;
  font-size: 0.73rem;
  color: #94a3b8;
}

.usage-meta-row .dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  margin-right: 5px;
}

.usage-meta-row .dot.ev {
  background: #10b981;
}

.usage-meta-row .dot.ice {
  background: #f59e0b;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.metric-card {
  background: #171b24;
  border: 1px solid #262c3a;
  border-radius: 8px;
  padding: 0.75rem 0.85rem;
}

.metric-label {
  font-size: 0.75rem;
  color: #94a3b8;
}

.metric-value {
  font-size: 1.15rem;
  font-weight: 700;
  margin-top: 4px;
  color: #f4f4f5;
}

.metric-sub {
  font-size: 0.72rem;
  color: #71717a;
  margin-top: 3px;
}

.accent-emerald {
  color: #34d399;
}

.accent-amber {
  color: #fbbf24;
}
</style>
