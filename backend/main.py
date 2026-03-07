"""FastAPI server — TerraCheck backend."""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from backend.geo_engine import GeoEngine, LAYERS
from backend.gemini_service import analyze_location, followup_question

app = FastAPI(title="TerraCheck API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize geo engine at startup
print("Loading geospatial data layers...")
geo_engine = GeoEngine()
print("Geo engine ready.\n")


# --- Request/Response Models ---

class AssessRequest(BaseModel):
    lat: float
    lng: float
    radius_km: float = 1.0


class FollowupRequest(BaseModel):
    assessment: dict
    question: str


# --- Endpoints ---

@app.get("/api/health")
def health():
    return {"status": "ok", "layers_loaded": len(geo_engine.layers)}


@app.post("/api/assess")
async def assess_location(req: AssessRequest):
    """Main endpoint: query geospatial layers and run Gemini analysis."""
    # Step 1: Spatial query
    geo_data = geo_engine.query_point(req.lat, req.lng, req.radius_km)

    # Step 2: AI analysis
    assessment = await analyze_location(geo_data)

    return {
        "geo_data": geo_data,
        "assessment": assessment,
    }


@app.post("/api/followup")
async def followup(req: FollowupRequest):
    """Ask a follow-up question about an existing assessment."""
    response = await followup_question(req.assessment, req.question)
    return {"answer": response}


@app.get("/api/layers")
def list_layers():
    """List all available data layers with metadata."""
    return {
        name: {
            "label": config["label"],
            "color": config["color"],
            "severity": config["severity"],
            "loaded": name in geo_engine.layers,
            "feature_count": len(geo_engine.layers[name]) if name in geo_engine.layers else 0,
        }
        for name, config in LAYERS.items()
    }


@app.get("/api/layers/{layer_name}")
def get_layer(layer_name: str):
    """Return GeoJSON data for a specific layer (for map rendering)."""
    geojson = geo_engine.get_layer_geojson(layer_name)
    if geojson is None:
        raise HTTPException(status_code=404, detail=f"Layer '{layer_name}' not found")
    return geojson
