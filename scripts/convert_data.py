"""Convert raw shapefiles to GeoJSON and create mock data for missing layers."""
import geopandas as gpd
import json
import os
from pathlib import Path
from shapely.geometry import Point, Polygon, mapping

RAW_DIR = Path(__file__).parent.parent / "data" / "raw"
OUT_DIR = Path(__file__).parent.parent / "data" / "geojson"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def convert_greenbelt():
    """Convert Greenbelt outer boundary shapefile to GeoJSON."""
    # Use the API-downloaded GeoJSON directly (already in good shape)
    api_file = RAW_DIR / "greenbelt_api.geojson"
    if api_file.exists():
        gdf = gpd.read_file(api_file)
        # Simplify geometry to reduce file size for frontend
        gdf["geometry"] = gdf["geometry"].simplify(0.001)
        gdf.to_file(OUT_DIR / "greenbelt.geojson", driver="GeoJSON")
        print(f"Greenbelt: {len(gdf)} features -> greenbelt.geojson")
        return

    # Fallback to shapefile
    import zipfile
    with zipfile.ZipFile(RAW_DIR / "greenbelt.zip", "r") as z:
        z.extractall(RAW_DIR / "greenbelt_extracted")
    shp_path = RAW_DIR / "greenbelt_extracted" / "Greenbelt_Shapefiles" / "Greenbelt_outer_boundary"
    for f in shp_path.iterdir():
        if f.suffix == ".shp":
            gdf = gpd.read_file(f)
            gdf = gdf.to_crs(epsg=4326)
            gdf["geometry"] = gdf["geometry"].simplify(0.001)
            gdf.to_file(OUT_DIR / "greenbelt.geojson", driver="GeoJSON")
            print(f"Greenbelt (from shp): {len(gdf)} features")
            return


def convert_treaties():
    """Convert treaty boundaries shapefile to GeoJSON, filtered to Ontario."""
    import zipfile
    with zipfile.ZipFile(RAW_DIR / "treaties.zip", "r") as z:
        z.extractall(RAW_DIR / "treaties_extracted")

    extracted = RAW_DIR / "treaties_extracted"
    shp_files = list(extracted.glob("*.shp"))
    if not shp_files:
        print("No treaty shapefile found")
        return

    gdf = gpd.read_file(shp_files[0])
    gdf = gdf.to_crs(epsg=4326)

    # Filter to treaties that overlap with Ontario's bounding box
    ontario_bbox = Polygon([
        (-95.2, 41.6), (-74.3, 41.6), (-74.3, 56.9), (-95.2, 56.9), (-95.2, 41.6)
    ])
    gdf = gdf[gdf.geometry.intersects(ontario_bbox)]
    gdf["geometry"] = gdf["geometry"].simplify(0.005)
    gdf.to_file(OUT_DIR / "indigenous_treaties.geojson", driver="GeoJSON")
    print(f"Treaties (Ontario): {len(gdf)} features -> indigenous_treaties.geojson")


def create_mock_flood_zones():
    """Create realistic mock flood zone data for Waterloo Region."""
    # Based on Grand River floodplain — approximate polygons along the river
    flood_zones = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "Grand River Floodplain - Central Kitchener",
                    "zone": "regulatory_floodplain",
                    "risk_level": "high",
                    "authority": "Grand River Conservation Authority"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-80.4975, 43.4350], [-80.4850, 43.4350], [-80.4820, 43.4420],
                        [-80.4800, 43.4500], [-80.4830, 43.4580], [-80.4900, 43.4600],
                        [-80.4980, 43.4570], [-80.5010, 43.4490], [-80.5000, 43.4410],
                        [-80.4975, 43.4350]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Grand River Floodplain - North Waterloo",
                    "zone": "regulatory_floodplain",
                    "risk_level": "high",
                    "authority": "Grand River Conservation Authority"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-80.5300, 43.4700], [-80.5180, 43.4710], [-80.5120, 43.4780],
                        [-80.5100, 43.4860], [-80.5150, 43.4920], [-80.5250, 43.4930],
                        [-80.5330, 43.4880], [-80.5350, 43.4800], [-80.5320, 43.4730],
                        [-80.5300, 43.4700]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Laurel Creek Floodplain",
                    "zone": "regulatory_floodplain",
                    "risk_level": "moderate",
                    "authority": "Grand River Conservation Authority"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-80.5600, 43.4750], [-80.5500, 43.4760], [-80.5450, 43.4800],
                        [-80.5400, 43.4830], [-80.5420, 43.4870], [-80.5500, 43.4880],
                        [-80.5580, 43.4850], [-80.5620, 43.4800], [-80.5600, 43.4750]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Speed River Floodplain - Cambridge",
                    "zone": "regulatory_floodplain",
                    "risk_level": "high",
                    "authority": "Grand River Conservation Authority"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-80.3200, 43.3600], [-80.3100, 43.3610], [-80.3050, 43.3680],
                        [-80.3030, 43.3750], [-80.3080, 43.3810], [-80.3180, 43.3820],
                        [-80.3250, 43.3770], [-80.3260, 43.3690], [-80.3230, 43.3630],
                        [-80.3200, 43.3600]
                    ]]
                }
            }
        ]
    }
    with open(OUT_DIR / "flood_zones.geojson", "w") as f:
        json.dump(flood_zones, f)
    print(f"Flood zones (mock): {len(flood_zones['features'])} features -> flood_zones.geojson")


def create_mock_zoning():
    """Create realistic mock zoning data for Waterloo Region."""
    zoning_data = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "zone_code": "C-4",
                    "zone_name": "Mixed Use Commercial",
                    "municipality": "City of Waterloo",
                    "max_height_m": 25,
                    "max_density": "high",
                    "permitted_uses": "retail, office, residential above ground floor"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-80.5250, 43.4620], [-80.5150, 43.4620], [-80.5150, 43.4700],
                        [-80.5250, 43.4700], [-80.5250, 43.4620]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "zone_code": "R-6",
                    "zone_name": "High Density Residential",
                    "municipality": "City of Waterloo",
                    "max_height_m": 40,
                    "max_density": "high",
                    "permitted_uses": "apartments, condominiums, mixed residential"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-80.5400, 43.4650], [-80.5250, 43.4650], [-80.5250, 43.4750],
                        [-80.5400, 43.4750], [-80.5400, 43.4650]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "zone_code": "R-2",
                    "zone_name": "Low Density Residential",
                    "municipality": "City of Waterloo",
                    "max_height_m": 11,
                    "max_density": "low",
                    "permitted_uses": "single detached, semi-detached, duplex"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-80.5600, 43.4500], [-80.5400, 43.4500], [-80.5400, 43.4650],
                        [-80.5600, 43.4650], [-80.5600, 43.4500]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "zone_code": "I-2",
                    "zone_name": "General Industrial",
                    "municipality": "City of Kitchener",
                    "max_height_m": 15,
                    "max_density": "medium",
                    "permitted_uses": "manufacturing, warehouse, research facility"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-80.4700, 43.4200], [-80.4500, 43.4200], [-80.4500, 43.4350],
                        [-80.4700, 43.4350], [-80.4700, 43.4200]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "zone_code": "A",
                    "zone_name": "Agricultural",
                    "municipality": "Township of Woolwich",
                    "max_height_m": 11,
                    "max_density": "very_low",
                    "permitted_uses": "farming, agriculture-related uses, single dwelling"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-80.5800, 43.5200], [-80.4800, 43.5200], [-80.4800, 43.5600],
                        [-80.5800, 43.5600], [-80.5800, 43.5200]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "zone_code": "OS",
                    "zone_name": "Open Space",
                    "municipality": "City of Waterloo",
                    "max_height_m": 0,
                    "max_density": "none",
                    "permitted_uses": "parks, recreation, conservation"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-80.5500, 43.4750], [-80.5400, 43.4750], [-80.5400, 43.4830],
                        [-80.5500, 43.4830], [-80.5500, 43.4750]
                    ]]
                }
            }
        ]
    }
    with open(OUT_DIR / "zoning.geojson", "w") as f:
        json.dump(zoning_data, f)
    print(f"Zoning (mock): {len(zoning_data['features'])} features -> zoning.geojson")


def create_mock_contaminated_sites():
    """Create realistic mock contaminated sites for Ontario based on known federal sites."""
    sites = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "Former Industrial Facility - King St",
                    "classification": "Class 2 - Action Required",
                    "contaminants": "Petroleum hydrocarbons, metals",
                    "status": "Assessment ongoing",
                    "federal_id": "ON-0342"
                },
                "geometry": {"type": "Point", "coordinates": [-80.4920, 43.4510]}
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Former Gas Station - Weber St",
                    "classification": "Class 2 - Action Required",
                    "contaminants": "BTEX, petroleum hydrocarbons",
                    "status": "Remediation in progress",
                    "federal_id": "ON-0587"
                },
                "geometry": {"type": "Point", "coordinates": [-80.4960, 43.4630]}
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Legacy Landfill Site - Bridgeport",
                    "classification": "Class 1 - High Priority",
                    "contaminants": "Mixed waste, leachate, methane",
                    "status": "Monitored",
                    "federal_id": "ON-0128"
                },
                "geometry": {"type": "Point", "coordinates": [-80.4750, 43.4800]}
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Rail Yard Brownfield - Victoria St",
                    "classification": "Class 2 - Action Required",
                    "contaminants": "PAHs, creosote, metals",
                    "status": "Phase 2 ESA complete",
                    "federal_id": "ON-0891"
                },
                "geometry": {"type": "Point", "coordinates": [-80.4830, 43.4420]}
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Former Electroplating Facility",
                    "classification": "Class 3 - Low Priority",
                    "contaminants": "Hexavalent chromium, nickel",
                    "status": "Remediation complete - monitoring",
                    "federal_id": "ON-1023"
                },
                "geometry": {"type": "Point", "coordinates": [-80.5150, 43.4550]}
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Preston Industrial Corridor",
                    "classification": "Class 2 - Action Required",
                    "contaminants": "TCE, PCE, chlorinated solvents",
                    "status": "Groundwater monitoring",
                    "federal_id": "ON-0455"
                },
                "geometry": {"type": "Point", "coordinates": [-80.3520, 43.3950]}
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Former Textile Mill - Galt",
                    "classification": "Class 2 - Action Required",
                    "contaminants": "Heavy metals, dyes, solvents",
                    "status": "Assessment ongoing",
                    "federal_id": "ON-0672"
                },
                "geometry": {"type": "Point", "coordinates": [-80.3150, 43.3580]}
            }
        ]
    }
    with open(OUT_DIR / "contaminated_sites.geojson", "w") as f:
        json.dump(sites, f)
    print(f"Contaminated sites (mock): {len(sites['features'])} features -> contaminated_sites.geojson")


def create_mock_protected_areas():
    """Create mock protected/environmentally sensitive areas for Waterloo Region."""
    areas = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "Laurel Creek Conservation Area",
                    "type": "Conservation Area",
                    "designation": "Provincially Significant Wetland",
                    "authority": "Grand River Conservation Authority",
                    "restrictions": "No development within 120m buffer"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-80.5650, 43.4800], [-80.5550, 43.4790], [-80.5500, 43.4830],
                        [-80.5480, 43.4890], [-80.5520, 43.4930], [-80.5600, 43.4940],
                        [-80.5660, 43.4900], [-80.5680, 43.4850], [-80.5650, 43.4800]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Environmentally Sensitive Policy Area 50",
                    "type": "ESPA",
                    "designation": "Regionally Significant",
                    "authority": "Region of Waterloo",
                    "restrictions": "Environmental Impact Study required"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-80.5350, 43.4900], [-80.5280, 43.4910], [-80.5260, 43.4960],
                        [-80.5290, 43.5010], [-80.5370, 43.5000], [-80.5390, 43.4950],
                        [-80.5350, 43.4900]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Rare Charitable Research Reserve",
                    "type": "Nature Reserve",
                    "designation": "Ecologically Significant",
                    "authority": "Private Conservation",
                    "restrictions": "Protected natural heritage feature"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-80.3850, 43.3900], [-80.3750, 43.3910], [-80.3700, 43.3970],
                        [-80.3720, 43.4030], [-80.3800, 43.4050], [-80.3880, 43.4010],
                        [-80.3900, 43.3950], [-80.3850, 43.3900]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Huron Natural Area",
                    "type": "ESA",
                    "designation": "Environmentally Sensitive Area",
                    "authority": "City of Kitchener",
                    "restrictions": "Development setback required"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-80.4600, 43.4150], [-80.4520, 43.4160], [-80.4490, 43.4210],
                        [-80.4510, 43.4260], [-80.4580, 43.4270], [-80.4620, 43.4230],
                        [-80.4630, 43.4180], [-80.4600, 43.4150]
                    ]]
                }
            }
        ]
    }
    with open(OUT_DIR / "protected_areas.geojson", "w") as f:
        json.dump(areas, f)
    print(f"Protected areas (mock): {len(areas['features'])} features -> protected_areas.geojson")


if __name__ == "__main__":
    print("Converting geospatial data...\n")
    convert_greenbelt()
    convert_treaties()
    create_mock_flood_zones()
    create_mock_zoning()
    create_mock_contaminated_sites()
    create_mock_protected_areas()
    print("\nDone! All GeoJSON files in:", OUT_DIR)
