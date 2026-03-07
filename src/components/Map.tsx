"use client";

import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  GeoJSON,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getLayerGeoJSON, getLayers } from "@/lib/api";

// Fix default marker icon issue with webpack
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LayerData {
  name: string;
  label: string;
  color: string;
  geojson: GeoJSON.FeatureCollection;
  visible: boolean;
}

interface MapProps {
  onPinDrop: (lat: number, lng: number) => void;
  pin: { lat: number; lng: number } | null;
}

function ClickHandler({ onPinDrop }: { onPinDrop: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPinDrop(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToPin({ pin }: { pin: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (pin) {
      map.flyTo([pin.lat, pin.lng], 13, { duration: 0.8 });
    }
  }, [pin, map]);
  return null;
}

export default function Map({ onPinDrop, pin }: MapProps) {
  const [layers, setLayers] = useState<LayerData[]>([]);
  const [loadingLayers, setLoadingLayers] = useState(true);
  const [showLayers, setShowLayers] = useState(false);

  // Load all GeoJSON layers from backend
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
              visible: name !== "indigenous_treaties" && name !== "greenbelt",
            });
          } catch {
            console.warn(`Failed to load layer: ${name}`);
          }
        }
        setLayers(loaded);
      } catch {
        console.warn("Backend not available — map running without data layers");
      } finally {
        setLoadingLayers(false);
      }
    }
    loadLayers();
  }, []);

  const toggleLayer = (name: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.name === name ? { ...l, visible: !l.visible } : l))
    );
  };

  const getStyle = (layer: LayerData) => ({
    color: layer.color,
    weight: 2,
    opacity: 0.7,
    fillColor: layer.color,
    fillOpacity: 0.15,
  });

  const pointToLayer = (layer: LayerData) => (_feature: GeoJSON.Feature, latlng: L.LatLng) => {
    return L.circleMarker(latlng, {
      radius: 8,
      fillColor: layer.color,
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
    });
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={[43.4723, -80.5449]}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onPinDrop={onPinDrop} />
        <FlyToPin pin={pin} />

        {/* Render GeoJSON layers */}
        {layers
          .filter((l) => l.visible)
          .map((layer) => (
            <GeoJSON
              key={layer.name + String(layer.visible)}
              data={layer.geojson}
              style={() => getStyle(layer)}
              pointToLayer={
                layer.geojson.features.some(
                  (f) => f.geometry.type === "Point"
                )
                  ? pointToLayer(layer)
                  : undefined
              }
              onEachFeature={(feature, leafletLayer) => {
                const props = feature.properties;
                if (props) {
                  const name = props.name || props.OFFICIAL_NAME_ENGLISH || props.zone_name || props.label || "";
                  if (name) {
                    leafletLayer.bindPopup(
                      `<strong>${layer.label}</strong><br/>${name}`
                    );
                  }
                }
              }}
            />
          ))}

        {/* Pin marker */}
        {pin && <Marker position={[pin.lat, pin.lng]} icon={markerIcon} />}
      </MapContainer>

      {/* Layer toggle panel */}
      <div className="absolute top-3 right-3 z-[1000]">
        <button
          onClick={() => setShowLayers(!showLayers)}
          className="w-9 h-9 bg-surface border border-border rounded-lg flex items-center justify-center text-muted hover:text-foreground transition-colors shadow-sm"
          title="Toggle layers"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            {loadingLayers ? (
              <p className="text-xs text-muted-light">Loading...</p>
            ) : layers.length === 0 ? (
              <p className="text-xs text-muted-light">No layers available (start backend)</p>
            ) : (
              layers.map((layer) => (
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
              ))
            )}
          </div>
        )}
      </div>

      {/* Coordinates display */}
      {pin && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-surface/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs text-muted font-mono border border-border shadow-sm">
          {pin.lat.toFixed(4)}° N, {Math.abs(pin.lng).toFixed(4)}° W
        </div>
      )}

      {/* Hint when no pin */}
      {!pin && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-foreground/80 text-white text-xs px-3 py-1.5 rounded-full">
          Click anywhere to drop a pin
        </div>
      )}
    </div>
  );
}
