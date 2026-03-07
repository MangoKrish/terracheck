"""Generate Ontario-wide representative GeoJSON data for TerraCheck.

Creates zoning, flood zones, contaminated sites, and protected areas
across 10 major Ontario regions. Greenbelt and indigenous treaties are
kept as-is since they already cover Ontario.
"""

import json
from pathlib import Path

OUT_DIR = Path(__file__).parent.parent / "data" / "geojson"

# ── Region definitions ──────────────────────────────────────────────

REGIONS = {
    "waterloo": {"center": (43.45, -80.49), "city": "City of Waterloo"},
    "kitchener": {"center": (43.43, -80.47), "city": "City of Kitchener"},
    "gta_toronto": {"center": (43.65, -79.38), "city": "City of Toronto"},
    "gta_mississauga": {"center": (43.59, -79.64), "city": "City of Mississauga"},
    "gta_brampton": {"center": (43.68, -79.76), "city": "City of Brampton"},
    "ottawa": {"center": (45.42, -75.69), "city": "City of Ottawa"},
    "hamilton": {"center": (43.26, -79.87), "city": "City of Hamilton"},
    "london": {"center": (42.98, -81.25), "city": "City of London"},
    "kingston": {"center": (44.23, -76.49), "city": "City of Kingston"},
    "barrie": {"center": (44.39, -79.69), "city": "City of Barrie"},
    "niagara": {"center": (43.06, -79.09), "city": "City of St. Catharines"},
    "sudbury": {"center": (46.49, -81.00), "city": "City of Greater Sudbury"},
    "thunder_bay": {"center": (48.38, -89.25), "city": "City of Thunder Bay"},
}


def _rect(lat, lng, dlat=0.008, dlng=0.01):
    """Return a simple rectangular polygon around a center point."""
    return {
        "type": "Polygon",
        "coordinates": [[
            [lng - dlng, lat - dlat],
            [lng + dlng, lat - dlat],
            [lng + dlng, lat + dlat],
            [lng - dlng, lat + dlat],
            [lng - dlng, lat - dlat],
        ]],
    }


# ── 1. ZONING ───────────────────────────────────────────────────────

def generate_zoning():
    features = []

    zone_defs = [
        # Waterloo Region
        {"zone_code": "C-4", "zone_name": "Mixed Use Commercial", "municipality": "City of Waterloo",
         "max_height_m": 25, "max_density": "high", "permitted_uses": "retail, office, residential above ground floor",
         "lat": 43.466, "lng": -80.520},
        {"zone_code": "R-6", "zone_name": "High Density Residential", "municipality": "City of Waterloo",
         "max_height_m": 40, "max_density": "high", "permitted_uses": "apartments, condominiums, mixed residential",
         "lat": 43.470, "lng": -80.5325},
        {"zone_code": "R-2", "zone_name": "Low Density Residential", "municipality": "City of Waterloo",
         "max_height_m": 11, "max_density": "low", "permitted_uses": "single detached, semi-detached, duplex",
         "lat": 43.457, "lng": -80.550},
        {"zone_code": "I-2", "zone_name": "General Industrial", "municipality": "City of Kitchener",
         "max_height_m": 15, "max_density": "medium", "permitted_uses": "manufacturing, warehouse, research facility",
         "lat": 43.4275, "lng": -80.460},

        # GTA - Toronto
        {"zone_code": "CR", "zone_name": "Commercial Residential", "municipality": "City of Toronto",
         "max_height_m": 80, "max_density": "high", "permitted_uses": "retail, office, residential, mixed-use towers",
         "lat": 43.654, "lng": -79.384},
        {"zone_code": "RA", "zone_name": "Residential Apartment", "municipality": "City of Toronto",
         "max_height_m": 60, "max_density": "high", "permitted_uses": "apartments, condominiums, senior housing",
         "lat": 43.670, "lng": -79.390},
        {"zone_code": "E", "zone_name": "Employment", "municipality": "City of Toronto",
         "max_height_m": 20, "max_density": "medium", "permitted_uses": "manufacturing, warehouse, office, commercial",
         "lat": 43.655, "lng": -79.354},

        # GTA - Mississauga
        {"zone_code": "C4", "zone_name": "Mainstreet Commercial", "municipality": "City of Mississauga",
         "max_height_m": 25, "max_density": "high", "permitted_uses": "retail, restaurant, office, residential above",
         "lat": 43.593, "lng": -79.641},
        {"zone_code": "RA4", "zone_name": "Apartment Residential", "municipality": "City of Mississauga",
         "max_height_m": 77, "max_density": "high", "permitted_uses": "apartments, condominiums, mixed residential",
         "lat": 43.590, "lng": -79.645},

        # GTA - Brampton
        {"zone_code": "HC", "zone_name": "Highway Commercial", "municipality": "City of Brampton",
         "max_height_m": 20, "max_density": "medium", "permitted_uses": "retail, service commercial, office, hotel",
         "lat": 43.685, "lng": -79.760},

        # Ottawa
        {"zone_code": "GM", "zone_name": "General Mixed-Use", "municipality": "City of Ottawa",
         "max_height_m": 65, "max_density": "high", "permitted_uses": "retail, office, residential, community facility",
         "lat": 45.413, "lng": -75.718},
        {"zone_code": "R5B", "zone_name": "Residential Fifth Density Zone B", "municipality": "City of Ottawa",
         "max_height_m": 45, "max_density": "high", "permitted_uses": "apartments, retirement home, mixed residential",
         "lat": 45.405, "lng": -75.695},
        {"zone_code": "IL", "zone_name": "Light Industrial", "municipality": "City of Ottawa",
         "max_height_m": 18, "max_density": "medium", "permitted_uses": "light manufacturing, warehouse, technology park",
         "lat": 45.345, "lng": -75.907},

        # Hamilton
        {"zone_code": "C5", "zone_name": "Downtown Mixed-Use", "municipality": "City of Hamilton",
         "max_height_m": 30, "max_density": "high", "permitted_uses": "retail, office, residential, entertainment",
         "lat": 43.257, "lng": -79.868},
        {"zone_code": "D4", "zone_name": "Medium-High Density Residential", "municipality": "City of Hamilton",
         "max_height_m": 35, "max_density": "high", "permitted_uses": "apartments, townhouses, mixed residential",
         "lat": 43.252, "lng": -79.885},
        {"zone_code": "M5", "zone_name": "Heavy Industrial", "municipality": "City of Hamilton",
         "max_height_m": 20, "max_density": "medium", "permitted_uses": "manufacturing, warehouse, industrial, port-related",
         "lat": 43.272, "lng": -79.822},

        # London
        {"zone_code": "BDC", "zone_name": "Business District Commercial", "municipality": "City of London",
         "max_height_m": 35, "max_density": "high", "permitted_uses": "retail, office, residential, entertainment, mixed-use",
         "lat": 42.983, "lng": -81.253},
        {"zone_code": "R8-4", "zone_name": "High Density Residential", "municipality": "City of London",
         "max_height_m": 40, "max_density": "high", "permitted_uses": "apartments, condominiums, retirement home",
         "lat": 42.990, "lng": -81.270},
        {"zone_code": "LI", "zone_name": "Light Industrial", "municipality": "City of London",
         "max_height_m": 15, "max_density": "medium", "permitted_uses": "manufacturing, warehouse, research, service industry",
         "lat": 42.960, "lng": -81.200},

        # Kingston
        {"zone_code": "C1", "zone_name": "General Commercial", "municipality": "City of Kingston",
         "max_height_m": 22, "max_density": "high", "permitted_uses": "retail, office, residential above, mixed-use",
         "lat": 44.231, "lng": -76.487},
        {"zone_code": "R4", "zone_name": "Residential Four", "municipality": "City of Kingston",
         "max_height_m": 25, "max_density": "high", "permitted_uses": "apartments, townhouses, mixed residential",
         "lat": 44.225, "lng": -76.510},

        # Barrie
        {"zone_code": "C4-A", "zone_name": "Urban Centre Commercial", "municipality": "City of Barrie",
         "max_height_m": 28, "max_density": "high", "permitted_uses": "retail, office, residential, community uses",
         "lat": 44.389, "lng": -79.691},
        {"zone_code": "RM2", "zone_name": "Multiple Residential Two", "municipality": "City of Barrie",
         "max_height_m": 35, "max_density": "high", "permitted_uses": "apartments, condominiums, retirement residence",
         "lat": 44.395, "lng": -79.680},

        # Niagara
        {"zone_code": "GC", "zone_name": "General Commercial", "municipality": "City of St. Catharines",
         "max_height_m": 20, "max_density": "medium", "permitted_uses": "retail, office, residential above, service commercial",
         "lat": 43.160, "lng": -79.240},
        {"zone_code": "R4", "zone_name": "Multiple Residential", "municipality": "City of St. Catharines",
         "max_height_m": 30, "max_density": "high", "permitted_uses": "apartments, townhouses, mixed residential, long-term care",
         "lat": 43.155, "lng": -79.250},
        {"zone_code": "TC", "zone_name": "Tourist Commercial", "municipality": "City of Niagara Falls",
         "max_height_m": 50, "max_density": "high", "permitted_uses": "hotel, entertainment, retail, restaurant, residential",
         "lat": 43.088, "lng": -79.080},

        # Sudbury
        {"zone_code": "C6", "zone_name": "Downtown Commercial", "municipality": "City of Greater Sudbury",
         "max_height_m": 25, "max_density": "medium", "permitted_uses": "retail, office, residential, entertainment, mixed-use",
         "lat": 46.491, "lng": -81.001},
        {"zone_code": "R4", "zone_name": "High Density Residential", "municipality": "City of Greater Sudbury",
         "max_height_m": 20, "max_density": "medium", "permitted_uses": "apartments, condominiums, boarding house",
         "lat": 46.495, "lng": -80.990},
        {"zone_code": "M2", "zone_name": "General Industrial", "municipality": "City of Greater Sudbury",
         "max_height_m": 18, "max_density": "medium", "permitted_uses": "manufacturing, mining supply, warehouse, salvage yard",
         "lat": 46.475, "lng": -80.950},

        # Thunder Bay
        {"zone_code": "CC", "zone_name": "Core Commercial", "municipality": "City of Thunder Bay",
         "max_height_m": 25, "max_density": "medium", "permitted_uses": "retail, office, residential, hotel, entertainment",
         "lat": 48.382, "lng": -89.248},
        {"zone_code": "R3", "zone_name": "Multiple Residential", "municipality": "City of Thunder Bay",
         "max_height_m": 22, "max_density": "medium", "permitted_uses": "apartments, townhouses, converted dwelling",
         "lat": 48.390, "lng": -89.260},
        {"zone_code": "I2", "zone_name": "General Industrial", "municipality": "City of Thunder Bay",
         "max_height_m": 15, "max_density": "medium", "permitted_uses": "manufacturing, warehouse, grain elevator, port facility",
         "lat": 48.410, "lng": -89.220},
    ]

    for z in zone_defs:
        lat, lng = z.pop("lat"), z.pop("lng")
        features.append({
            "type": "Feature",
            "properties": z,
            "geometry": _rect(lat, lng),
        })

    return {"type": "FeatureCollection", "features": features}


# ── 2. FLOOD ZONES ──────────────────────────────────────────────────

def generate_flood_zones():
    features = []
    flood_defs = [
        # Waterloo
        {"name": "Grand River Floodplain - Kitchener", "zone": "Regulatory Floodplain", "risk_level": "high", "authority": "GRCA",
         "lat": 43.44, "lng": -80.48, "dlat": 0.005, "dlng": 0.015},
        {"name": "Laurel Creek Floodplain", "zone": "Regulatory Floodplain", "risk_level": "medium", "authority": "GRCA",
         "lat": 43.475, "lng": -80.545, "dlat": 0.003, "dlng": 0.01},
        # GTA
        {"name": "Don River Floodplain", "zone": "Regulatory Floodplain", "risk_level": "high", "authority": "TRCA",
         "lat": 43.665, "lng": -79.360, "dlat": 0.006, "dlng": 0.008},
        {"name": "Humber River Floodplain", "zone": "Regulatory Floodplain", "risk_level": "high", "authority": "TRCA",
         "lat": 43.660, "lng": -79.490, "dlat": 0.008, "dlng": 0.006},
        {"name": "Credit River Floodplain - Mississauga", "zone": "Regulatory Floodplain", "risk_level": "medium", "authority": "CVC",
         "lat": 43.580, "lng": -79.650, "dlat": 0.005, "dlng": 0.008},
        # Ottawa
        {"name": "Rideau River Floodplain", "zone": "Regulatory Floodplain", "risk_level": "high", "authority": "RVCA",
         "lat": 45.400, "lng": -75.680, "dlat": 0.005, "dlng": 0.008},
        {"name": "Ottawa River Floodplain", "zone": "Two-Zone Floodplain", "risk_level": "high", "authority": "Mississippi Valley CA",
         "lat": 45.440, "lng": -75.720, "dlat": 0.004, "dlng": 0.015},
        # Hamilton
        {"name": "Red Hill Creek Floodplain", "zone": "Regulatory Floodplain", "risk_level": "high", "authority": "HCA",
         "lat": 43.245, "lng": -79.830, "dlat": 0.004, "dlng": 0.010},
        # London
        {"name": "Thames River Floodplain - London", "zone": "Regulatory Floodplain", "risk_level": "high", "authority": "UTRCA",
         "lat": 42.975, "lng": -81.260, "dlat": 0.005, "dlng": 0.012},
        # Kingston
        {"name": "Cataraqui River Floodplain", "zone": "Regulatory Floodplain", "risk_level": "medium", "authority": "CRCA",
         "lat": 44.240, "lng": -76.505, "dlat": 0.004, "dlng": 0.006},
        # Barrie
        {"name": "Kempenfelt Bay Flood Zone", "zone": "Special Policy Area", "risk_level": "high", "authority": "LSRCA",
         "lat": 44.385, "lng": -79.700, "dlat": 0.003, "dlng": 0.008},
        # Niagara
        {"name": "Welland River Floodplain", "zone": "Regulatory Floodplain", "risk_level": "medium", "authority": "NPCA",
         "lat": 43.050, "lng": -79.100, "dlat": 0.004, "dlng": 0.010},
        # Sudbury
        {"name": "Junction Creek Floodplain", "zone": "Regulatory Floodplain", "risk_level": "medium", "authority": "Nickel District CA",
         "lat": 46.490, "lng": -81.010, "dlat": 0.003, "dlng": 0.008},
        # Thunder Bay
        {"name": "Neebing River Floodplain", "zone": "Regulatory Floodplain", "risk_level": "medium", "authority": "Lakehead Region CA",
         "lat": 48.370, "lng": -89.265, "dlat": 0.003, "dlng": 0.008},
    ]

    for f in flood_defs:
        lat, lng = f.pop("lat"), f.pop("lng")
        dlat, dlng = f.pop("dlat", 0.005), f.pop("dlng", 0.010)
        features.append({
            "type": "Feature",
            "properties": f,
            "geometry": _rect(lat, lng, dlat, dlng),
        })

    return {"type": "FeatureCollection", "features": features}


# ── 3. CONTAMINATED SITES ───────────────────────────────────────────

def generate_contaminated_sites():
    features = []
    site_defs = [
        # Waterloo
        {"name": "Former Industrial Facility - King St", "classification": "Class 2 - Action Required", "contaminants": "Petroleum hydrocarbons, metals", "status": "Assessment ongoing", "federal_id": "ON-0342", "lat": 43.451, "lng": -80.492},
        {"name": "Former Gas Station - Weber St", "classification": "Class 2 - Action Required", "contaminants": "BTEX, petroleum hydrocarbons", "status": "Remediation in progress", "federal_id": "ON-0587", "lat": 43.463, "lng": -80.496},
        {"name": "Legacy Landfill Site - Bridgeport", "classification": "Class 1 - High Priority", "contaminants": "Mixed waste, leachate, methane", "status": "Monitored", "federal_id": "ON-0128", "lat": 43.48, "lng": -80.475},
        # GTA
        {"name": "Port Lands Industrial Area", "classification": "Class 1 - High Priority", "contaminants": "Petroleum, PAHs, heavy metals, coal tar", "status": "Major remediation underway (Villiers Island)", "federal_id": "ON-1201", "lat": 43.643, "lng": -79.351},
        {"name": "Former Unilever Soap Factory - East Harbour", "classification": "Class 2 - Action Required", "contaminants": "Petroleum hydrocarbons, VOCs, metals", "status": "Phase 2 ESA complete", "federal_id": "ON-1305", "lat": 43.654, "lng": -79.342},
        {"name": "Downsview Former Military Base", "classification": "Class 2 - Action Required", "contaminants": "Aviation fuel, PFAS, solvents", "status": "Risk assessment phase", "federal_id": "ON-0890", "lat": 43.742, "lng": -79.479},
        {"name": "Lakeview Generating Station Site - Mississauga", "classification": "Class 2 - Action Required", "contaminants": "Coal ash, heavy metals, petroleum", "status": "Remediation in progress", "federal_id": "ON-1422", "lat": 43.582, "lng": -79.600},
        # Ottawa
        {"name": "LeBreton Flats Former Rail Yard", "classification": "Class 2 - Action Required", "contaminants": "Creosote, PAHs, heavy metals", "status": "Remediation complete - monitoring", "federal_id": "ON-0755", "lat": 45.413, "lng": -75.721},
        {"name": "Former CFB Rockcliffe", "classification": "Class 2 - Action Required", "contaminants": "Aviation fuel, lubricants, PFAS", "status": "Monitored", "federal_id": "ON-0812", "lat": 45.455, "lng": -75.643},
        # Hamilton
        {"name": "Hamilton Waterfront Industrial Corridor", "classification": "Class 1 - High Priority", "contaminants": "Steel slag, heavy metals, coke oven emissions, PAHs", "status": "Ongoing monitoring", "federal_id": "ON-0201", "lat": 43.272, "lng": -79.825},
        {"name": "Randle Reef Contaminated Sediment", "classification": "Class 1 - High Priority", "contaminants": "PAHs, coal tar, heavy metals", "status": "Remediation in progress (containment)", "federal_id": "ON-0145", "lat": 43.270, "lng": -79.840},
        # London
        {"name": "Former Kellogg Plant - Dundas St", "classification": "Class 3 - Low Priority", "contaminants": "Petroleum, solvents", "status": "Remediation complete", "federal_id": "ON-0932", "lat": 42.985, "lng": -81.235},
        {"name": "McCormick Factory Brownfield", "classification": "Class 2 - Action Required", "contaminants": "Metals, industrial solvents", "status": "Redevelopment assessment", "federal_id": "ON-0988", "lat": 42.975, "lng": -81.248},
        # Kingston
        {"name": "Former Davis Tannery", "classification": "Class 2 - Action Required", "contaminants": "Chromium, tanning chemicals, metals", "status": "Environmental assessment", "federal_id": "ON-0643", "lat": 44.233, "lng": -76.480},
        # Barrie
        {"name": "Former Molson Brewery Site", "classification": "Class 3 - Low Priority", "contaminants": "Petroleum hydrocarbons", "status": "Remediation complete", "federal_id": "ON-1100", "lat": 44.391, "lng": -79.688},
        # Niagara
        {"name": "Former Cyanamid Chemical Plant - Welland", "classification": "Class 1 - High Priority", "contaminants": "Cyanide, arsenic, heavy metals, radioactive waste", "status": "Long-term monitoring", "federal_id": "ON-0310", "lat": 43.008, "lng": -79.232},
        # Sudbury
        {"name": "Coniston Smelter Site", "classification": "Class 2 - Action Required", "contaminants": "Nickel, copper, arsenic, sulphur dioxide residuals", "status": "Soil remediation ongoing", "federal_id": "ON-0502", "lat": 46.480, "lng": -80.855},
        {"name": "Copper Cliff Tailings Area", "classification": "Class 1 - High Priority", "contaminants": "Heavy metals, acid mine drainage", "status": "Monitored - regreening program", "federal_id": "ON-0205", "lat": 46.470, "lng": -81.055},
        # Thunder Bay
        {"name": "Former Great Lakes Paper Mill", "classification": "Class 2 - Action Required", "contaminants": "Dioxins, furans, bleaching chemicals", "status": "Phase 2 ESA underway", "federal_id": "ON-0678", "lat": 48.415, "lng": -89.215},
        {"name": "Thunder Bay Harbour Sediment", "classification": "Class 2 - Action Required", "contaminants": "Mercury, PAHs, wood fibre", "status": "Monitored", "federal_id": "ON-0692", "lat": 48.405, "lng": -89.210},
    ]

    for s in site_defs:
        lat, lng = s.pop("lat"), s.pop("lng")
        features.append({
            "type": "Feature",
            "properties": s,
            "geometry": {"type": "Point", "coordinates": [lng, lat]},
        })

    return {"type": "FeatureCollection", "features": features}


# ── 4. PROTECTED AREAS ──────────────────────────────────────────────

def generate_protected_areas():
    features = []
    area_defs = [
        # Waterloo
        {"name": "Laurel Creek Conservation Area", "type": "Conservation Area", "designation": "Environmentally Sensitive Landscape", "authority": "GRCA", "restrictions": "No development within 30m buffer",
         "lat": 43.480, "lng": -80.560, "dlat": 0.005, "dlng": 0.008},
        {"name": "Doon Heritage Crossroads ESA", "type": "Environmentally Sensitive Area", "designation": "ESA - Regional", "authority": "Region of Waterloo", "restrictions": "EIS required for adjacent development",
         "lat": 43.410, "lng": -80.480, "dlat": 0.004, "dlng": 0.006},
        # GTA
        {"name": "Rouge National Urban Park", "type": "National Park", "designation": "National Park of Canada", "authority": "Parks Canada", "restrictions": "No development permitted; 300m buffer zone",
         "lat": 43.810, "lng": -79.180, "dlat": 0.020, "dlng": 0.025},
        {"name": "Don Valley Ravine System", "type": "Natural Heritage System", "designation": "Environmentally Significant Area", "authority": "TRCA / City of Toronto", "restrictions": "No development; 10m setback from top of bank",
         "lat": 43.680, "lng": -79.365, "dlat": 0.010, "dlng": 0.005},
        {"name": "Rattray Marsh Conservation Area", "type": "Conservation Area", "designation": "Provincially Significant Wetland", "authority": "CVC / City of Mississauga", "restrictions": "120m buffer from PSW boundary",
         "lat": 43.540, "lng": -79.640, "dlat": 0.004, "dlng": 0.008},
        # Ottawa
        {"name": "Mer Bleue Bog", "type": "Conservation Area", "designation": "Provincially Significant Wetland / Ramsar Site", "authority": "NCC / City of Ottawa", "restrictions": "Internationally protected; no development within 120m",
         "lat": 45.395, "lng": -75.510, "dlat": 0.008, "dlng": 0.015},
        {"name": "South March Highlands", "type": "Natural Heritage System", "designation": "Blanding's Turtle Habitat / ESA", "authority": "City of Ottawa / MECP", "restrictions": "Species at Risk habitat; EIS required",
         "lat": 45.345, "lng": -75.890, "dlat": 0.005, "dlng": 0.008},
        # Hamilton
        {"name": "Cootes Paradise Nature Sanctuary", "type": "Wildlife Sanctuary", "designation": "Provincially Significant Wetland / Ramsar", "authority": "RBG / HCA", "restrictions": "No development within 30m; EIS required within 120m",
         "lat": 43.280, "lng": -79.915, "dlat": 0.005, "dlng": 0.010},
        {"name": "Dundas Valley Conservation Area", "type": "Conservation Area", "designation": "Carolinian Canada site / ESA", "authority": "HCA", "restrictions": "Limited access; ecological restoration zone",
         "lat": 43.240, "lng": -79.950, "dlat": 0.006, "dlng": 0.010},
        # London
        {"name": "Westminster Ponds / Pond Mills ESA", "type": "Environmentally Significant Area", "designation": "ESA - Municipal", "authority": "City of London / UTRCA", "restrictions": "EIS required; 50m setback",
         "lat": 42.950, "lng": -81.240, "dlat": 0.004, "dlng": 0.006},
        # Kingston
        {"name": "Lemoine Point Conservation Area", "type": "Conservation Area", "designation": "ANSI / ESA", "authority": "CRCA / City of Kingston", "restrictions": "No development; shoreline protection",
         "lat": 44.220, "lng": -76.560, "dlat": 0.003, "dlng": 0.006},
        # Barrie
        {"name": "Minesing Wetlands", "type": "Provincial Wetland", "designation": "Provincially Significant Wetland / Ramsar", "authority": "NVCA", "restrictions": "No development within 120m; LSPP applies",
         "lat": 44.420, "lng": -79.770, "dlat": 0.010, "dlng": 0.015},
        # Niagara
        {"name": "Short Hills Provincial Park", "type": "Provincial Park", "designation": "Provincial Park / Natural Heritage", "authority": "Ontario Parks / NPCA", "restrictions": "No development; ecological preserve",
         "lat": 43.080, "lng": -79.190, "dlat": 0.006, "dlng": 0.010},
        # Sudbury
        {"name": "Lake Laurentian Conservation Area", "type": "Conservation Area", "designation": "ESA - Municipal", "authority": "City of Greater Sudbury", "restrictions": "Ecological restoration; limited buffer development",
         "lat": 46.460, "lng": -80.985, "dlat": 0.005, "dlng": 0.008},
        # Thunder Bay
        {"name": "Sleeping Giant Provincial Park", "type": "Provincial Park", "designation": "Provincial Park / Natural Heritage", "authority": "Ontario Parks", "restrictions": "No development; Class 1 protected area",
         "lat": 48.380, "lng": -88.830, "dlat": 0.020, "dlng": 0.020},
    ]

    for a in area_defs:
        lat, lng = a.pop("lat"), a.pop("lng")
        dlat, dlng = a.pop("dlat", 0.005), a.pop("dlng", 0.008)
        features.append({
            "type": "Feature",
            "properties": a,
            "geometry": _rect(lat, lng, dlat, dlng),
        })

    return {"type": "FeatureCollection", "features": features}


# ── Main ─────────────────────────────────────────────────────────────

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    datasets = {
        "zoning.geojson": generate_zoning,
        "flood_zones.geojson": generate_flood_zones,
        "contaminated_sites.geojson": generate_contaminated_sites,
        "protected_areas.geojson": generate_protected_areas,
    }

    for filename, generator in datasets.items():
        data = generator()
        path = OUT_DIR / filename
        with open(path, "w") as f:
            json.dump(data, f)
        print(f"  {filename}: {len(data['features'])} features ({path.stat().st_size / 1024:.1f} KB)")

    print("\nDone! Greenbelt and indigenous treaties kept as-is.")


if __name__ == "__main__":
    main()
