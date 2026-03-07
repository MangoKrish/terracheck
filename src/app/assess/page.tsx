"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import ScoreIndicator from "@/components/ScoreIndicator";
import CategoryCard from "@/components/CategoryCard";
import { useState, useCallback } from "react";
import { assessLocation, type AssessResponse, type Assessment } from "@/lib/api";

// Dynamic import to avoid SSR issues with Leaflet
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const CATEGORY_MAP: Record<string, string> = {
  flood_risk: "Flood Risk",
  zoning: "Zoning Compatibility",
  protected_areas: "Protected Areas",
  contamination: "Contaminated Sites",
  indigenous_lands: "Indigenous Lands",
  greenbelt: "Greenbelt",
};

export default function AssessPage() {
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePinDrop = useCallback(async (lat: number, lng: number) => {
    setPin({ lat, lng });
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await assessLocation(lat, lng, 1.0);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to assess location");
    } finally {
      setLoading(false);
    }
  }, []);

  const assessment = result?.assessment;
  const geoData = result?.geo_data;

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar />

      {/* Top toolbar */}
      <div className="h-14 border-b border-border bg-surface flex items-center px-6 gap-4">
        <SearchBar />
        {pin && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted font-mono">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {pin.lat.toFixed(4)}° N, {Math.abs(pin.lng).toFixed(4)}° W
          </div>
        )}
      </div>

      {/* Main content: map + panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 p-3">
          <Map onPinDrop={handlePinDrop} pin={pin} />
        </div>

        {/* Assessment panel */}
        <div className="w-[400px] border-l border-border bg-surface overflow-y-auto">
          <div className="p-5">
            {/* Empty state */}
            {!pin && !loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  Select a Location
                </h3>
                <p className="text-sm text-muted max-w-[260px]">
                  Click anywhere on the map to drop a pin and run a viability assessment.
                </p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Analyzing location...
                </p>
                <p className="text-xs text-muted">
                  Querying data layers and running assessment
                </p>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-status-critical/10 flex items-center justify-center mx-auto mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Assessment Failed</p>
                <p className="text-xs text-muted mb-4">{error}</p>
                <p className="text-xs text-muted-light">Make sure the backend server is running on port 8000</p>
              </div>
            )}

            {/* Results */}
            {assessment && !loading && (
              <>
                {/* Location header */}
                <div className="mb-5">
                  <h2 className="text-base font-semibold text-foreground">
                    {pin?.lat.toFixed(4)}° N, {Math.abs(pin?.lng || 0).toFixed(4)}° W
                  </h2>
                  <p className="text-xs text-muted mt-1">
                    {geoData?.layers_intersecting} of {geoData?.layers_queried} data layers intersecting
                  </p>
                </div>

                {/* Score */}
                <div className="p-4 bg-background rounded-lg border border-border-light mb-5">
                  <ScoreIndicator score={assessment.overall_score} />
                </div>

                {/* Summary */}
                {assessment.summary && (
                  <div className="p-3 bg-background rounded-lg border border-border-light mb-5">
                    <p className="text-sm text-foreground leading-relaxed">
                      {assessment.summary}
                    </p>
                  </div>
                )}

                {/* Category cards */}
                <div className="space-y-3 mb-6">
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Risk Assessment
                  </h3>
                  {assessment.categories &&
                    Object.entries(assessment.categories).map(([key, cat]) => (
                      <CategoryCard
                        key={key}
                        title={CATEGORY_MAP[key] || key}
                        status={cat.status}
                        summary={cat.summary}
                      />
                    ))}
                </div>

                {/* Critical blockers */}
                {assessment.critical_blockers && assessment.critical_blockers.length > 0 && (
                  <div className="space-y-2 mb-6">
                    <h3 className="text-xs font-semibold text-status-critical uppercase tracking-wider">
                      Critical Blockers
                    </h3>
                    {assessment.critical_blockers.map((b, i) => (
                      <div key={i} className="p-3 bg-status-critical/5 border border-status-critical/20 rounded-lg">
                        <p className="text-sm font-semibold text-foreground">{b.title}</p>
                        <p className="text-xs text-muted mt-1">{b.description}</p>
                        {b.regulation && (
                          <p className="text-xs text-muted-light mt-1 italic">{b.regulation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Warnings */}
                {assessment.warnings && assessment.warnings.length > 0 && (
                  <div className="space-y-2 mb-6">
                    <h3 className="text-xs font-semibold text-status-warning uppercase tracking-wider">
                      Warnings
                    </h3>
                    {assessment.warnings.map((w, i) => (
                      <div key={i} className="p-3 bg-status-warning/5 border border-status-warning/20 rounded-lg">
                        <p className="text-sm font-semibold text-foreground">{w.title}</p>
                        <p className="text-xs text-muted mt-1">{w.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Regulatory pathway */}
                {assessment.regulatory_pathway && assessment.regulatory_pathway.length > 0 && (
                  <div className="space-y-2 mb-6">
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                      Regulatory Pathway
                    </h3>
                    {assessment.regulatory_pathway.map((step, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-background rounded-lg border border-border-light">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm text-foreground">{step.step}</p>
                          <p className="text-xs text-muted mt-0.5">
                            {step.timeline} · {step.agency}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Timeline */}
                {assessment.estimated_timeline && assessment.estimated_timeline !== "Unknown" && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg mb-6">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                      Estimated Timeline
                    </p>
                    <p className="text-sm text-foreground">{assessment.estimated_timeline}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                    Actions
                  </h3>
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-background rounded-lg border border-border text-sm text-foreground hover:border-primary/30 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                      <path d="M16 13H8" />
                      <path d="M16 17H8" />
                      <path d="M10 9H8" />
                    </svg>
                    Export PDF Report
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-background rounded-lg border border-border text-sm text-foreground hover:border-primary/30 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                    Voice Briefing
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-background rounded-lg border border-border text-sm text-foreground hover:border-primary/30 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Ask a Follow-up Question
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
