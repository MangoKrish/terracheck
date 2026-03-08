"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import ScoreIndicator from "@/components/ScoreIndicator";
import CategoryCard from "@/components/CategoryCard";
import AssessLoader from "@/components/AssessLoader";
import { useState, useCallback, useRef } from "react";

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

/* ── Mock assessment data ── */
const MOCK_RESULT = {
  geo_data: {
    lat: 43.2557,
    lng: -79.8711,
    radius_km: 1.0,
    layers_queried: 7,
    layers_intersecting: 3,
    results: {},
  },
  assessment: {
    overall_score: 72,
    overall_status: "viable_with_conditions",
    summary:
      "This location near Hamilton, Ontario shows good development potential with moderate regulatory requirements. The site is outside major flood plains and protected areas, but lies within the Greenbelt boundary, requiring additional provincial approval. No contamination records found. Zoning is currently agricultural — a rezoning application will be needed for commercial or residential development.",
    critical_blockers: [] as { title: string; description: string; regulation: string }[],
    warnings: [
      {
        title: "Greenbelt Overlap",
        description:
          "Approximately 40% of the proposed radius falls within Ontario's Greenbelt boundary. Development here requires approval under the Greenbelt Plan (2017) and may be subject to additional environmental assessments.",
        regulation: "Ontario Greenbelt Plan, 2017 — Section 4.2",
      },
      {
        title: "Agricultural Zoning",
        description:
          "The parcel is currently zoned Agricultural (A1). Rezoning to commercial or residential requires a Zoning By-law Amendment through the local municipality, with public consultation.",
        regulation: "Planning Act, R.S.O. 1990, c. P.13",
      },
    ],
    green_flags: [
      { title: "No Flood Risk Detected", description: "The site is well outside any mapped floodplain boundaries. No flood mitigation measures are required." },
      { title: "No Contamination Records", description: "No Environmental Site Registry records found within the search radius. Phase 1 ESA is still recommended as standard practice." },
      { title: "No Infrastructure Conflicts", description: "No existing major infrastructure (universities, hospitals, government buildings) detected within the search radius that would block development." },
    ],
    regulatory_pathway: [
      { step: "Pre-consultation with Municipality", timeline: "2-4 weeks", agency: "City of Hamilton Planning Dept." },
      { step: "Zoning By-law Amendment Application", timeline: "6-12 months", agency: "Municipal Council" },
      { step: "Greenbelt Plan Conformity Review", timeline: "3-6 months", agency: "Ministry of Municipal Affairs" },
      { step: "Site Plan Approval", timeline: "3-6 months", agency: "City of Hamilton" },
      { step: "Building Permit Issuance", timeline: "4-8 weeks", agency: "Building Dept." },
    ],
    mitigations: [
      { issue: "Greenbelt overlap", action: "Engage a planner experienced with Greenbelt Plan applications. Consider focusing development on the 60% of the site outside the Greenbelt boundary.", cost_estimate: "$15,000-$25,000" },
      { issue: "Rezoning required", action: "Prepare a comprehensive Planning Justification Report with traffic impact study and servicing report.", cost_estimate: "$20,000-$40,000" },
    ],
    estimated_timeline: "18-30 months from application to construction start",
    categories: {
      flood_risk: { status: "clear" as const, summary: "No flood zone boundaries intersect the search area. Low flood risk." },
      zoning: { status: "warning" as const, summary: "Currently zoned Agricultural (A1). Rezoning amendment required for most development types." },
      protected_areas: { status: "clear" as const, summary: "No provincial or federal protected areas overlap with this location." },
      contamination: { status: "clear" as const, summary: "No brownfield or contaminated site records found in the Environmental Site Registry." },
      indigenous_lands: { status: "clear" as const, summary: "Located within Treaty 3 lands. Standard duty-to-consult requirements apply but no active land claims in the immediate area." },
      greenbelt: { status: "warning" as const, summary: "Partial overlap with the Ontario Greenbelt. Development requires conformity review under the Greenbelt Plan." },
      infrastructure: { status: "clear" as const, summary: "No major existing infrastructure (universities, hospitals, government offices) found within the search radius." },
    },
  },
};

export default function DemoAssessPage() {
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<typeof MOCK_RESULT | null>(null);
  const [error] = useState<string | null>(null);
  const [followupQ, setFollowupQ] = useState("");
  const [followupA, setFollowupA] = useState<string | null>(null);
  const [followupLoading, setFollowupLoading] = useState(false);
  const panelEndRef = useRef<HTMLDivElement>(null);

  const handlePinDrop = useCallback(async (lat: number, lng: number) => {
    setPin({ lat, lng });
    setLoading(true);
    setResult(null);
    setFollowupA(null);

    // Simulate loading for the animation duration
    await new Promise((r) => setTimeout(r, 4200));

    setResult(MOCK_RESULT);
    setLoading(false);
  }, []);

  const handleSearchSelect = useCallback(
    (lat: number, lng: number, _name: string) => {
      handlePinDrop(lat, lng);
    },
    [handlePinDrop]
  );

  const handleFollowup = useCallback(async () => {
    if (!followupQ.trim() || !result?.assessment) return;
    setFollowupLoading(true);
    setFollowupA(null);

    await new Promise((r) => setTimeout(r, 1500));
    setFollowupA(
      "Based on the assessment data, you would need a Zoning By-law Amendment (ZBA) through the City of Hamilton. The process involves a pre-consultation meeting, submission of a complete application with a Planning Justification Report, public notice and consultation, a statutory public meeting, and finally a council decision. For this agricultural-to-residential conversion near the Greenbelt, you should also budget for an Environmental Impact Statement. The entire process typically takes 8-14 months."
    );
    setFollowupQ("");
    setFollowupLoading(false);
    setTimeout(() => panelEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [followupQ, result]);

  const assessment = result?.assessment;
  const geoData = result?.geo_data;

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar linkPrefix="/demo" />

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

            {loading && <AssessLoader />}

            {error && (
              <div className="p-4 bg-status-critical/8 border border-status-critical/20 rounded-lg">
                <p className="text-sm text-status-critical font-medium">Assessment Failed</p>
                <p className="text-xs text-status-critical/70 mt-1">{error}</p>
              </div>
            )}

            {assessment && (
              <>
                <div className="mb-5 pb-5 border-b border-border">
                  <ScoreIndicator score={assessment.overall_score} />
                  <p className="text-sm text-muted mt-3 leading-relaxed">{assessment.summary}</p>
                </div>

                <div className="mb-5">
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Categories</h3>
                  <div className="space-y-2">
                    {Object.entries(assessment.categories).map(([key, cat]) => (
                      <CategoryCard key={key} title={CATEGORY_MAP[key] || key} status={cat.status} summary={cat.summary} />
                    ))}
                  </div>
                </div>

                {assessment.critical_blockers.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-xs font-semibold text-status-critical uppercase tracking-wider mb-3">Critical Blockers</h3>
                    <div className="space-y-2">
                      {assessment.critical_blockers.map((b, i) => (
                        <div key={i} className="p-3 bg-status-critical/5 border border-status-critical/15 rounded-lg">
                          <p className="text-sm font-medium text-foreground">{b.title}</p>
                          <p className="text-xs text-muted mt-1">{b.description}</p>
                          {b.regulation && <p className="text-xs text-status-critical/70 mt-1 italic">{b.regulation}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

                {assessment.regulatory_pathway.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Regulatory Pathway</h3>
                    <div className="space-y-2">
                      {assessment.regulatory_pathway.map((step, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-surface rounded-lg border border-border-light">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{step.step}</p>
                            <p className="text-xs text-muted mt-0.5">{step.agency} · {step.timeline}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {assessment.mitigations.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Recommended Mitigations</h3>
                    <div className="space-y-2">
                      {assessment.mitigations.map((m, i) => (
                        <div key={i} className="p-3 bg-surface rounded-lg border border-border-light">
                          <p className="text-sm font-medium text-foreground">{m.issue}</p>
                          <p className="text-xs text-muted mt-1">{m.action}</p>
                          {m.cost_estimate && <p className="text-xs text-primary font-medium mt-1">Est. cost: {m.cost_estimate}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {assessment.estimated_timeline && (
                  <div className="p-3 bg-primary/5 border border-primary/15 rounded-lg">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Estimated Timeline</p>
                    <p className="text-sm text-foreground">{assessment.estimated_timeline}</p>
                  </div>
                )}

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
