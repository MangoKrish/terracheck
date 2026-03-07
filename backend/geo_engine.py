"""Geospatial engine — loads GeoJSON layers and runs spatial intersection queries."""
import geopandas as gpd
from shapely.geometry import Point
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).parent.parent / "data" / "geojson"

# Layer config: name -> (file, geometry_type, color for frontend)
LAYERS = {
    "flood_zones": {
        "file": "flood_zones.geojson",
        "label": "Flood Zones",
        "color": "#3b82f6",
        "severity": "high",
    },
    "greenbelt": {
        "file": "greenbelt.geojson",
        "label": "Greenbelt Boundary",
        "color": "#22c55e",
        "severity": "critical",
    },
    "zoning": {
        "file": "zoning.geojson",
        "label": "Zoning",
        "color": "#eab308",
        "severity": "info",
    },
    "contaminated_sites": {
        "file": "contaminated_sites.geojson",
        "label": "Contaminated Sites",
        "color": "#ef4444",
        "severity": "high",
    },
    "protected_areas": {
        "file": "protected_areas.geojson",
        "label": "Protected Areas",
        "color": "#10b981",
        "severity": "high",
    },
    "indigenous_treaties": {
        "file": "indigenous_treaties.geojson",
        "label": "Indigenous Treaty Lands",
        "color": "#f97316",
        "severity": "medium",
    },
}


class GeoEngine:
    """Loads all GeoJSON layers into memory and provides spatial query methods."""

    def __init__(self):
        self.layers: dict[str, gpd.GeoDataFrame] = {}
        self._load_layers()

    def _load_layers(self):
        for name, config in LAYERS.items():
            path = DATA_DIR / config["file"]
            if path.exists():
                gdf = gpd.read_file(path)
                # Ensure WGS84
                if gdf.crs and gdf.crs.to_epsg() != 4326:
                    gdf = gdf.to_crs(epsg=4326)
                self.layers[name] = gdf
                print(f"  Loaded {name}: {len(gdf)} features")
            else:
                print(f"  WARNING: {path} not found, skipping {name}")

    def query_point(self, lat: float, lng: float, radius_km: float = 1.0) -> dict[str, Any]:
        """Query all layers for features intersecting a buffered point.

        Args:
            lat: Latitude (WGS84)
            lng: Longitude (WGS84)
            radius_km: Search radius in kilometers

        Returns:
            Dict with intersecting features per layer + metadata
        """
        point = Point(lng, lat)
        # Approximate degree buffer (1 degree ~ 111km at equator, ~78km at 43°N lat)
        buffer_deg = radius_km / 78.0
        search_area = point.buffer(buffer_deg)

        results = {}
        for name, gdf in self.layers.items():
            config = LAYERS[name]
            intersecting = gdf[gdf.geometry.intersects(search_area)]

            if len(intersecting) > 0:
                # Extract properties (drop geometry for the summary)
                features = []
                for _, row in intersecting.iterrows():
                    props = {k: v for k, v in row.items() if k != "geometry"}
                    # Convert numpy types to Python types
                    props = {k: (str(v) if hasattr(v, 'item') else v) for k, v in props.items()}
                    features.append(props)

                results[name] = {
                    "label": config["label"],
                    "color": config["color"],
                    "severity": config["severity"],
                    "count": len(features),
                    "features": features,
                }

        return {
            "lat": lat,
            "lng": lng,
            "radius_km": radius_km,
            "layers_queried": len(self.layers),
            "layers_intersecting": len(results),
            "results": results,
        }

    def get_layer_geojson(self, layer_name: str) -> dict | None:
        """Return raw GeoJSON for a specific layer (for map rendering)."""
        if layer_name not in self.layers:
            return None
        import json
        return json.loads(self.layers[layer_name].to_json())
