import type { AssessResponse, RecommendResponse, RecommendRequest } from "./api";

export interface SavedAssessment {
  id: string;
  type: "assessment";
  timestamp: string;
  lat: number;
  lng: number;
  locationName: string;
  score: number;
  status: string;
  summary: string;
  layersIntersecting: number;
  layersQueried: number;
  data: AssessResponse;
}

export interface SavedRecommendation {
  id: string;
  type: "recommendation";
  timestamp: string;
  projectType: string;
  region: string;
  scale: string;
  locationCount: number;
  topScore: number;
  summary: string;
  request: RecommendRequest;
  data: RecommendResponse;
}

export type SavedItem = SavedAssessment | SavedRecommendation;

const STORAGE_KEY_PREFIX = "terracheck_history_";
const MAX_ITEMS = 50;

function getStorageKey(userSub: string): string {
  return `${STORAGE_KEY_PREFIX}${userSub}`;
}

export function loadHistory(userSub: string): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userSub));
    if (!raw) return [];
    const items: SavedItem[] = JSON.parse(raw);
    return items.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch {
    return [];
  }
}

export function saveAssessment(
  userSub: string,
  result: AssessResponse,
  locationName?: string
): void {
  if (typeof window === "undefined") return;
  const history = loadHistory(userSub);

  const item: SavedAssessment = {
    id: `assess_${Date.now()}`,
    type: "assessment",
    timestamp: new Date().toISOString(),
    lat: result.geo_data.lat,
    lng: result.geo_data.lng,
    locationName:
      locationName ||
      `${result.geo_data.lat.toFixed(4)}°N, ${Math.abs(result.geo_data.lng).toFixed(4)}°W`,
    score: result.assessment.overall_score,
    status: result.assessment.overall_status,
    summary: result.assessment.summary,
    layersIntersecting: result.geo_data.layers_intersecting,
    layersQueried: result.geo_data.layers_queried,
    data: result,
  };

  history.unshift(item);
  const trimmed = history.slice(0, MAX_ITEMS);

  try {
    localStorage.setItem(getStorageKey(userSub), JSON.stringify(trimmed));
  } catch (e) {
    console.warn("Failed to save to localStorage:", e);
  }
}

export function saveRecommendation(
  userSub: string,
  request: RecommendRequest,
  result: RecommendResponse
): void {
  if (typeof window === "undefined") return;
  const history = loadHistory(userSub);

  const recs = result.recommendations?.recommendations || [];

  const item: SavedRecommendation = {
    id: `rec_${Date.now()}`,
    type: "recommendation",
    timestamp: new Date().toISOString(),
    projectType: request.project_type,
    region: request.region,
    scale: request.scale,
    locationCount: recs.length,
    topScore: recs.length > 0 ? recs[0].score : 0,
    summary: result.recommendations?.overall_summary || "Recommendation completed",
    request,
    data: result,
  };

  history.unshift(item);
  const trimmed = history.slice(0, MAX_ITEMS);

  try {
    localStorage.setItem(getStorageKey(userSub), JSON.stringify(trimmed));
  } catch (e) {
    console.warn("Failed to save to localStorage:", e);
  }
}

export function clearHistory(userSub: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getStorageKey(userSub));
}
