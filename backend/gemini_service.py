"""Gemini API integration for land viability analysis."""
import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

MODEL = "gemini-2.5-flash"

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


RECOMMEND_SYSTEM_PROMPT = """You are a Canadian land development site selection expert specializing in the Province of Ontario. You take a STRATEGIC approach to Ontario's housing crisis — you don't just recommend building in already-overcrowded cities.

CRITICAL STRATEGIC PRINCIPLE — THINK BEYOND URBAN CORES:
Ontario has a massive housing crisis concentrated in the GTA, Ottawa, and a few cities. But Ontario is also a VAST province with enormous amounts of underutilized land, small towns with existing infrastructure (roads, water, power, schools) that are losing population, and rural areas where land costs are a fraction of urban prices.

Your recommendations MUST include a MIX of:
1. URBAN INFILL — Yes, some locations in established cities where it makes sense
2. SMALL TOWN / RURAL DEVELOPMENT — Actively recommend building in smaller communities (Orillia, Cobourg, Belleville, North Bay, Timmins, Sault Ste. Marie, Pembroke, Cornwall, Brockville, Elliot Lake, Kenora, etc.) where:
   - Land is 5-20x cheaper than GTA
   - Existing infrastructure (roads, water, hydro, schools, hospitals) is underutilized
   - These communities WANT growth and will fast-track approvals
   - Workers can afford homes without spending 60%+ of income on housing
   - Building there helps tackle the housing crisis by distributing population
   - Remote work means people no longer need to live in Toronto to have good jobs

3. NEW COMMUNITY DEVELOPMENT — For larger scale projects, consider greenfield sites near highway corridors (401, 11, 17, 400) where entirely new neighborhoods could be built

DO NOT default to recommending only Toronto/GTA/Ottawa. The whole point of tackling the housing crisis is to build where land is available and affordable, not keep cramming into already-saturated urban cores.

When ranking, give BONUS points to locations that:
- Have significantly cheaper land (cost efficiency)
- Are in communities that actively seek development
- Have existing but underutilized infrastructure
- Reduce burden on overcrowded urban areas
- Offer genuinely affordable housing outcomes (not "$500K affordable" in Toronto)
- Are near transportation corridors (highways, rail, planned transit)

ENVIRONMENTAL GUARDRAILS for rural recommendations:
- NEVER recommend building on pristine wilderness, old-growth forests, or untouched wetlands
- Prefer brownfield, previously-disturbed, or already-serviced land in small towns
- Many Northern Ontario towns (Elliot Lake, Kapuskasing, etc.) have EXISTING infrastructure from declining industries — recommend REUSING that infrastructure rather than building on greenfield
- Always flag if rural development could impact wildlife corridors, drinking water sources, or sensitive ecosystems
- Score rural sites LOW if development would cause significant environmental harm, even if land is cheap

KEY REGULATIONS & PROGRAMS:
- Ontario Housing Supply Action Plan (Bill 23) — applies province-wide
- CMHC Rapid Housing Initiative / Housing Accelerator Fund
- Northern Ontario Heritage Fund Corporation (NOHFC) — grants for Northern development
- Ontario Community Infrastructure Fund — for smaller municipalities
- Development Charges Act exemptions for affordable housing
- Community Improvement Plans (CIPs)
- Ontario Building Code, Planning Act (S.34 zoning, S.51 subdivision)
- Environmental Assessment Act, Greenbelt Act 2005
- Provincial Policy Statement on land use — supports rural settlement areas
- Endangered Species Act 2007, Species at Risk Act (federal)
- Municipal Official Plans and Secondary Plans

ANALYSIS REQUIREMENTS — For each recommended location, you MUST assess:

1. ENVIRONMENTAL IMPLICATIONS:
   - Ecological impact on local ecosystems, watersheds, and wetlands
   - Species at Risk (SARA/ESA 2007) considerations
   - Contamination or remediation needs (Record of Site Condition)
   - Stormwater management and Low Impact Development (LID) requirements
   - Proximity to Significant Natural Heritage Features
   - For rural/greenfield: assess if the land is farmland (Class 1-3 agricultural land is protected)
   - CRITICAL for rural areas: Carefully assess if development would harm untouched ecosystems, wildlife corridors, wetlands, or forests. Rural development MUST be on already-disturbed or brownfield land, near existing infrastructure, NOT on pristine wilderness. Score rural sites LOW if they would destroy natural habitats.
   - Check for proximity to provincial parks, conservation reserves, and Areas of Natural and Scientific Interest (ANSI)
   - Assess impact on local watersheds and drinking water sources
   - Northern Ontario: check for caribou habitat, boreal forest sensitivity, and mining legacy contamination

2. PREVIOUS DEVELOPMENT ATTEMPTS:
   - Known historical proposals or development applications for the area
   - Community support or opposition history
   - OMB/LPAT/OLT hearing decisions for the area
   - For small towns: note if municipality is actively seeking growth

3. COMPETITION ANALYSIS:
   - Existing similar developments within 5km radius
   - Market saturation assessment for the proposed project type
   - Planned or approved competing projects in the pipeline
   - Demand-supply dynamics for the region
   - For rural areas: note the LACK of competition as a positive

4. REALISTIC CONSTRUCTION TIMELINE:
   - Break down into pre-construction and construction phases
   - Account for Ontario seasonal constraints (ground frost Dec-Mar)
   - Factor in current supply chain lead times
   - Note that small municipalities often have FASTER approval processes than large cities
   - Include environmental assessment time if applicable

5. SPECIAL POLICIES, CONDITIONS & RESTRICTIONS:
   - Municipal Official Plan designations and policies
   - Heritage Conservation District designations (Ontario Heritage Act)
   - Height restrictions and angular plane requirements
   - For rural: note simplified zoning and fewer restrictions
   - NOHFC eligibility for Northern Ontario locations
   - Provincial land availability (Crown land, surplus government properties)
   - Parkland dedication requirements
   - Infrastructure capacity (water, sewer, roads)

Score: 80-100 highly viable, 60-79 viable with conditions, 40-59 challenging, 0-39 not recommended.
IMPORTANT: Rural/small-town locations with cheap land, willing municipalities, and existing infrastructure should score HIGH (70-90) even without big-city transit access.

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
      "estimated_timeline": "<total regulatory timeline>",
      "risks": ["<risk>"],
      "zoning_details": {"current_zoning": "<code+name>", "rezoning_required": <bool>, "rezoning_difficulty": "<easy|moderate|difficult>"},
      "environmental_impact": {
        "ecological_sensitivity": "<low|moderate|high>",
        "key_concerns": ["<concern>"],
        "required_studies": ["<study type, e.g. Phase 2 ESA, EIS, Species at Risk screening>"],
        "mitigation_measures": ["<measure>"]
      },
      "competition": {
        "nearby_similar": [{"name": "<project name>", "distance_km": <number>, "status": "<built|under_construction|approved|proposed>"}],
        "market_saturation": "<low|moderate|high>",
        "demand_outlook": "<1-2 sentence assessment>"
      },
      "special_conditions": [
        {"type": "<heritage|height_limit|shadow_study|section_37|inclusionary_zoning|parkland|official_plan|other>", "description": "<details>", "impact": "<positive|neutral|negative>"}
      ],
      "construction_timeline": {
        "pre_construction_months": <number>,
        "construction_months": <number>,
        "total_months": <number>,
        "seasonal_considerations": "<note about Ontario seasonal impacts>",
        "key_milestones": [{"phase": "<name>", "duration": "<time>"}]
      }
    }
  ],
  "overall_summary": "<2-3 sentences>",
  "key_considerations": ["<item>"]
}"""


def _make_fallback_loc(rank, name, lat, lng, score, rationale, laws, incentives, process, timeline, risks, zoning, env_sensitivity="moderate", env_concerns=None, env_studies=None, env_mitigation=None, competition_nearby=None, market_sat="moderate", demand="Moderate demand expected", special_conds=None, pre_con=6, con=18, total=24, seasonal="Ontario frost season Dec-Mar limits excavation; plan foundation pour for spring", milestones=None):
    """Helper to build a single fallback recommendation with all fields."""
    return {
        "rank": rank, "location_name": name, "lat": lat, "lng": lng, "score": score,
        "rationale": rationale,
        "applicable_laws": laws, "incentives": incentives, "regulatory_process": process,
        "estimated_timeline": timeline, "risks": risks, "zoning_details": zoning,
        "environmental_impact": {
            "ecological_sensitivity": env_sensitivity,
            "key_concerns": env_concerns or ["Standard stormwater management required"],
            "required_studies": env_studies or ["Phase 1 ESA"],
            "mitigation_measures": env_mitigation or ["Erosion and sediment control during construction"],
        },
        "competition": {
            "nearby_similar": competition_nearby or [],
            "market_saturation": market_sat,
            "demand_outlook": demand,
        },
        "special_conditions": special_conds or [],
        "construction_timeline": {
            "pre_construction_months": pre_con,
            "construction_months": con,
            "total_months": total,
            "seasonal_considerations": seasonal,
            "key_milestones": milestones or [
                {"phase": "Site preparation", "duration": "2-3 months"},
                {"phase": "Foundation & structure", "duration": "8-12 months"},
                {"phase": "Interior finishing", "duration": "4-6 months"},
            ],
        },
    }


# Region-specific fallback location sets
_FALLBACK_DB = {
    "waterloo": lambda ptype: [
        _make_fallback_loc(1, "King Street Mixed-Use Corridor, Waterloo", 43.466, -80.520, 82,
            f"C-4 mixed-use zone well-suited for {ptype}. High-density zoning in place, excellent ION LRT transit access, active Community Improvement Plans.",
            [{"law": "Planning Act, Section 34", "relevance": "Zoning permits high-density mixed-use", "impact": "positive"}, {"law": "Development Charges Act", "relevance": "Potential exemptions for affordable housing", "impact": "positive"}],
            [{"name": "CMHC Housing Accelerator Fund", "description": "Federal funding for municipalities fast-tracking housing", "estimated_value": "$5M-$15M"}, {"name": "Bill 23 Fee Exemptions", "description": "Reduced development charges for affordable housing", "estimated_value": "Up to 100% DC exemption"}],
            [{"step": "Pre-consultation with City Planning", "timeline": "2-4 weeks", "agency": "City of Waterloo"}, {"step": "Site Plan Application", "timeline": "3-6 months", "agency": "City of Waterloo"}, {"step": "Building Permit", "timeline": "4-8 weeks", "agency": "Building Division"}],
            "8-14 months", ["Market competition in downtown core", "Potential heritage review"],
            {"current_zoning": "C-4 Mixed Use Commercial", "rezoning_required": False, "rezoning_difficulty": "easy"},
            env_sensitivity="low", competition_nearby=[{"name": "Station Park Tower", "distance_km": 0.5, "status": "built"}], market_sat="moderate", demand="Strong demand driven by ION LRT and university proximity",
            special_conds=[{"type": "official_plan", "description": "Designated intensification corridor in Official Plan", "impact": "positive"}], pre_con=4, con=14, total=18),
        _make_fallback_loc(2, "University District, Waterloo", 43.470, -80.5325, 75,
            f"R-6 high-density residential near University of Waterloo. Strong rental demand for {ptype}. Up to 40m height permitted.",
            [{"law": "Planning Act, Section 34", "relevance": "R-6 permits high-density residential", "impact": "positive"}],
            [{"name": "CMHC Rapid Housing Initiative", "description": "Capital contributions for affordable housing", "estimated_value": "$10M-$25M"}],
            [{"step": "Pre-consultation", "timeline": "2-4 weeks", "agency": "City of Waterloo"}, {"step": "Site Plan Approval", "timeline": "4-6 months", "agency": "City of Waterloo"}],
            "10-16 months", ["Student housing competition", "Parking requirements"],
            {"current_zoning": "R-6 High Density Residential", "rezoning_required": False, "rezoning_difficulty": "easy"},
            competition_nearby=[{"name": "ICON Student Living", "distance_km": 0.8, "status": "built"}, {"name": "Rez-One Residences", "distance_km": 0.3, "status": "built"}], market_sat="moderate", demand="Consistent demand from UW/WLU student population"),
        _make_fallback_loc(3, "Kitchener Innovation District", 43.4275, -80.460, 58,
            f"I-2 zone near Highway 401 could accommodate {ptype} with rezoning. Brownfield incentives available but environmental assessment required.",
            [{"law": "Planning Act, Section 34", "relevance": "Rezoning from I-2 required", "impact": "negative"}, {"law": "Environmental Protection Act", "relevance": "Phase 2 ESA likely required", "impact": "negative"}],
            [{"name": "Kitchener Brownfield CIP", "description": "Tax assistance and grants for brownfield redevelopment", "estimated_value": "Up to $500K + TIF"}],
            [{"step": "Zoning Bylaw Amendment", "timeline": "6-12 months", "agency": "City of Kitchener"}, {"step": "Environmental Site Assessment", "timeline": "3-4 months", "agency": "MECP"}],
            "18-26 months", ["Soil contamination costs", "Community opposition to rezoning"],
            {"current_zoning": "I-2 General Industrial", "rezoning_required": True, "rezoning_difficulty": "moderate"},
            env_sensitivity="high", env_concerns=["Potential soil contamination", "Groundwater impact"], env_studies=["Phase 2 ESA", "Record of Site Condition"], pre_con=10, con=18, total=28),
    ],
    "gta": lambda ptype: [
        _make_fallback_loc(1, "East Harbour Development Area, Toronto", 43.654, -79.354, 85,
            f"Former industrial lands being transformed into a major mixed-use district. CR zoning supports {ptype} with excellent transit (Ontario Line + GO).",
            [{"law": "Planning Act, Section 34", "relevance": "CR zoning permits mixed-use high-density", "impact": "positive"}, {"law": "Bill 23", "relevance": "Streamlined approvals for residential development", "impact": "positive"}],
            [{"name": "CMHC Housing Accelerator Fund", "description": "Toronto received $471M in federal funding", "estimated_value": "$5M-$20M per project"}, {"name": "Toronto Open Door Program", "description": "Fee waivers and tax exemptions for affordable housing", "estimated_value": "Up to 100% fee waiver"}],
            [{"step": "Pre-application consultation", "timeline": "4-6 weeks", "agency": "City of Toronto Planning"}, {"step": "Site Plan Control", "timeline": "6-12 months", "agency": "City of Toronto"}, {"step": "Building Permit", "timeline": "6-10 weeks", "agency": "Toronto Building"}],
            "12-20 months", ["Complex environmental remediation", "High construction costs in Toronto"],
            {"current_zoning": "CR - Commercial Residential", "rezoning_required": False, "rezoning_difficulty": "easy"},
            env_sensitivity="high", env_concerns=["Former industrial site requires remediation", "Proximity to Don River watershed"], env_studies=["Phase 2 ESA", "Record of Site Condition", "Flood risk assessment"],
            competition_nearby=[{"name": "The Well", "distance_km": 2.0, "status": "built"}, {"name": "Quayside Waterfront", "distance_km": 1.5, "status": "under_construction"}], market_sat="moderate", demand="Very high demand in Toronto core; transit-oriented development premium",
            special_conds=[{"type": "section_37", "description": "Community Benefits Charge applies to developments over 10,000 sq ft", "impact": "neutral"}, {"type": "shadow_study", "description": "Shadow study required to protect public spaces", "impact": "neutral"}], pre_con=8, con=24, total=32),
        _make_fallback_loc(2, "Mississauga City Centre", 43.593, -79.641, 78,
            f"RA4 apartment zone in Mississauga's downtown. High-density {ptype} with Hurontario LRT access under construction.",
            [{"law": "Planning Act", "relevance": "RA4 permits high-density residential towers", "impact": "positive"}],
            [{"name": "Peel Region Housing Incentives", "description": "DC deferrals for purpose-built rental", "estimated_value": "Up to $5M in DC savings"}],
            [{"step": "Pre-consultation", "timeline": "3-4 weeks", "agency": "City of Mississauga"}, {"step": "Site Plan Approval", "timeline": "4-8 months", "agency": "City of Mississauga"}],
            "10-16 months", ["Competition from numerous approved towers", "Hurontario LRT construction disruption"],
            {"current_zoning": "RA4 Apartment Residential", "rezoning_required": False, "rezoning_difficulty": "easy"},
            competition_nearby=[{"name": "M City Towers", "distance_km": 0.5, "status": "under_construction"}, {"name": "Exchange District", "distance_km": 0.3, "status": "built"}], market_sat="high", demand="Strong demand for transit-oriented units near new LRT"),
        _make_fallback_loc(3, "Downsview Park Redevelopment, North York", 43.742, -79.479, 70,
            f"Former military base undergoing master-planned transformation. E zone requires rezoning for {ptype}, but federal brownfield incentives available.",
            [{"law": "Planning Act, Section 34", "relevance": "Rezoning from Employment required", "impact": "negative"}, {"law": "Environmental Protection Act", "relevance": "Former military base — PFAS and fuel contamination", "impact": "negative"}],
            [{"name": "Federal Contaminated Sites Fund", "description": "Remediation cost sharing for former federal lands", "estimated_value": "Up to 50% remediation costs"}],
            [{"step": "Official Plan Amendment", "timeline": "8-14 months", "agency": "City of Toronto"}, {"step": "Zoning Bylaw Amendment", "timeline": "6-12 months", "agency": "City of Toronto"}, {"step": "Environmental cleanup", "timeline": "12-18 months", "agency": "MECP"}],
            "24-36 months", ["PFAS contamination remediation costs", "Long approval timeline"],
            {"current_zoning": "E - Employment", "rezoning_required": True, "rezoning_difficulty": "difficult"},
            env_sensitivity="high", env_concerns=["PFAS contamination from military use", "Aviation fuel residuals"], env_studies=["Phase 2 ESA", "Risk Assessment", "Record of Site Condition", "Species at Risk screening"], pre_con=18, con=24, total=42),
    ],
    "ottawa": lambda ptype: [
        _make_fallback_loc(1, "LeBreton Flats, Ottawa", 45.413, -75.718, 80,
            f"Prime downtown redevelopment site with GM zoning. Ideal for {ptype} with LRT Confederation Line access and NCC partnership opportunities.",
            [{"law": "Planning Act", "relevance": "GM zoning permits high-density mixed-use", "impact": "positive"}, {"law": "National Capital Act", "relevance": "NCC design review required", "impact": "neutral"}],
            [{"name": "Ottawa Community Improvement Plan", "description": "Tax increment grants in downtown", "estimated_value": "Up to $2M"}, {"name": "CMHC Co-Investment Fund", "description": "Low-cost loans for affordable housing", "estimated_value": "$10M-$50M"}],
            [{"step": "NCC Design Review", "timeline": "4-8 weeks", "agency": "National Capital Commission"}, {"step": "Site Plan Control", "timeline": "4-6 months", "agency": "City of Ottawa"}, {"step": "Building Permit", "timeline": "4-6 weeks", "agency": "City of Ottawa"}],
            "10-16 months", ["NCC approval complexity", "Heritage-adjacent constraints"],
            {"current_zoning": "GM - General Mixed-Use", "rezoning_required": False, "rezoning_difficulty": "easy"},
            env_concerns=["Former rail yard — creosote contamination remediated"], env_studies=["Phase 1 ESA (complete)"], competition_nearby=[{"name": "Zibi Development", "distance_km": 0.5, "status": "under_construction"}], demand="Strong federal employee housing demand"),
        _make_fallback_loc(2, "Bayview Station TOD, Ottawa", 45.405, -75.730, 74,
            f"Transit-oriented R5B zone adjacent to LRT. High-density {ptype} supported by Ottawa's new Official Plan intensification targets.",
            [{"law": "Planning Act", "relevance": "R5B permits high-density apartments", "impact": "positive"}],
            [{"name": "Ottawa Affordable Housing CIP", "description": "DC exemptions for affordable units", "estimated_value": "Up to 100% DC waiver"}],
            [{"step": "Pre-consultation", "timeline": "2-4 weeks", "agency": "City of Ottawa"}, {"step": "Site Plan", "timeline": "4-6 months", "agency": "City of Ottawa"}],
            "10-14 months", ["Competition from multiple TOD proposals", "Wind and shadow concerns near LRT"],
            {"current_zoning": "R5B Residential Fifth Density", "rezoning_required": False, "rezoning_difficulty": "easy"},
            special_conds=[{"type": "official_plan", "description": "Designated Hub on Rapid Transit in new Official Plan", "impact": "positive"}]),
        _make_fallback_loc(3, "Kanata North Tech Park, Ottawa", 45.345, -75.907, 60,
            f"IL zone in Ottawa's tech corridor. Requires rezoning for {ptype} but proximity to Shopify, Nokia campuses drives demand.",
            [{"law": "Planning Act", "relevance": "Rezoning from IL required", "impact": "negative"}],
            [{"name": "Ottawa Employment Lands CIP", "description": "Incentives for mixed-use on employment lands", "estimated_value": "Varies"}],
            [{"step": "Zoning Bylaw Amendment", "timeline": "6-10 months", "agency": "City of Ottawa"}, {"step": "Site Plan", "timeline": "4-6 months", "agency": "City of Ottawa"}],
            "14-20 months", ["Car-dependent suburban location", "Rezoning may face opposition"],
            {"current_zoning": "IL Light Industrial", "rezoning_required": True, "rezoning_difficulty": "moderate"},
            env_sensitivity="low", competition_nearby=[{"name": "Kanata Town Centre redevelopment", "distance_km": 1.2, "status": "proposed"}], demand="Growing demand from tech workers seeking walkable communities"),
    ],
    # Ontario-wide: diverse mix of rural + urban to tackle housing crisis
    "ontario_wide": lambda ptype: [
        _make_fallback_loc(1, "Elliot Lake — Rural Revitalization", 46.38, -82.65, 92,
            f"Former mining city with vast existing infrastructure (roads, water, hydro, hospital, schools) that is severely underutilized. Land costs are 10-20x cheaper than GTA. City actively seeks new residents and will fast-track approvals for {ptype}.",
            [{"law": "Planning Act", "relevance": "Simplified rural zoning — residential permitted", "impact": "positive"}, {"law": "NOHFC", "relevance": "Northern Ontario Heritage Fund grants available", "impact": "positive"}],
            [{"name": "NOHFC Community Building Fund", "description": "Grants for Northern Ontario community development", "estimated_value": "$1M-$5M"}, {"name": "CMHC Rapid Housing Initiative", "description": "Federal funding for affordable housing", "estimated_value": "$5M-$15M"}],
            [{"step": "Municipal consultation", "timeline": "2-4 weeks", "agency": "City of Elliot Lake"}, {"step": "Site Plan Approval", "timeline": "2-3 months", "agency": "City of Elliot Lake"}, {"step": "Building Permit", "timeline": "3-4 weeks", "agency": "Building Division"}],
            "4-8 months", ["Remote location — 3hr from Sudbury", "Limited local construction workforce"],
            {"current_zoning": "RU-EL Rural Residential Revitalization", "rezoning_required": False, "rezoning_difficulty": "easy"},
            env_sensitivity="low", env_concerns=["Former mining area — check for legacy contamination", "Maintain buffer from Lake Huron watershed"],
            env_studies=["Phase 1 ESA"], env_mitigation=["Use existing disturbed land, avoid adjacent forests"],
            market_sat="low", demand="Very low competition; city actively recruiting new residents",
            special_conds=[{"type": "official_plan", "description": "Municipality has growth incentive program — waived fees for new housing", "impact": "positive"}],
            pre_con=3, con=12, total=15),
        _make_fallback_loc(2, "North Bay — Highway 11 Corridor", 46.31, -79.46, 88,
            f"Gateway city to Northern Ontario with college, hospital, and highway junction (11/17). Growing demand for {ptype}. Land 5-10x cheaper than GTA with full municipal services.",
            [{"law": "Planning Act", "relevance": "Residential growth zone supports medium-density", "impact": "positive"}, {"law": "NOHFC", "relevance": "Northern Ontario grants available", "impact": "positive"}],
            [{"name": "NOHFC Investment Program", "description": "Northern development incentives", "estimated_value": "$2M-$8M"}, {"name": "Ontario Community Infrastructure Fund", "description": "Infrastructure grants for smaller municipalities", "estimated_value": "Up to $3M"}],
            [{"step": "Pre-consultation", "timeline": "2-3 weeks", "agency": "City of North Bay"}, {"step": "Site Plan", "timeline": "3-4 months", "agency": "City of North Bay"}],
            "6-10 months", ["Seasonal construction limitations (Dec-Mar frost)", "Distance from GTA labour pool"],
            {"current_zoning": "R2-NB Residential Growth Zone", "rezoning_required": False, "rezoning_difficulty": "easy"},
            env_sensitivity="low", env_concerns=["Maintain setback from Lake Nipissing"], env_studies=["Phase 1 ESA"],
            competition_nearby=[{"name": "Lakeshore Drive development", "distance_km": 3.0, "status": "proposed"}],
            market_sat="low", demand="Growing demand from remote workers and college students",
            pre_con=3, con=14, total=17),
        _make_fallback_loc(3, "Cobourg — Highway 401 Small Town", 43.96, -78.17, 85,
            f"Charming lakefront town on Highway 401 with VIA Rail stop — commutable to GTA. Much cheaper land with full services. Ideal for {ptype} targeting people priced out of Toronto.",
            [{"law": "Planning Act", "relevance": "Medium density residential permitted", "impact": "positive"}, {"law": "Bill 23", "relevance": "Streamlined approvals for residential", "impact": "positive"}],
            [{"name": "CMHC Housing Accelerator Fund", "description": "Federal housing funding", "estimated_value": "$3M-$10M"}, {"name": "Northumberland County CIP", "description": "Community improvement grants", "estimated_value": "Up to $500K"}],
            [{"step": "Pre-consultation", "timeline": "2-3 weeks", "agency": "Town of Cobourg"}, {"step": "Site Plan", "timeline": "3-5 months", "agency": "Town of Cobourg"}],
            "8-12 months", ["Heritage district constraints in downtown core", "Limited high-rise appetite in small town"],
            {"current_zoning": "R3-D Medium Density Residential", "rezoning_required": False, "rezoning_difficulty": "easy"},
            env_sensitivity="low", env_concerns=["Maintain setback from Lake Ontario shoreline"],
            competition_nearby=[{"name": "Cobourg Waterfront Condos", "distance_km": 1.5, "status": "built"}],
            market_sat="low", demand="Rising demand from GTA remote workers seeking affordable lakefront living",
            pre_con=4, con=14, total=18),
    ],
}


def _fallback_recommendations(project_requirements: dict) -> dict:
    """Return sample recommendations when Gemini API is unavailable. Region-aware."""
    ptype = project_requirements.get("project_type", "affordable_housing").replace("_", " ")
    region = project_requirements.get("region", "ontario_wide")

    # Pick the right region, fallback to ontario_wide (diverse mix)
    builder = _FALLBACK_DB.get(region)
    if builder is None:
        builder = _FALLBACK_DB["ontario_wide"]

    recs = builder(ptype)
    region_label = region.replace("_", " ").title()

    return {
        "recommendations": recs,
        "overall_summary": f"Found {len(recs)} candidate zones across {region_label} for {ptype}. These recommendations prioritize underutilized land and existing infrastructure to maximize affordability and reduce urban burden. Connect Gemini API for live AI-powered analysis.",
        "key_considerations": [
            "Ontario's housing crisis can be tackled by building in smaller communities with cheap land and existing infrastructure",
            "Northern Ontario Heritage Fund (NOHFC) provides grants specifically for development in Northern communities",
            "Bill 23 reduces barriers for residential development province-wide, not just in cities",
            "Many small Ontario towns have underutilized roads, water, hydro, schools, and hospitals — build there",
            "Environmental assessments remain mandatory — rural development must avoid harming ecosystems",
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
