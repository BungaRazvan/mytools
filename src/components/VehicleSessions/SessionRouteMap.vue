<template>
  <!-- Top: Route Map -->
  <section class="dark-panel map-panel">
    <div class="panel-header">
      <span>Map</span>
      <div class="legend">
        <span><i class="swatch ev"></i>EV</span>
        <span><i class="swatch ice"></i>ICE</span>
        <span><i class="swatch regen"></i>Regen</span>
      </div>
    </div>

    <div class="route-map-shell">
      <div ref="mapEl" class="route-map-canvas"></div>
      <div
        v-if="loading || error || !hasRoute"
        class="route-empty"
        :class="{ 'route-error': error }"
        :role="error ? 'alert' : 'status'"
      >
        {{
          error ||
          (loading
            ? "Loading selected trips…"
            : "No GPS route points for selected session(s).")
        }}
      </div>
    </div>
  </section>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { isArray } from "lodash";

export const ROUTE_COLORS = {
  EV: "#3b82f6", // Electric drive
  REGEN: "#22c55e", // Recuperation
  ICE: "#f59e0b", // Petrol / combustion
};

function escapeHtml(value) {
  return String(value ?? "—").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function formatSoc(value) {
  if (value == null || value === "") {
    return null;
  }

  const soc = Number(value);
  return Number.isFinite(soc) ? `${Math.round(soc)}%` : null;
}

function formatSessionDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString("en-GB")
    : null;
}

function formatEndpointTooltip(session, includeDate, endpoint) {
  const dateLabel = includeDate
    ? formatSessionDate(session.started_at)
    : null;

  return `Session #${escapeHtml(session.id)}${
    dateLabel ? ` · ${escapeHtml(dateLabel)}` : ""
  } · ${endpoint}`;
}

export default {
  name: "SessionRouteMap",
  props: {
    sessions: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: null,
    },
  },

  computed: {
    allPoints() {
      return (this.sessions || []).flatMap((s) =>
        isArray(s.normalized_route_points) ? s.normalized_route_points : [],
      );
    },

    hasRoute() {
      return this.allPoints.length > 0;
    },
  },

  methods: {
    drawRoutes() {
      if (!this._map || !this._routeLayer) return;

      this._routeLayer.clearLayers();
      this._map.invalidateSize({ pan: false });

      const selected = this.sessions || [];
      const bounds = [];

      selected.forEach((ses, idx) => {
        const isMulti = selected.length > 1;
        const opacity = isMulti
          ? idx === selected.length - 1
            ? 0.95
            : 0.72
          : 0.95;
        const weight = isMulti ? 4 : 5;

        const segments = isArray(ses.route_segments) ? ses.route_segments : [];
        const points = isArray(ses.normalized_route_points)
          ? ses.normalized_route_points
          : [];
        for (const seg of segments) {
          if (!isArray(seg.coords) || seg.coords.length < 2) {
            continue;
          }

          bounds.push(...seg.coords);

          L.polyline(seg.coords, {
            color: "#090b0f",
            weight: weight + 3,
            opacity: 0.85,
            lineCap: "round",
            lineJoin: "round",
          }).addTo(this._routeLayer);

          const mode = String(seg.mode || "EV");
          const normalizedMode = mode.toUpperCase();
          const hasRegen =
            Boolean(seg.is_regen) || normalizedMode.includes("REGEN");
          const propulsionMode = mode
            .replace(/[_\s-]*REGEN/gi, "")
            .trim();
          const modeLabel = hasRegen
            ? propulsionMode
              ? `${propulsionMode} + Regen`
              : "Regen"
            : mode;
          const color = hasRegen
            ? ROUTE_COLORS.REGEN
            : seg.color || ROUTE_COLORS[normalizedMode] || ROUTE_COLORS.EV;
          const distance =
            seg.distance_km == null ? Number.NaN : Number(seg.distance_km);
          const routeInfoLines = [
            `<strong>Session #${escapeHtml(ses.id)}</strong>`,
            `Mode: ${escapeHtml(modeLabel)}`,
            `Distance: ${
              Number.isFinite(distance) ? `${distance.toFixed(1)} km` : "—"
            }`,
          ];
          if (selected.length > 1) {
            const dateLabel = formatSessionDate(ses.started_at);
            if (dateLabel) {
              routeInfoLines.push(`Date: ${escapeHtml(dateLabel)}`);
            }
          }

          const startSoc = formatSoc(seg.startPoint?.soc);
          const endSoc = formatSoc(seg.endPoint?.soc);

          if (startSoc && endSoc) {
            routeInfoLines.push(`SoC: ${startSoc} → ${endSoc}`);
          } else if (endSoc) {
            routeInfoLines.push(`End SoC: ${endSoc}`);
          } else if (startSoc) {
            routeInfoLines.push(`Start SoC: ${startSoc}`);
          }

          const routeInfo = routeInfoLines.join("<br/>");

          L.polyline(seg.coords, {
            color,
            weight,
            opacity,
            lineCap: "round",
            lineJoin: "round",
          })
            .bindTooltip(routeInfo)
            .bindPopup(routeInfo)
            .addTo(this._routeLayer);
        }

        if (points.length > 0) {
          const fromPt = points[0];
          const toPt = points[points.length - 1];
          const fromCoords = [Number(fromPt.lat), Number(fromPt.lon)];
          const toCoords = [Number(toPt.lat), Number(toPt.lon)];
          bounds.push(fromCoords);

          L.circleMarker(fromCoords, {
            radius: 7,
            fillColor: "#22c55e",
            color: "#f4f4f5",
            weight: 2,
            fillOpacity: 1,
          })
            .bindTooltip(
              formatEndpointTooltip(ses, selected.length > 1, "From (A)"),
            )
            .addTo(this._routeLayer);

          if (points.length > 1) {
            bounds.push(toCoords);
            L.circleMarker(toCoords, {
              radius: 7,
              fillColor: "#ef4444",
              color: "#f4f4f5",
              weight: 2,
              fillOpacity: 1,
            })
              .bindTooltip(
                formatEndpointTooltip(ses, selected.length > 1, "To (B)"),
              )
              .addTo(this._routeLayer);
          }
        }
      });

      if (bounds.length > 0) {
        this._map.fitBounds(bounds, {
          padding: [32, 32],
          maxZoom: 16,
          animate: false,
        });
      }
    },
  },

  created() {
    this._map = null;
    this._routeLayer = null;
    this._resizeObserver = null;
  },

  watch: {
    sessions: {
      handler() {
        this.$nextTick(() => this.drawRoutes());
      },
      deep: true,
    },
  },

  async mounted() {
    let carto_api = null;

    this._map = L.map(this.$refs.mapEl, {
      zoomControl: true,
      attributionControl: true,
    }).setView([53.3811, -1.4701], 12);

    const data = await window.ipc.receive("getSetting", [
      { name: "CARTO_API_TOKEN", isSecure: true },
    ]);

    if (!this._map) return;

    carto_api = data.CARTO_API_TOKEN;

    let mapUrl =
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    if (carto_api) {
      mapUrl += `?key=${carto_api}`;
    }

    L.tileLayer(mapUrl, {
      attribution: "&copy; OpenStreetMap &copy; CARTO",
      maxZoom: 19,
      maxNativeZoom: 18,
    }).addTo(this._map);

    this._routeLayer = L.layerGroup().addTo(this._map);

    this._resizeObserver = new ResizeObserver(() => {
      this._map?.invalidateSize();
    });

    this._resizeObserver.observe(this.$refs.mapEl);

    this.$nextTick(() => this.drawRoutes());
  },

  beforeUnmount() {
    this._resizeObserver?.disconnect();
    this._map?.remove();
    this._map = null;
  },
};
</script>

<style>
.route-map-shell {
  position: relative;
  width: 100%;
  height: clamp(380px, 48vh, 560px);
  min-height: 380px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #222733;
  background: #0b0e14;
}

.route-map-canvas {
  width: 100%;
  height: 100%;
}

.route-empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(11, 14, 20, 0.8);
  color: #94a3b8;
  font-size: 0.85rem;
  z-index: 500;
}

.legend {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #a1a1aa;
}

.swatch {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  margin-right: 4px;
}

.swatch.ev {
  background: #3b82f6;
}
.swatch.ice {
  background: #f59e0b;
}
.swatch.regen {
  background: #22c55e;
}

.route-empty.route-error {
  color: #fca5a5;
}
</style>
