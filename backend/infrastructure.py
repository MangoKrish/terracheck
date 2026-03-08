"""Infrastructure detection via Overpass API (OpenStreetMap).

Queries for nearby universities, hospitals, and government offices
which are considered critical blockers for new development.
"""
import httpx
from typing import Any

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Infrastructure types that block new development
BLOCKER_AMENITIES = {
    "university": "University / College",
    "college": "College",
    "hospital": "Hospital",
}

BLOCKER_OFFICES = {
    "government": "Government Office",
}


async def query_nearby_infrastructure(
    lat: float, lng: float, radius_m: int = 1000
) -> dict[str, Any]:
    """Query Overpass API for major infrastructure near a point.

    Args:
        lat: Latitude (WGS84)
        lng: Longitude (WGS84)
        radius_m: Search radius in meters (default 1000m = 1km)

    Returns:
        Dict with found infrastructure categorized by type.
    """
    amenity_filter = "|".join(BLOCKER_AMENITIES.keys())
    office_filter = "|".join(BLOCKER_OFFICES.keys())

    query = f"""
    [out:json][timeout:10];
    (
      nwr["amenity"~"^({amenity_filter})$"](around:{radius_m},{lat},{lng});
      nwr["office"~"^({office_filter})$"](around:{radius_m},{lat},{lng});
    );
    out center tags;
    """

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(OVERPASS_URL, data={"data": query})
            resp.raise_for_status()
            data = resp.json()
    except Exception as e:
        print(f"Overpass API error: {e}")
        return {"found": False, "count": 0, "radius_m": radius_m, "infrastructure": [], "error": str(e)}

    infrastructure = []
    seen_names: set[str] = set()

    for element in data.get("elements", []):
        tags = element.get("tags", {})
        name = tags.get("name", "Unknown")
        amenity = tags.get("amenity", "")
        office = tags.get("office", "")

        label = BLOCKER_AMENITIES.get(amenity) or BLOCKER_OFFICES.get(office)
        if not label:
            continue

        # Deduplicate by name (OSM can have node + way for same place)
        if name in seen_names and name != "Unknown":
            continue
        seen_names.add(name)

        # Get coordinates (center for ways/relations, direct for nodes)
        center = element.get("center", {})
        elat = center.get("lat") or element.get("lat")
        elng = center.get("lon") or element.get("lon")

        infrastructure.append({
            "name": name,
            "type": amenity or office,
            "label": label,
            "severity": "critical",
            "lat": elat,
            "lng": elng,
        })

    return {
        "found": len(infrastructure) > 0,
        "count": len(infrastructure),
        "radius_m": radius_m,
        "infrastructure": infrastructure,
    }


async def filter_zones_by_infrastructure(
    candidates: list[dict], radius_m: int = 500
) -> list[dict]:
    """Add infrastructure blocking issues to candidate zones for recommendations."""
    for candidate in candidates:
        infra = await query_nearby_infrastructure(
            candidate["lat"], candidate["lng"], radius_m=radius_m
        )
        if infra.get("found"):
            names = [f"{i['label']}: {i['name']}" for i in infra["infrastructure"]]
            candidate.setdefault("blocking_issues", []).append({
                "layer": "infrastructure",
                "label": "Existing Major Infrastructure",
                "severity": "critical",
                "count": infra["count"],
                "details": names,
            })
    return candidates
