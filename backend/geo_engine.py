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


# Bounding boxes for Ontario region filtering
REGION_BOUNDS = {
    # Major urban centres
    "waterloo": {"lat_min": 43.35, "lat_max": 43.58, "lng_min": -80.65, "lng_max": -80.30},
    "gta": {"lat_min": 43.50, "lat_max": 43.90, "lng_min": -79.80, "lng_max": -79.10},
    "ottawa": {"lat_min": 45.25, "lat_max": 45.55, "lng_min": -75.95, "lng_max": -75.50},
    "hamilton": {"lat_min": 43.15, "lat_max": 43.35, "lng_min": -80.05, "lng_max": -79.70},
    "london": {"lat_min": 42.85, "lat_max": 43.10, "lng_min": -81.40, "lng_max": -81.10},
    "kingston": {"lat_min": 44.15, "lat_max": 44.35, "lng_min": -76.65, "lng_max": -76.35},
    "barrie": {"lat_min": 44.30, "lat_max": 44.50, "lng_min": -79.85, "lng_max": -79.55},
    "niagara": {"lat_min": 42.90, "lat_max": 43.25, "lng_min": -79.30, "lng_max": -78.90},
    "sudbury": {"lat_min": 46.40, "lat_max": 46.60, "lng_min": -81.15, "lng_max": -80.80},
    "thunder_bay": {"lat_min": 48.30, "lat_max": 48.50, "lng_min": -89.40, "lng_max": -89.10},
    # Rural / small-town / undeveloped regions
    "northern_ontario": {"lat_min": 46.00, "lat_max": 50.00, "lng_min": -95.00, "lng_max": -79.00},
    "eastern_ontario": {"lat_min": 44.00, "lat_max": 46.00, "lng_min": -77.50, "lng_max": -74.50},
    "central_ontario": {"lat_min": 44.20, "lat_max": 46.00, "lng_min": -80.50, "lng_max": -78.50},
    "southwestern_ontario": {"lat_min": 42.50, "lat_max": 43.50, "lng_min": -82.50, "lng_max": -80.00},
    # Full province
    "ontario_wide": None,  # No filtering — search all zones
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

    # --- Zone compatibility mapping ---
    ZONE_COMPAT = {
        "affordable_housing": lambda z: z.get("max_density") in ("high", "medium") and "resident" in z.get("permitted_uses", "").lower(),
        "residential_condo": lambda z: z.get("max_density") == "high",
        "commercial": lambda z: any(k in z.get("permitted_uses", "").lower() for k in ("retail", "office", "commercial")),
        "mixed_use": lambda z: any(k in z.get("permitted_uses", "").lower() for k in ("mixed", "retail")) and "resident" in z.get("permitted_uses", "").lower(),
        "industrial": lambda z: any(k in z.get("permitted_uses", "").lower() for k in ("manufacturing", "warehouse", "industrial")),
        "community_center": lambda z: any(k in z.get("permitted_uses", "").lower() for k in ("recreation", "community", "resident")),
    }

    def find_viable_zones(
        self,
        project_type: str,
        scale: str = "medium",
        region: str = "waterloo",
    ) -> list[dict[str, Any]]:
        """Find zones viable for a given project type.

        1. Filters zoning polygons by region bounding box
        2. Filters by project compatibility
        3. Checks for blocking overlaps (greenbelt, flood, contamination)
        4. Returns candidates sorted by fewest blocking issues
        """
        zoning_gdf = self.layers.get("zoning")
        if zoning_gdf is None or len(zoning_gdf) == 0:
            return []

        # Region-based spatial filtering
        bounds = REGION_BOUNDS.get(region)
        if bounds is not None:
            from shapely.geometry import box
            region_box = box(bounds["lng_min"], bounds["lat_min"],
                            bounds["lng_max"], bounds["lat_max"])
            zoning_gdf = zoning_gdf[zoning_gdf.geometry.intersects(region_box)]
            if len(zoning_gdf) == 0:
                return []

        compat_fn = self.ZONE_COMPAT.get(project_type, lambda z: True)
        blocking_layers = ["greenbelt", "flood_zones", "contaminated_sites"]
        warning_layers = ["protected_areas", "indigenous_treaties"]

        min_area = {"small": 0.0, "medium": 0.00005, "large": 0.0001}.get(scale, 0.0)

        candidates = []
        for _, row in zoning_gdf.iterrows():
            props = {k: v for k, v in row.items() if k != "geometry"}
            if not compat_fn(props):
                continue

            geom = row.geometry
            if geom is None or geom.is_empty:
                continue
            if geom.area < min_area:
                continue

            centroid = geom.centroid
            blocking_issues: list[dict] = []
            nearby_features: dict[str, dict] = {}

            for layer_name in blocking_layers:
                gdf = self.layers.get(layer_name)
                if gdf is None:
                    continue
                overlap = gdf[gdf.geometry.intersects(geom)]
                if len(overlap) > 0:
                    feats = []
                    for _, r in overlap.iterrows():
                        fp = {k: str(v) if hasattr(v, "item") else v for k, v in r.items() if k != "geometry"}
                        feats.append(fp)
                    blocking_issues.append({
                        "layer": layer_name,
                        "label": LAYERS[layer_name]["label"],
                        "severity": LAYERS[layer_name]["severity"],
                        "count": len(feats),
                        "features": feats,
                    })

            for layer_name in warning_layers:
                gdf = self.layers.get(layer_name)
                if gdf is None:
                    continue
                overlap = gdf[gdf.geometry.intersects(geom)]
                if len(overlap) > 0:
                    feats = []
                    for _, r in overlap.iterrows():
                        fp = {k: str(v) if hasattr(v, "item") else v for k, v in r.items() if k != "geometry"}
                        feats.append(fp)
                    nearby_features[layer_name] = {
                        "label": LAYERS[layer_name]["label"],
                        "severity": LAYERS[layer_name]["severity"],
                        "count": len(feats),
                        "features": feats,
                    }

            candidates.append({
                "lat": centroid.y,
                "lng": centroid.x,
                "zone_code": props.get("zone_code", ""),
                "zone_name": props.get("zone_name", ""),
                "municipality": props.get("municipality", ""),
                "max_height_m": props.get("max_height_m", 0),
                "max_density": props.get("max_density", ""),
                "permitted_uses": props.get("permitted_uses", ""),
                "blocking_issues": blocking_issues,
                "nearby_features": nearby_features,
            })

        candidates.sort(key=lambda c: len(c["blocking_issues"]))
        return candidates

    def get_layer_geojson(self, layer_name: str) -> dict | None:
        """Return raw GeoJSON for a specific layer (for map rendering)."""
        if layer_name not in self.layers:
            return None
        import json
        return json.loads(self.layers[layer_name].to_json())
