// Use Next.js API routes as proxy to the FastAPI backend
const API_BASE = "";

export interface GeoResult {
  label: string;
  color: string;
  severity: string;
  count: number;
  features: Record<string, unknown>[];
}

export interface CategoryStatus {
  status: "clear" | "warning" | "critical";
  summary: string;
}

export interface Assessment {
  overall_score: number;
  overall_status: string;
  summary: string;
  critical_blockers: { title: string; description: string; regulation: string }[];
  warnings: { title: string; description: string; regulation: string }[];
  green_flags: { title: string; description: string }[];
  regulatory_pathway: { step: string; timeline: string; agency: string }[];
  mitigations: { issue: string; action: string; cost_estimate: string }[];
  estimated_timeline: string;
  categories: {
    flood_risk: CategoryStatus;
    zoning: CategoryStatus;
    protected_areas: CategoryStatus;
    contamination: CategoryStatus;
    indigenous_lands: CategoryStatus;
    greenbelt: CategoryStatus;
    infrastructure: CategoryStatus;
  };
}

export interface AssessResponse {
  geo_data: {
    lat: number;
    lng: number;
    radius_km: number;
    layers_queried: number;
    layers_intersecting: number;
    results: Record<string, GeoResult>;
  };
  assessment: Assessment;
}

export interface LayerInfo {
  label: string;
  color: string;
  severity: string;
  loaded: boolean;
  feature_count: number;
}

export async function assessLocation(
  lat: number,
  lng: number,
  radius_km: number = 1.0
): Promise<AssessResponse> {
  const res = await fetch(`${API_BASE}/api/assess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng, radius_km }),
  });
  if (!res.ok) throw new Error(`Assessment failed: ${res.statusText}`);
  return res.json();
}

export async function getLayers(): Promise<Record<string, LayerInfo>> {
  const res = await fetch(`${API_BASE}/api/layers`);
  if (!res.ok) throw new Error(`Failed to fetch layers: ${res.statusText}`);
  return res.json();
}

export async function getLayerGeoJSON(layerName: string): Promise<GeoJSON.FeatureCollection> {
  const res = await fetch(`${API_BASE}/api/layers/${layerName}`);
  if (!res.ok) throw new Error(`Failed to fetch layer ${layerName}: ${res.statusText}`);
  return res.json();
}

// --- Smart Recommend Types ---

export interface RecommendRequest {
  org_type: string;
  project_type: string;
  scale: string;
  budget: string;
  priority: string;
  region: string;
  additional_requirements?: string;
}

export interface RecommendedLocation {
  rank: number;
  location_name: string;
  lat: number;
  lng: number;
  score: number;
  rationale: string;
  applicable_laws: { law: string; relevance: string; impact: string }[];
  incentives: { name: string; description: string; estimated_value: string }[];
  regulatory_process: { step: string; timeline: string; agency: string }[];
  estimated_timeline: string;
  risks: string[];
  zoning_details: {
    current_zoning: string;
    rezoning_required: boolean;
    rezoning_difficulty: string;
  };
  // Enhanced analysis fields
  environmental_impact?: {
    ecological_sensitivity: string;
    key_concerns: string[];
    required_studies: string[];
    mitigation_measures: string[];
  };
  competition?: {
    nearby_similar: { name: string; distance_km: number; status: string }[];
    market_saturation: string;
    demand_outlook: string;
  };
  special_conditions?: {
    type: string;
    description: string;
    impact: string;
  }[];
  construction_timeline?: {
    pre_construction_months: number;
    construction_months: number;
    total_months: number;
    seasonal_considerations: string;
    key_milestones: { phase: string; duration: string }[];
  };
}

export interface RecommendResponse {
  project_requirements: RecommendRequest;
  candidates_analyzed: number;
  recommendations: {
    recommendations: RecommendedLocation[];
    overall_summary: string;
    key_considerations: string[];
  };
}

export async function recommendLocations(
  request: RecommendRequest
): Promise<RecommendResponse> {
  const res = await fetch(`${API_BASE}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(`Recommendation failed: ${res.statusText}`);
  return res.json();
}

export async function askFollowup(
  assessment: Assessment,
  question: string
): Promise<string> {
  const res = await fetch(`${API_BASE}/api/followup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assessment, question }),
  });
  if (!res.ok) throw new Error(`Followup failed: ${res.statusText}`);
  const data = await res.json();
  return data.answer;
}
