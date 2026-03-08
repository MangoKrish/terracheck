"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import ScoreIndicator from "@/components/ScoreIndicator";
import CategoryCard from "@/components/CategoryCard";
import { useState, useCallback, useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { assessLocation, askFollowup, type AssessResponse, type Assessment } from "@/lib/api";
import AssessLoader from "@/components/AssessLoader";
import { saveAssessment } from "@/lib/history";

// Dynamic import to avoid SSR issues with Leaflet
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const CATEGORY_MAP: Record<string, string> = {
  flood_risk: "Flood Risk",
  zoning: "Zoning Compatibility",
  protected_areas: "Protected Areas",
  contamination: "Contaminated Sites",
  indigenous_lands: "Indigenous Lands",
  greenbelt: "Greenbelt",
  infrastructure: "Nearby Infrastructure",
};

export default function AssessPage() {
  const { user } = useUser();
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [followupQ, setFollowupQ] = useState("");
  const [followupA, setFollowupA] = useState<string | null>(null);
  const [followupLoading, setFollowupLoading] = useState(false);
  const panelEndRef = useRef<HTMLDivElement>(null);

  const handlePinDrop = useCallback(async (lat: number, lng: number) => {
    setPin({ lat, lng });
    setLoading(true);
    setError(null);
    setResult(null);
    setFollowupA(null);

    const startTime = Date.now();
    const MIN_LOADING_MS = 3800;

    try {
      const data = await assessLocation(lat, lng, 1.0);
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      setResult(data);
      // Save to history
      if (user?.sub) {
        saveAssessment(user.sub, data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to assess location");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleSearchSelect = useCallback((lat: number, lng: number, _name: string) => {
    handlePinDrop(lat, lng);
  }, [handlePinDrop]);

  const handleFollowup = useCallback(async () => {
    if (!followupQ.trim() || !result?.assessment) return;
    setFollowupLoading(true);
    setFollowupA(null);
    try {
      const answer = await askFollowup(result.assessment, followupQ.trim());
      setFollowupA(answer);
      setFollowupQ("");
      setTimeout(() => panelEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setFollowupA("Sorry, I couldn't process that question. Please try again.");
    } finally {
      setFollowupLoading(false);
    }
  }, [followupQ, result]);

  const assessment = result?.assessment;
  const geoData = result?.geo_data;

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar />

      {/* Top toolbar */}
      <div className="h-14 border-b border-border bg-surface flex items-center px-6 gap-4">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-sm font-semibold text-foreground">Land Assessment</span>
        </div>
        <SearchBar onLocationSelect={handleSearchSelect} />
        {geoData && (
          <span className="text-xs text-muted ml-auto">
            {geoData.layers_intersecting}/{geoData.layers_queried} layers intersect
          </span>
        )}
      </div>

      {/* Main content: map + panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map area */}
        <div className="flex-1 p-3">
          <Map onPinDrop={handlePinDrop} pin={pin} />
        </div>

        {/* Results side panel */}
        <div className="w-[420px] border-l border-border bg-surface overflow-y-auto">
          <div className="p-5">
            {/* Empty state */}
            {!loading && !result && !error && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">Drop a pin to assess</h3>
                <p className="text-sm text-muted max-w-[260px]">
                  Click anywhere on the map to get a detailed environmental and regulatory viability report.
                </p>
              </div>
            )}

            {/* Loading state */}
            {loading && <AssessLoader />}

            {/* Error state */}
            {error && (
              <div className="p-4 bg-status-critical/8 border border-status-critical/20 rounded-lg">
                <p className="text-sm text-status-critical font-medium">Assessment Failed</p>
                <p className="text-xs text-status-critical/70 mt-1">{error}</p>
              </div>
            )}

            {/* Results */}
            {assessment && (
              <>
                {/* Score */}
                <div className="mb-5 pb-5 border-b border-border">
                  <ScoreIndicator score={assessment.overall_score} />
                  <p className="text-sm text-muted mt-3 leading-relaxed">{assessment.summary}</p>
                </div>

                {/* Categories */}
                <div className="mb-5">
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Categories</h3>
                  <div className="space-y-2">
                    {Object.entries(assessment.categories).map(([key, cat]) => (
                      <CategoryCard
                        key={key}
                        title={CATEGORY_MAP[key] || key}
                        status={cat.status}
                        summary={cat.summary}
                      />
                    ))}
                  </div>
                </div>

                {/* Critical blockers */}
                {assessment.critical_blockers.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-xs font-semibold text-status-critical uppercase tracking-wider mb-3">Critical Blockers</h3>
                    <div className="space-y-2">
                      {assessment.critical_blockers.map((b, i) => (
                        <div key={i} className="p-3 bg-status-critical/5 border border-status-critical/15 rounded-lg">
                          <p className="text-sm font-medium text-foreground">{b.title}</p>
                          <p className="text-xs text-muted mt-1">{b.description}</p>
                          {b.regulation && (
                            <p className="text-xs text-status-critical/70 mt-1 italic">{b.regulation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {assessment.warnings.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-xs font-semibold text-status-warning uppercase tracking-wider mb-3">Warnings</h3>
                    <div className="space-y-2">
                      {assessment.warnings.map((w, i) => (
                        <div key={i} className="p-3 bg-status-warning/5 border border-status-warning/15 rounded-lg">
                          <p className="text-sm font-medium text-foreground">{w.title}</p>
                          <p className="text-xs text-muted mt-1">{w.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Green flags */}
                {assessment.green_flags.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-xs font-semibold text-status-clear uppercase tracking-wider mb-3">Green Flags</h3>
                    <div className="space-y-2">
                      {assessment.green_flags.map((g, i) => (
                        <div key={i} className="p-3 bg-status-clear/5 border border-status-clear/15 rounded-lg">
                          <p className="text-sm font-medium text-foreground">{g.title}</p>
                          <p className="text-xs text-muted mt-1">{g.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regulatory pathway */}
                {assessment.regulatory_pathway.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Regulatory Pathway</h3>
                    <div className="space-y-2">
                      {assessment.regulatory_pathway.map((step, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-surface rounded-lg border border-border-light">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{step.step}</p>
                            <p className="text-xs text-muted mt-0.5">{step.agency} · {step.timeline}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mitigations */}
                {assessment.mitigations.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Recommended Mitigations</h3>
                    <div className="space-y-2">
                      {assessment.mitigations.map((m, i) => (
                        <div key={i} className="p-3 bg-surface rounded-lg border border-border-light">
                          <p className="text-sm font-medium text-foreground">{m.issue}</p>
                          <p className="text-xs text-muted mt-1">{m.action}</p>
                          {m.cost_estimate && (
                            <p className="text-xs text-primary font-medium mt-1">Est. cost: {m.cost_estimate}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {assessment.estimated_timeline && (
                  <div className="p-3 bg-primary/5 border border-primary/15 rounded-lg">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Estimated Timeline</p>
                    <p className="text-sm text-foreground">{assessment.estimated_timeline}</p>
                  </div>
                )}

                {/* Follow-up Question */}
                <div className="mt-5 pt-5 border-t border-border">
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Ask a Follow-up</h3>
                  {followupA && (
                    <div className="mb-3 p-3 bg-primary/5 border border-primary/15 rounded-lg">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{followupA}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={followupQ}
                      onChange={(e) => setFollowupQ(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleFollowup()}
                      placeholder="e.g. What permits do I need?"
                      disabled={followupLoading}
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                    />
                    <button
                      onClick={handleFollowup}
                      disabled={followupLoading || !followupQ.trim()}
                      className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {followupLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      )}
                    </button>
                  </div>
                </div>
                <div ref={panelEndRef} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
