"""Gemini API integration for land viability analysis."""
import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODEL = "gemini-2.0-flash"

SYSTEM_PROMPT = """You are a Canadian environmental and land-use assessment expert. You help government planners, developers, and environmental consultants evaluate whether a specific piece of land is viable for development.

Given geospatial data about a specific location (latitude/longitude in Ontario, Canada), analyze it against:
- Federal regulations: Impact Assessment Act, Species at Risk Act, Canadian Environmental Protection Act, Fisheries Act
- Provincial regulations: Ontario Environmental Assessment Act, Greenbelt Act 2005, Planning Act, Endangered Species Act 2007, Clean Water Act
- Municipal requirements: Official Plans, zoning bylaws, site plan control

You MUST respond with valid JSON only. No markdown, no extra text. Use this exact structure:

{
  "overall_score": <number 0-100, where 100 is fully viable>,
  "overall_status": "<one of: viable, viable_with_conditions, challenging, not_viable>",
  "summary": "<2-3 sentence plain language summary of the assessment>",
  "critical_blockers": [
    {"title": "<short title>", "description": "<explanation>", "regulation": "<applicable law/regulation>"}
  ],
  "warnings": [
    {"title": "<short title>", "description": "<explanation>", "regulation": "<applicable law/regulation>"}
  ],
  "green_flags": [
    {"title": "<short title>", "description": "<explanation>"}
  ],
  "regulatory_pathway": [
    {"step": "<step description>", "timeline": "<estimated time>", "agency": "<responsible agency>"}
  ],
  "mitigations": [
    {"issue": "<what issue this addresses>", "action": "<recommended action>", "cost_estimate": "<rough cost range or 'TBD'>"}
  ],
  "estimated_timeline": "<overall estimated timeline for approvals>",
  "categories": {
    "flood_risk": {"status": "<clear|warning|critical>", "summary": "<one line>"},
    "zoning": {"status": "<clear|warning|critical>", "summary": "<one line>"},
    "protected_areas": {"status": "<clear|warning|critical>", "summary": "<one line>"},
    "contamination": {"status": "<clear|warning|critical>", "summary": "<one line>"},
    "indigenous_lands": {"status": "<clear|warning|critical>", "summary": "<one line>"},
    "greenbelt": {"status": "<clear|warning|critical>", "summary": "<one line>"}
  }
}

Be specific, practical, and grounded in actual Canadian regulatory frameworks. If no data layers intersect, that's a positive signal — reflect it in the score. If critical blockers like Greenbelt overlap exist, the score should be very low (under 20)."""


def _parse_response(text: str) -> dict:
    """Parse Gemini response, stripping markdown fences if present."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return _fallback_response(text)


def _fallback_response(raw: str = "") -> dict:
    """Return a safe fallback response when parsing fails or API errors."""
    return {
        "overall_score": 50,
        "overall_status": "unknown",
        "summary": "Unable to complete AI analysis. The geospatial data is available for manual review.",
        "raw_response": raw if raw else None,
        "categories": {
            "flood_risk": {"status": "warning", "summary": "Analysis unavailable"},
            "zoning": {"status": "warning", "summary": "Analysis unavailable"},
            "protected_areas": {"status": "warning", "summary": "Analysis unavailable"},
            "contamination": {"status": "warning", "summary": "Analysis unavailable"},
            "indigenous_lands": {"status": "warning", "summary": "Analysis unavailable"},
            "greenbelt": {"status": "warning", "summary": "Analysis unavailable"},
        },
        "critical_blockers": [],
        "warnings": [],
        "green_flags": [],
        "regulatory_pathway": [],
        "mitigations": [],
        "estimated_timeline": "Unknown",
    }


async def analyze_location(geo_data: dict) -> dict:
    """Send geospatial intersection data to Gemini and get a structured assessment."""
    user_prompt = f"""Analyze this location for land development viability:

Location: {geo_data['lat']}°N, {abs(geo_data['lng'])}°W
Search radius: {geo_data['radius_km']} km
Data layers queried: {geo_data['layers_queried']}
Layers with intersecting features: {geo_data['layers_intersecting']}

Geospatial intersection results:
{json.dumps(geo_data['results'], indent=2, default=str)}

Based on this data, provide your structured viability assessment as JSON."""

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=user_prompt,
            config={
                "system_instruction": SYSTEM_PROMPT,
                "temperature": 0.2,
            },
        )
        return _parse_response(response.text)
    except Exception as e:
        print(f"Gemini API error: {e}")
        return _fallback_response(str(e))


async def followup_question(assessment: dict, question: str) -> str:
    """Ask a follow-up question about an existing assessment."""
    prompt = f"""Here is an existing land viability assessment:

{json.dumps(assessment, indent=2, default=str)}

The user asks: "{question}"

Provide a helpful, specific answer grounded in Canadian environmental and planning regulations. Be practical and concise."""

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config={
                "system_instruction": SYSTEM_PROMPT,
                "temperature": 0.3,
            },
        )
        return response.text
    except Exception as e:
        return f"Unable to process follow-up question: {e}"
