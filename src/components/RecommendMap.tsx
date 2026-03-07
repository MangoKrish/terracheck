"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getLayerGeoJSON, getLayers, type RecommendedLocation } from "@/lib/api";

interface LayerData {
  name: string;
  label: string;
  color: string;
  geojson: GeoJSON.FeatureCollection;
  visible: boolean;
}

interface RecommendMapProps {
  locations: RecommendedLocation[];
  activeLocation: RecommendedLocation | null;
  onMarkerClick: (location: RecommendedLocation) => void;
}

function createNumberedIcon(rank: number, isActive: boolean) {
  const size = isActive ? 36 : 28;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${isActive ? "#1B4332" : "#2D6A4F"};
      color:white;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:${isActive ? 16 : 13}px;
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      transition:all 0.2s ease;
    ">${rank}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitBounds({ locations }: { locations: RecommendedLocation[] }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length === 0) return;
    const bounds = L.latLngBounds(
      locations.map((l) => [l.lat, l.lng] as [number, number])
    );
    map.fitBounds(bounds.pad(0.3), { duration: 0.8 });
  }, [locations, map]);
  return null;
}

function FlyToActive({ location }: { location: RecommendedLocation | null }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 14, { duration: 0.8 });
    }
  }, [location, map]);
  return null;
}

export default function RecommendMap({
  locations,
  activeLocation,
  onMarkerClick,
}: RecommendMapProps) {
  const [layers, setLayers] = useState<LayerData[]>([]);
  const [showLayers, setShowLayers] = useState(false);

  useEffect(() => {
    async function loadLayers() {
      try {
        const layerInfo = await getLayers();
        const loaded: LayerData[] = [];
        for (const [name, info] of Object.entries(layerInfo)) {
          if (!info.loaded) continue;
          try {
            const geojson = await getLayerGeoJSON(name);
            loaded.push({
              name,
              label: info.label,
              color: info.color,
              geojson,
              visible: name === "zoning",
            });
          } catch {
            /* skip */
          }
        }
        setLayers(loaded);
      } catch {
        /* backend not available */
      }
    }
    loadLayers();
  }, []);

  const toggleLayer = (name: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.name === name ? { ...l, visible: !l.visible } : l))
    );
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={[44.0, -79.5]}
        zoom={6}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds locations={locations} />
        <FlyToActive location={activeLocation} />

        {/* GeoJSON layers */}
        {layers
          .filter((l) => l.visible)
          .map((layer) => (
            <GeoJSON
              key={layer.name + String(layer.visible)}
              data={layer.geojson}
              style={() => ({
                color: layer.color,
                weight: 2,
                opacity: 0.5,
                fillColor: layer.color,
                fillOpacity: 0.1,
              })}
              onEachFeature={(feature, leafletLayer) => {
                const props = feature.properties;
                if (props) {
                  const name =
                    props.name || props.zone_name || props.label || "";
                  if (name) {
                    leafletLayer.bindPopup(
                      `<strong>${layer.label}</strong><br/>${name}`
                    );
                  }
                }
              }}
            />
          ))}

        {/* Recommendation markers */}
        {locations.map((loc) => (
          <Marker
            key={loc.rank}
            position={[loc.lat, loc.lng]}
            icon={createNumberedIcon(
              loc.rank,
              activeLocation?.rank === loc.rank
            )}
            eventHandlers={{
              click: () => onMarkerClick(loc),
            }}
          >
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong>{loc.location_name}</strong>
                <br />
                <span>Score: {loc.score}/100</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Layer toggle */}
      <div className="absolute top-3 right-3 z-[1000]">
        <button
          onClick={() => setShowLayers(!showLayers)}
          className="w-9 h-9 bg-surface border border-border rounded-lg flex items-center justify-center text-muted hover:text-foreground transition-colors shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </button>
        {showLayers && (
          <div className="mt-2 bg-surface border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Data Layers
            </p>
            {layers.map((layer) => (
              <label
                key={layer.name}
                className="flex items-center gap-2 py-1 cursor-pointer text-sm text-foreground hover:text-primary transition-colors"
              >
                <input
                  type="checkbox"
                  checked={layer.visible}
                  onChange={() => toggleLayer(layer.name)}
                  className="rounded"
                />
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: layer.color }}
                />
                {layer.label}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Empty hint */}
      {locations.length === 0 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-foreground/80 text-white text-xs px-3 py-1.5 rounded-full">
          Fill out the form to find optimal locations
        </div>
      )}
    </div>
  );
}
