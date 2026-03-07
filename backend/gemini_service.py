"""Gemini API integration for land viability analysis."""
import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

MODEL = "gemini-2.0-flash"

# Lazy client — only created when an API key is available
_client = None


def _get_client():
    """Return the Gemini client, creating it lazily. Returns None if no API key."""
    global _client
    if _client is not None:
        return _client
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key in ("", "your-gemini-api-key"):
        return None
    try:
        _client = genai.Client(api_key=api_key)
        return _client
    except Exception as e:
        print(f"Failed to initialize Gemini client: {e}")
        return None

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

    client = _get_client()
    if client is None:
        print("Gemini API key not configured — using fallback assessment.")
        return _fallback_response("Gemini API key not configured")

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


RECOMMEND_SYSTEM_PROMPT = """You are a Canadian land development site selection expert specializing in Ontario. Given project requirements and candidate zones with geospatial data, rank them, score feasibility 0-100, cite Ontario/Canadian laws and incentives, outline the regulatory process, and estimate timelines.

Key programs and regulations to consider:
- Ontario Housing Supply Action Plan (Bill 23)
- CMHC Rapid Housing Initiative / Housing Accelerator Fund
- Development Charges Act exemptions for affordable housing
- Community Improvement Plans (CIPs)
- Ontario Building Code, Planning Act (S.34 zoning, S.51 subdivision)
- Environmental Assessment Act, Greenbelt Act 2005
- Provincial Policy Statement on land use

Score: 80-100 highly viable, 60-79 viable with conditions, 40-59 challenging, 0-39 not recommended.

You MUST respond with valid JSON only. No markdown, no extra text:
{
  "recommendations": [
    {
      "rank": <1-based>,
      "location_name": "<descriptive name>",
      "lat": <latitude>,
      "lng": <longitude>,
      "score": <0-100>,
      "rationale": "<2-3 sentences>",
      "applicable_laws": [{"law": "<name>", "relevance": "<how>", "impact": "<positive|neutral|negative>"}],
      "incentives": [{"name": "<program>", "description": "<brief>", "estimated_value": "<$>"}],
      "regulatory_process": [{"step": "<desc>", "timeline": "<time>", "agency": "<agency>"}],
      "estimated_timeline": "<total>",
      "risks": ["<risk>"],
      "zoning_details": {"current_zoning": "<code+name>", "rezoning_required": <bool>, "rezoning_difficulty": "<easy|moderate|difficult>"}
    }
  ],
  "overall_summary": "<2-3 sentences>",
  "key_considerations": ["<item>"]
}"""


def _fallback_recommendations(project_requirements: dict) -> dict:
    """Return sample recommendations when Gemini API is unavailable."""
    ptype = project_requirements.get("project_type", "affordable_housing").replace("_", " ")
    return {
        "recommendations": [
            {
                "rank": 1,
                "location_name": "King Street Mixed-Use Corridor, Waterloo",
                "lat": 43.466,
                "lng": -80.520,
                "score": 82,
                "rationale": f"This C-4 mixed-use zone is well-suited for {ptype} development. High-density zoning is already in place, transit access is excellent along the ION LRT corridor, and the City of Waterloo has active Community Improvement Plans offering incentives.",
                "applicable_laws": [
                    {"law": "Planning Act, Section 34", "relevance": "Zoning already permits high-density mixed-use", "impact": "positive"},
                    {"law": "Ontario Building Code", "relevance": "Standard compliance required", "impact": "neutral"},
                    {"law": "Development Charges Act", "relevance": "Potential exemptions for affordable housing", "impact": "positive"},
                ],
                "incentives": [
                    {"name": "CMHC Housing Accelerator Fund", "description": "Federal funding for municipalities that fast-track housing", "estimated_value": "$5M-$15M"},
                    {"name": "Waterloo Region CIP", "description": "Tax increment grants and DC deferrals in intensification areas", "estimated_value": "Up to 100% DC increase"},
                    {"name": "Bill 23 Fee Exemptions", "description": "Reduced development charges for affordable housing", "estimated_value": "Up to 100% DC exemption"},
                ],
                "regulatory_process": [
                    {"step": "Pre-consultation with City Planning", "timeline": "2-4 weeks", "agency": "City of Waterloo Planning"},
                    {"step": "Site Plan Application", "timeline": "3-6 months", "agency": "City of Waterloo"},
                    {"step": "Building Permit Application", "timeline": "4-8 weeks", "agency": "City of Waterloo Building Division"},
                ],
                "estimated_timeline": "8-14 months",
                "risks": ["Market competition in downtown core", "Potential heritage review"],
                "zoning_details": {"current_zoning": "C-4 Mixed Use Commercial", "rezoning_required": False, "rezoning_difficulty": "easy"},
            },
            {
                "rank": 2,
                "location_name": "University District, Waterloo",
                "lat": 43.470,
                "lng": -80.5325,
                "score": 75,
                "rationale": f"R-6 high-density residential zone near the University of Waterloo offers strong demand for {ptype}. Supports apartments and condos up to 40m height.",
                "applicable_laws": [
                    {"law": "Planning Act, Section 34", "relevance": "R-6 zoning permits high-density residential", "impact": "positive"},
                    {"law": "AODA", "relevance": "New builds must meet accessibility requirements", "impact": "neutral"},
                ],
                "incentives": [
                    {"name": "CMHC Rapid Housing Initiative", "description": "Capital contributions for affordable housing", "estimated_value": "$10M-$25M"},
                    {"name": "Ontario Priorities Housing Initiative", "description": "Provincial funding for community housing", "estimated_value": "Varies"},
                ],
                "regulatory_process": [
                    {"step": "Pre-consultation", "timeline": "2-4 weeks", "agency": "City of Waterloo Planning"},
                    {"step": "Site Plan Approval", "timeline": "4-6 months", "agency": "City of Waterloo"},
                    {"step": "Building Permit", "timeline": "4-8 weeks", "agency": "Building Division"},
                ],
                "estimated_timeline": "10-16 months",
                "risks": ["Student housing competition", "Parking requirements"],
                "zoning_details": {"current_zoning": "R-6 High Density Residential", "rezoning_required": False, "rezoning_difficulty": "easy"},
            },
            {
                "rank": 3,
                "location_name": "Kitchener Industrial Innovation Park",
                "lat": 43.4275,
                "lng": -80.460,
                "score": 58,
                "rationale": f"I-2 General Industrial zone could work for {ptype} with rezoning. Well-connected to Highway 401 with room for large-scale development, but requires zoning bylaw amendment.",
                "applicable_laws": [
                    {"law": "Planning Act, Section 34", "relevance": "Rezoning from I-2 required", "impact": "negative"},
                    {"law": "Environmental Protection Act", "relevance": "Phase 2 ESA likely required", "impact": "negative"},
                    {"law": "Provincial Policy Statement", "relevance": "Supports intensification of underutilized lands", "impact": "positive"},
                ],
                "incentives": [
                    {"name": "Kitchener Brownfield CIP", "description": "Tax assistance and grants for brownfield redevelopment", "estimated_value": "Up to $500K grants + TIF"},
                ],
                "regulatory_process": [
                    {"step": "Zoning Bylaw Amendment", "timeline": "6-12 months", "agency": "City of Kitchener Planning"},
                    {"step": "Environmental Site Assessment", "timeline": "3-4 months", "agency": "Ministry of Environment"},
                    {"step": "Site Plan Approval", "timeline": "3-6 months", "agency": "City of Kitchener"},
                ],
                "estimated_timeline": "18-26 months",
                "risks": ["Soil contamination costs", "Community opposition to rezoning"],
                "zoning_details": {"current_zoning": "I-2 General Industrial", "rezoning_required": True, "rezoning_difficulty": "moderate"},
            },
        ],
        "overall_summary": f"Found 3 candidate zones in Waterloo Region for {ptype}. The King Street corridor offers the best balance of zoning, transit access, and incentives. Connect Gemini API for live AI-powered analysis.",
        "key_considerations": [
            "Bill 23 reduces barriers for residential development in Ontario",
            "Waterloo Region has active Community Improvement Plans in intensification areas",
            "Federal CMHC programs provide significant funding for affordable housing",
        ],
    }


async def recommend_locations(
    project_requirements: dict,
    candidate_zones: list[dict],
) -> dict:
    """Send project requirements and candidate zones to Gemini for ranking."""
    if not candidate_zones:
        return _fallback_recommendations(project_requirements)

    user_prompt = f"""Analyze these candidate locations for a development project in Ontario, Canada:

PROJECT REQUIREMENTS:
- Organization: {project_requirements.get('org_type', 'private')}
- Project Type: {project_requirements.get('project_type', 'affordable_housing')}
- Scale: {project_requirements.get('scale', 'medium')}
- Budget: {project_requirements.get('budget', '5_to_20m')}
- Priority: {project_requirements.get('priority', 'cost')}
- Region: {project_requirements.get('region', 'waterloo')}
- Additional: {project_requirements.get('additional_requirements', 'None')}

CANDIDATE ZONES ({len(candidate_zones)} found):
{json.dumps(candidate_zones, indent=2, default=str)}

Rank the top {min(5, len(candidate_zones))} zones and return recommendations as JSON."""

    client = _get_client()
    if client is None:
        print("Gemini API key not configured — using fallback recommendations.")
        return _fallback_recommendations(project_requirements)

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=user_prompt,
            config={
                "system_instruction": RECOMMEND_SYSTEM_PROMPT,
                "temperature": 0.3,
            },
        )
        return _parse_response(response.text)
    except Exception as e:
        print(f"Gemini API error (recommend): {e}")
        return _fallback_recommendations(project_requirements)


async def followup_question(assessment: dict, question: str) -> str:
    """Ask a follow-up question about an existing assessment."""
    prompt = f"""Here is an existing land viability assessment:

{json.dumps(assessment, indent=2, default=str)}

The user asks: "{question}"

Provide a helpful, specific answer grounded in Canadian environmental and planning regulations. Be practical and concise."""

    client = _get_client()
    if client is None:
        return "Gemini API key not configured. Please add your API key to the .env file to enable AI-powered follow-up questions."

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
