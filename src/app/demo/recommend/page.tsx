"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import RecommendForm from "@/components/RecommendForm";
import RecommendCard from "@/components/RecommendCard";
import CloudinaryLoader from "@/components/CloudinaryLoader";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  type RecommendRequest,
  type RecommendedLocation,
} from "@/lib/api";

const RecommendMap = dynamic(() => import("@/components/RecommendMap"), {
  ssr: false,
});

type PageState = "idle" | "loading" | "results";

/* ── Mock recommendation data ── */
const MOCK_RESPONSE = {
  project_requirements: {
    org_type: "private_company",
    project_type: "residential_complex",
    scale: "medium",
    budget: "5000000",
    priority: "roi",
    region: "southern_ontario",
    additional_requirements: "",
  },
  candidates_analyzed: 47,
  recommendations: {
    recommendations: [
      {
        rank: 1,
        location_name: "Milton, Halton Region",
        lat: 43.5183,
        lng: -79.8774,
        score: 85,
        rationale:
          "Milton presents the strongest opportunity for a medium-scale residential complex. The town is one of Canada's fastest-growing municipalities with strong housing demand driven by GTA spillover. Available greenfield lands in the urban expansion area are pre-designated for residential intensification under the Halton Region Official Plan.",
        applicable_laws: [
          { law: "Planning Act (Ontario)", relevance: "Governs subdivision and site plan approvals for residential development", impact: "neutral" },
          { law: "Places to Grow Act", relevance: "Milton is designated as a growth area under the Growth Plan for the Greater Golden Horseshoe", impact: "positive" },
        ],
        incentives: [
          { name: "Development Charge Deferral Program", description: "Halton Region offers phased payment of development charges for qualifying residential projects", estimated_value: "$200,000-$500,000" },
          { name: "Federal Housing Accelerator Fund", description: "Milton is a HAF-approved municipality — fast-tracked permitting for multi-residential", estimated_value: "Expedited approvals (4-6 month savings)" },
        ],
        regulatory_process: [
          { step: "Pre-application consultation", timeline: "2-3 weeks", agency: "Town of Milton Planning" },
          { step: "Draft Plan of Subdivision / Site Plan Application", timeline: "6-10 months", agency: "Town of Milton" },
          { step: "Building Permit", timeline: "4-8 weeks", agency: "Building Department" },
        ],
        estimated_timeline: "14-20 months",
        risks: [
          "Development charges in Halton Region are among Ontario's highest (~$80K per unit)",
          "Strong competition from established builders in the Milton area",
        ],
        zoning_details: { current_zoning: "Urban Expansion Area (Residential)", rezoning_required: false, rezoning_difficulty: "N/A" },
        environmental_impact: {
          ecological_sensitivity: "low",
          key_concerns: ["Stormwater management for downstream Sixteen Mile Creek"],
          required_studies: ["Environmental Impact Statement", "Stormwater Management Plan"],
          mitigation_measures: ["Low Impact Development (LID) stormwater features", "Tree preservation plan for existing woodlots"],
        },
        competition: {
          nearby_similar: [
            { name: "Mattamy Homes - Milton Meadows", distance_km: 3.2, status: "under_construction" },
            { name: "CountryWide Homes - Bristol Place", distance_km: 5.1, status: "built" },
          ],
          market_saturation: "moderate",
          demand_outlook: "Strong — Milton's population projected to grow 40% by 2031. Consistent demand for medium-density residential.",
        },
        construction_timeline: {
          pre_construction_months: 12,
          construction_months: 18,
          total_months: 30,
          seasonal_considerations: "Begin earthwork by April to maximize the construction season. Foundation work should be completed before November frost.",
          key_milestones: [
            { phase: "Site Preparation & Grading", duration: "2-3 months" },
            { phase: "Foundation & Underground", duration: "3-4 months" },
            { phase: "Structural Framing", duration: "4-6 months" },
            { phase: "Finishing & Landscaping", duration: "3-5 months" },
          ],
        },
      },
      {
        rank: 2,
        location_name: "Kitchener, Waterloo Region",
        lat: 43.4516,
        lng: -80.4925,
        score: 78,
        rationale:
          "Kitchener offers excellent value with lower land costs than the GTA and strong rental demand from University of Waterloo and Wilfrid Laurier students and tech sector workers. The Innovation District has seen rapid intensification with municipal support for mid-rise residential.",
        applicable_laws: [
          { law: "Planning Act (Ontario)", relevance: "Standard residential development approvals process applies", impact: "neutral" },
          { law: "Waterloo Region Official Plan", relevance: "Kitchener core areas designated for intensification — supportive policy framework", impact: "positive" },
        ],
        incentives: [
          { name: "Community Improvement Plan (CIP) Tax Grant", description: "Up to 100% tax increment grant for 10 years on intensification projects in designated areas", estimated_value: "$150,000-$400,000" },
        ],
        regulatory_process: [
          { step: "Pre-consultation meeting", timeline: "2-3 weeks", agency: "City of Kitchener Planning" },
          { step: "Site Plan Application & Approval", timeline: "4-8 months", agency: "City of Kitchener" },
          { step: "Building Permit Issuance", timeline: "4-6 weeks", agency: "Building Department" },
        ],
        estimated_timeline: "10-16 months",
        risks: [
          "Some areas near universities have infrastructure capacity constraints",
          "Heritage district designations may limit building heights in certain blocks",
        ],
        zoning_details: { current_zoning: "Mixed Use Corridor (MU-2)", rezoning_required: false, rezoning_difficulty: "N/A" },
        environmental_impact: {
          ecological_sensitivity: "low",
          key_concerns: ["Urban infill — standard Phase 1 ESA recommended"],
          required_studies: ["Phase 1 Environmental Site Assessment", "Noise & Vibration Study (near LRT)"],
          mitigation_measures: ["Noise attenuation measures for units facing King Street", "Green roof or rooftop amenity to manage stormwater"],
        },
        competition: {
          nearby_similar: [
            { name: "Charlesmark Condos", distance_km: 1.8, status: "built" },
            { name: "DTK Condos - Phase 2", distance_km: 0.5, status: "under_construction" },
          ],
          market_saturation: "moderate",
          demand_outlook: "Strong — tech sector growth and ION LRT driving intensification demand in downtown Kitchener.",
        },
        construction_timeline: {
          pre_construction_months: 8,
          construction_months: 16,
          total_months: 24,
          seasonal_considerations: "Urban infill benefits from year-round construction access. Target spring start for optimal scheduling.",
          key_milestones: [
            { phase: "Demolition & Site Prep", duration: "1-2 months" },
            { phase: "Excavation & Foundation", duration: "3-4 months" },
            { phase: "Structural & Envelope", duration: "5-6 months" },
            { phase: "Interior Finishing", duration: "4-5 months" },
          ],
        },
      },
      {
        rank: 3,
        location_name: "Barrie, Simcoe County",
        lat: 44.3894,
        lng: -79.6903,
        score: 71,
        rationale:
          "Barrie is a rapidly growing city on the edge of the GTA with more affordable land prices. The city's south end has designated growth areas with pre-serviced land suitable for residential development. Strong commuter demand driven by GO Transit connectivity to Toronto.",
        applicable_laws: [
          { law: "Lake Simcoe Protection Plan", relevance: "Development near Lake Simcoe requires phosphorus reduction measures", impact: "negative" },
          { law: "Growth Plan for the Greater Golden Horseshoe", relevance: "Barrie designated as upper-tier urban growth centre — supportive of intensification", impact: "positive" },
        ],
        incentives: [
          { name: "Barrie CIP Brownfield Tax Assistance", description: "Tax assistance for brownfield remediation and development in designated areas", estimated_value: "$50,000-$150,000" },
        ],
        regulatory_process: [
          { step: "Pre-application consultation", timeline: "2-4 weeks", agency: "City of Barrie Planning" },
          { step: "Zoning By-law Amendment (if needed)", timeline: "6-10 months", agency: "City of Barrie" },
          { step: "Site Plan Approval", timeline: "3-6 months", agency: "City of Barrie" },
          { step: "Building Permit", timeline: "6-8 weeks", agency: "Building Department" },
        ],
        estimated_timeline: "16-24 months",
        risks: [
          "Lake Simcoe Protection Plan adds environmental compliance costs",
          "Seasonal construction challenges due to northern location",
          "Rezoning may be required depending on specific parcel",
        ],
        zoning_details: { current_zoning: "Residential Growth Area (R3)", rezoning_required: true, rezoning_difficulty: "moderate" },
        environmental_impact: {
          ecological_sensitivity: "moderate",
          key_concerns: ["Lake Simcoe watershed protection requirements", "Potential wetland adjacency in southern growth areas"],
          required_studies: ["Environmental Impact Statement", "Stormwater Management Plan", "Phosphorus Budget Analysis"],
          mitigation_measures: ["Enhanced stormwater treatment to meet LSPP phosphorus targets", "30m vegetation buffer from any identified wetlands", "Low Impact Development (LID) measures"],
        },
        competition: {
          nearby_similar: [{ name: "Sage Prestige Homes - South Barrie", distance_km: 2.5, status: "under_construction" }],
          market_saturation: "low",
          demand_outlook: "Growing — Barrie's affordability advantage and GO Transit expansion drive steady demand. Less competition than GTA suburbs.",
        },
        construction_timeline: {
          pre_construction_months: 14,
          construction_months: 18,
          total_months: 32,
          seasonal_considerations: "Shorter construction season due to northern climate. Plan for winter weather delays in framing phase. Excavation should start by May.",
          key_milestones: [
            { phase: "Environmental Approvals", duration: "4-6 months" },
            { phase: "Site Servicing & Grading", duration: "3-4 months" },
            { phase: "Building Construction", duration: "10-14 months" },
            { phase: "Landscaping & Occupancy", duration: "2-3 months" },
          ],
        },
      },
    ] as RecommendedLocation[],
    overall_summary:
      "Based on analysis of 47 zones across Southern Ontario, Milton, Kitchener, and Barrie present the strongest opportunities for a medium-scale residential complex. Milton leads with its high growth trajectory and pre-designated expansion areas. Kitchener offers the fastest path to market with lower land costs and strong rental demand. Barrie provides the most affordable entry point with less competition but requires more regulatory navigation.",
    key_considerations: [
      "Development charges vary significantly — Milton is highest at ~$80K/unit, Kitchener and Barrie are more moderate",
      "All three locations benefit from provincial growth designation, supporting faster approvals",
      "Lake Simcoe Protection Plan adds $50-100K in environmental compliance costs for Barrie",
      "Federal Housing Accelerator Fund benefits apply to Milton and potentially Kitchener",
      "Market absorption rates favor Milton and Kitchener for faster sales/lease-up",
    ],
  },
};

export default function DemoRecommendPage() {
  const [state, setState] = useState<PageState>("idle");
  const [result, setResult] = useState<typeof MOCK_RESPONSE | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeLocation, setActiveLocation] = useState<RecommendedLocation | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const handleSubmit = useCallback(async (_formData: RecommendRequest) => {
    setState("loading");
    setError(null);
    setResult(null);

    // Simulate AI processing time (matches CloudinaryLoader animation)
    await new Promise((r) => setTimeout(r, 5000));

    setResult(MOCK_RESPONSE);
    setState("results");
    setExpandedCard(0);
  }, []);

  const handleCardClick = (location: RecommendedLocation, index: number) => {
    setActiveLocation(location);
    setExpandedCard(expandedCard === index ? null : index);
  };

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setActiveLocation(null);
    setExpandedCard(null);
    setError(null);
  };

  const recs = result?.recommendations.recommendations || [];

  /* ── Side panel loader (identical to recommend page) ── */
  function SidePanelLoader() {
    const LOAD_STEPS = [
      { label: "Scanning zoning databases", time: 400 },
      { label: "Cross-referencing environmental data", time: 400 },
      { label: "Evaluating regulatory frameworks", time: 400 },
      { label: "Analyzing market competition", time: 500 },
      { label: "Checking development incentives", time: 300 },
      { label: "Assessing construction timelines", time: 400 },
      { label: "Running AI site selection model", time: 600 },
      { label: "Compiling final recommendations", time: 500 },
    ];
    const totalTime = LOAD_STEPS.reduce((s, t) => s + t.time, 0);
    const startRef = useRef(Date.now());
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
      const tick = () => {
        setElapsed(Date.now() - startRef.current);
        requestAnimationFrame(tick);
      };
      const id = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(id);
    }, []);

    let acc = 0;
    let step = LOAD_STEPS.length - 1;
    for (let i = 0; i < LOAD_STEPS.length; i++) {
      if (elapsed < acc + LOAD_STEPS[i].time) { step = i; break; }
      acc += LOAD_STEPS[i].time;
    }
    const pct = Math.min(Math.round((elapsed / totalTime) * 100), 100);

    return (
      <div className="py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center relative">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">AI Analysis in Progress</h2>
            <p className="text-xs text-muted">{pct}% complete</p>
          </div>
        </div>

        <div className="w-20 h-20 mx-auto mb-5 relative">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e8ede9" strokeWidth="5" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#2D6A4F" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground tabular-nums">{pct}%</span>
          </div>
        </div>

        <div className="space-y-2">
          {LOAD_STEPS.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-500 ${
              i < step ? "bg-primary/5" : i === step ? "bg-primary/8 border border-primary/15" : "opacity-40"
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                i < step ? "bg-primary text-white" : i === step ? "border-2 border-primary" : "border border-border"
              }`}>
                {i < step ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : i === step ? (
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                ) : null}
              </div>
              <span className={`text-xs ${i <= step ? "text-foreground font-medium" : "text-muted"}`}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 w-full h-1.5 bg-border-light rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>

        <p className="text-center text-[11px] text-muted mt-3">
          AI is powering your plans — hang tight!
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar />

      {/* Top toolbar */}
      <div className="h-14 border-b border-border bg-surface flex items-center px-6 gap-4">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          <span className="text-sm font-semibold text-foreground">Smart Recommend</span>
        </div>
        {state === "results" && (
          <button onClick={handleReset} className="text-xs text-primary hover:text-primary-dark transition-colors font-medium">
            New Search
          </button>
        )}
        {state === "results" && result && (
          <span className="text-xs text-muted ml-auto">
            {result.candidates_analyzed} zones analyzed
          </span>
        )}
      </div>

      {/* Main content: map + panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map area */}
        <div className="flex-1 p-3 relative">
          <RecommendMap
            locations={recs}
            activeLocation={activeLocation}
            onMarkerClick={(loc) => {
              const idx = recs.findIndex((r) => r.rank === loc.rank);
              if (idx >= 0) handleCardClick(loc, idx);
            }}
          />
          {/* Loading overlay */}
          {state === "loading" && (
            <div className="absolute inset-3 z-20 rounded-xl overflow-hidden">
              <CloudinaryLoader />
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="w-[420px] border-l border-border bg-surface overflow-y-auto">
          <div className="p-5">
            {/* Form state */}
            {state === "idle" && (
              <RecommendForm onSubmit={handleSubmit} error={error} />
            )}

            {/* Loading state */}
            {state === "loading" && <SidePanelLoader />}

            {/* Results state */}
            {state === "results" && result && (
              <>
                <div className="mb-5">
                  <h2 className="text-base font-semibold text-foreground">
                    {recs.length} Location{recs.length !== 1 ? "s" : ""} Found
                  </h2>
                  <p className="text-sm text-foreground mt-2 leading-relaxed">
                    {result.recommendations.overall_summary}
                  </p>
                </div>

                <div className="space-y-3">
                  {recs.map((rec, i) => (
                    <RecommendCard
                      key={rec.rank}
                      recommendation={rec}
                      isExpanded={expandedCard === i}
                      isActive={activeLocation?.rank === rec.rank}
                      onClick={() => handleCardClick(rec, i)}
                    />
                  ))}
                </div>

                {result.recommendations.key_considerations &&
                  result.recommendations.key_considerations.length > 0 && (
                    <div className="mt-6 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                        Key Considerations
                      </h3>
                      <ul className="space-y-1.5">
                        {result.recommendations.key_considerations.map((c, i) => (
                          <li key={i} className="text-xs text-foreground flex gap-2">
                            <span className="text-primary shrink-0">-</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                <button
                  onClick={handleReset}
                  className="w-full mt-5 py-2.5 border border-border rounded-lg text-sm font-medium text-muted hover:text-foreground hover:border-primary/30 transition-colors"
                >
                  Start New Search
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
