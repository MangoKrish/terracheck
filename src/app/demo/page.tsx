"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ScoreIndicator from "@/components/ScoreIndicator";
import CategoryCard from "@/components/CategoryCard";
import AssessLoader from "@/components/AssessLoader";

/* ══════════════════════════════════════════════
   MOCK DATA — completely static, no backend needed
   ══════════════════════════════════════════════ */

const MOCK_ASSESSMENT = {
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
    critical_blockers: [],
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
      {
        title: "No Flood Risk Detected",
        description:
          "The site is well outside any mapped floodplain boundaries. No flood mitigation measures are required.",
      },
      {
        title: "No Contamination Records",
        description:
          "No Environmental Site Registry records found within the search radius. Phase 1 ESA is still recommended as standard practice.",
      },
      {
        title: "No Infrastructure Conflicts",
        description:
          "No existing major infrastructure (universities, hospitals, government buildings) detected within the search radius that would block development.",
      },
    ],
    regulatory_pathway: [
      {
        step: "Pre-consultation with Municipality",
        timeline: "2-4 weeks",
        agency: "City of Hamilton Planning Dept.",
      },
      {
        step: "Zoning By-law Amendment Application",
        timeline: "6-12 months",
        agency: "Municipal Council",
      },
      {
        step: "Greenbelt Plan Conformity Review",
        timeline: "3-6 months",
        agency: "Ministry of Municipal Affairs",
      },
      {
        step: "Site Plan Approval",
        timeline: "3-6 months",
        agency: "City of Hamilton",
      },
      {
        step: "Building Permit Issuance",
        timeline: "4-8 weeks",
        agency: "Building Dept.",
      },
    ],
    mitigations: [
      {
        issue: "Greenbelt overlap",
        action:
          "Engage a planner experienced with Greenbelt Plan applications. Consider focusing development on the 60% of the site outside the Greenbelt boundary.",
        cost_estimate: "$15,000-$25,000",
      },
      {
        issue: "Rezoning required",
        action:
          "Prepare a comprehensive Planning Justification Report with traffic impact study and servicing report.",
        cost_estimate: "$20,000-$40,000",
      },
    ],
    estimated_timeline: "18-30 months from application to construction start",
    categories: {
      flood_risk: {
        status: "clear" as const,
        summary:
          "No flood zone boundaries intersect the search area. Low flood risk.",
      },
      zoning: {
        status: "warning" as const,
        summary:
          "Currently zoned Agricultural (A1). Rezoning amendment required for most development types.",
      },
      protected_areas: {
        status: "clear" as const,
        summary:
          "No provincial or federal protected areas overlap with this location.",
      },
      contamination: {
        status: "clear" as const,
        summary:
          "No brownfield or contaminated site records found in the Environmental Site Registry.",
      },
      indigenous_lands: {
        status: "clear" as const,
        summary:
          "Located within Treaty 3 lands. Standard duty-to-consult requirements apply but no active land claims in the immediate area.",
      },
      greenbelt: {
        status: "warning" as const,
        summary:
          "Partial overlap with the Ontario Greenbelt. Development requires conformity review under the Greenbelt Plan.",
      },
      infrastructure: {
        status: "clear" as const,
        summary:
          "No major existing infrastructure (universities, hospitals, government offices) found within the search radius.",
      },
    },
  },
};

const MOCK_RECOMMENDATIONS = {
  project_requirements: {
    org_type: "private_company",
    project_type: "residential_complex",
    scale: "medium",
    budget: "5000000",
    priority: "roi",
    region: "southern_ontario",
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
          {
            law: "Planning Act (Ontario)",
            relevance:
              "Governs subdivision and site plan approvals for residential development",
            impact: "neutral",
          },
          {
            law: "Places to Grow Act",
            relevance:
              "Milton is designated as a growth area under the Growth Plan for the Greater Golden Horseshoe",
            impact: "positive",
          },
        ],
        incentives: [
          {
            name: "Development Charge Deferral Program",
            description:
              "Halton Region offers phased payment of development charges for qualifying residential projects",
            estimated_value: "$200,000-$500,000",
          },
          {
            name: "Federal Housing Accelerator Fund",
            description:
              "Milton is a HAF-approved municipality — fast-tracked permitting for multi-residential",
            estimated_value: "Expedited approvals (4-6 month savings)",
          },
        ],
        regulatory_process: [
          {
            step: "Pre-application consultation",
            timeline: "2-3 weeks",
            agency: "Town of Milton Planning",
          },
          {
            step: "Draft Plan of Subdivision / Site Plan Application",
            timeline: "6-10 months",
            agency: "Town of Milton",
          },
          {
            step: "Building Permit",
            timeline: "4-8 weeks",
            agency: "Building Department",
          },
        ],
        estimated_timeline: "14-20 months",
        risks: [
          "Development charges in Halton Region are among Ontario's highest (~$80K per unit)",
          "Strong competition from established builders in the Milton area",
        ],
        zoning_details: {
          current_zoning: "Urban Expansion Area (Residential)",
          rezoning_required: false,
          rezoning_difficulty: "N/A",
        },
        environmental_impact: {
          ecological_sensitivity: "low",
          key_concerns: [
            "Stormwater management for downstream Sixteen Mile Creek",
          ],
          required_studies: [
            "Environmental Impact Statement",
            "Stormwater Management Plan",
          ],
          mitigation_measures: [
            "Low Impact Development (LID) stormwater features",
            "Tree preservation plan for existing woodlots",
          ],
        },
        competition: {
          nearby_similar: [
            {
              name: "Mattamy Homes - Milton Meadows",
              distance_km: 3.2,
              status: "under_construction",
            },
            {
              name: "CountryWide Homes - Bristol Place",
              distance_km: 5.1,
              status: "built",
            },
          ],
          market_saturation: "moderate",
          demand_outlook:
            "Strong — Milton's population projected to grow 40% by 2031. Consistent demand for medium-density residential.",
        },
        construction_timeline: {
          pre_construction_months: 12,
          construction_months: 18,
          total_months: 30,
          seasonal_considerations:
            "Begin earthwork by April to maximize the construction season. Foundation work should be completed before November frost.",
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
          {
            law: "Planning Act (Ontario)",
            relevance:
              "Standard residential development approvals process applies",
            impact: "neutral",
          },
          {
            law: "Waterloo Region Official Plan",
            relevance:
              "Kitchener core areas designated for intensification — supportive policy framework",
            impact: "positive",
          },
        ],
        incentives: [
          {
            name: "Community Improvement Plan (CIP) Tax Grant",
            description:
              "Up to 100% tax increment grant for 10 years on intensification projects in designated areas",
            estimated_value: "$150,000-$400,000",
          },
        ],
        regulatory_process: [
          {
            step: "Pre-consultation meeting",
            timeline: "2-3 weeks",
            agency: "City of Kitchener Planning",
          },
          {
            step: "Site Plan Application & Approval",
            timeline: "4-8 months",
            agency: "City of Kitchener",
          },
          {
            step: "Building Permit Issuance",
            timeline: "4-6 weeks",
            agency: "Building Department",
          },
        ],
        estimated_timeline: "10-16 months",
        risks: [
          "Some areas near universities have infrastructure capacity constraints",
          "Heritage district designations may limit building heights in certain blocks",
        ],
        zoning_details: {
          current_zoning: "Mixed Use Corridor (MU-2)",
          rezoning_required: false,
          rezoning_difficulty: "N/A",
        },
        environmental_impact: {
          ecological_sensitivity: "low",
          key_concerns: [
            "Urban infill — standard Phase 1 ESA recommended",
          ],
          required_studies: [
            "Phase 1 Environmental Site Assessment",
            "Noise & Vibration Study (near LRT)",
          ],
          mitigation_measures: [
            "Noise attenuation measures for units facing King Street",
            "Green roof or rooftop amenity to manage stormwater",
          ],
        },
        competition: {
          nearby_similar: [
            {
              name: "Charlesmark Condos",
              distance_km: 1.8,
              status: "built",
            },
            {
              name: "DTK Condos - Phase 2",
              distance_km: 0.5,
              status: "under_construction",
            },
          ],
          market_saturation: "moderate",
          demand_outlook:
            "Strong — tech sector growth and ION LRT driving intensification demand in downtown Kitchener.",
        },
        construction_timeline: {
          pre_construction_months: 8,
          construction_months: 16,
          total_months: 24,
          seasonal_considerations:
            "Urban infill benefits from year-round construction access. Target spring start for optimal scheduling.",
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
          {
            law: "Lake Simcoe Protection Plan",
            relevance:
              "Development near Lake Simcoe requires phosphorus reduction measures",
            impact: "negative",
          },
          {
            law: "Growth Plan for the Greater Golden Horseshoe",
            relevance:
              "Barrie designated as upper-tier urban growth centre — supportive of intensification",
            impact: "positive",
          },
        ],
        incentives: [
          {
            name: "Barrie CIP Brownfield Tax Assistance",
            description:
              "Tax assistance for brownfield remediation and development in designated areas",
            estimated_value: "$50,000-$150,000",
          },
        ],
        regulatory_process: [
          {
            step: "Pre-application consultation",
            timeline: "2-4 weeks",
            agency: "City of Barrie Planning",
          },
          {
            step: "Zoning By-law Amendment (if needed)",
            timeline: "6-10 months",
            agency: "City of Barrie",
          },
          {
            step: "Site Plan Approval",
            timeline: "3-6 months",
            agency: "City of Barrie",
          },
          {
            step: "Building Permit",
            timeline: "6-8 weeks",
            agency: "Building Department",
          },
        ],
        estimated_timeline: "16-24 months",
        risks: [
          "Lake Simcoe Protection Plan adds environmental compliance costs",
          "Seasonal construction challenges due to northern location",
          "Rezoning may be required depending on specific parcel",
        ],
        zoning_details: {
          current_zoning: "Residential Growth Area (R3)",
          rezoning_required: true,
          rezoning_difficulty: "moderate",
        },
        environmental_impact: {
          ecological_sensitivity: "moderate",
          key_concerns: [
            "Lake Simcoe watershed protection requirements",
            "Potential wetland adjacency in southern growth areas",
          ],
          required_studies: [
            "Environmental Impact Statement",
            "Stormwater Management Plan",
            "Phosphorus Budget Analysis",
          ],
          mitigation_measures: [
            "Enhanced stormwater treatment to meet LSPP phosphorus targets",
            "30m vegetation buffer from any identified wetlands",
            "Low Impact Development (LID) measures",
          ],
        },
        competition: {
          nearby_similar: [
            {
              name: "Sage Prestige Homes - South Barrie",
              distance_km: 2.5,
              status: "under_construction",
            },
          ],
          market_saturation: "low",
          demand_outlook:
            "Growing — Barrie's affordability advantage and GO Transit expansion drive steady demand. Less competition than GTA suburbs.",
        },
        construction_timeline: {
          pre_construction_months: 14,
          construction_months: 18,
          total_months: 32,
          seasonal_considerations:
            "Shorter construction season due to northern climate. Plan for winter weather delays in framing phase. Excavation should start by May.",
          key_milestones: [
            { phase: "Environmental Approvals", duration: "4-6 months" },
            { phase: "Site Servicing & Grading", duration: "3-4 months" },
            { phase: "Building Construction", duration: "10-14 months" },
            { phase: "Landscaping & Occupancy", duration: "2-3 months" },
          ],
        },
      },
    ],
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

const CATEGORY_MAP: Record<string, string> = {
  flood_risk: "Flood Risk",
  zoning: "Zoning Compatibility",
  protected_areas: "Protected Areas",
  contamination: "Contaminated Sites",
  indigenous_lands: "Indigenous Lands",
  greenbelt: "Greenbelt",
  infrastructure: "Nearby Infrastructure",
};

/* ══════════════════════════════════════════════ */

type DemoMode = "select" | "assess-loading" | "assess-results" | "recommend-results";

export default function DemoPage() {
  const [mode, setMode] = useState<DemoMode>("select");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startAssessDemo = useCallback(() => {
    setMode("assess-loading");
    timerRef.current = setTimeout(() => {
      setMode("assess-results");
    }, 4200);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const assessment = MOCK_ASSESSMENT.assessment;
  const geoData = MOCK_ASSESSMENT.geo_data;
  const recs = MOCK_RECOMMENDATIONS.recommendations.recommendations;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Top banner */}
      <div className="bg-primary/5 border-b border-primary/15">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">Demo Mode</span>
            <span className="text-xs text-muted">— preset data, no backend required</span>
          </div>
          <Link href="/" className="text-xs text-primary hover:text-primary-dark font-medium transition-colors">
            Back to Home
          </Link>
        </div>
      </div>

      {/* ── SELECT MODE ── */}
      {mode === "select" && (
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground">TerraCheck Demo</h1>
            <p className="text-muted mt-3 max-w-lg mx-auto">
              Experience the full assessment and recommendation workflow with preset data. No backend or login required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Assessment demo */}
            <button
              onClick={startAssessDemo}
              className="group p-6 rounded-2xl border border-border bg-surface hover:border-primary/30 hover:shadow-lg transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Land Assessment</h3>
              <p className="text-sm text-muted leading-relaxed mb-3">
                See a full viability report for a location near Hamilton, ON — complete with loading animation, score, categories, and regulatory pathway.
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                Run Demo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </button>

            {/* Recommendation demo */}
            <button
              onClick={() => setMode("recommend-results")}
              className="group p-6 rounded-2xl border border-border bg-surface hover:border-primary/30 hover:shadow-lg transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">AI Site Finder</h3>
              <p className="text-sm text-muted leading-relaxed mb-3">
                View AI-generated site recommendations for a residential complex in Southern Ontario — with scores, laws, environment, and timelines.
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                View Results
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── ASSESSMENT LOADING ── */}
      {mode === "assess-loading" && (
        <div className="max-w-lg mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-sm font-semibold text-foreground">Land Assessment</span>
            </div>
            <span className="text-xs text-muted">Hamilton, ON — 43.2557°N, 79.8711°W</span>
          </div>
          <div className="bg-surface rounded-xl border border-border p-5">
            <AssessLoader />
          </div>
        </div>
      )}

      {/* ── ASSESSMENT RESULTS ── */}
      {mode === "assess-results" && (
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <span className="text-sm font-semibold text-foreground">Hamilton, Ontario</span>
                <span className="text-xs text-muted ml-2">43.2557°N, 79.8711°W</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">{geoData.layers_intersecting}/{geoData.layers_queried} layers intersect</span>
              <button
                onClick={() => setMode("select")}
                className="text-xs text-primary hover:text-primary-dark font-medium transition-colors"
              >
                Back to Demo Menu
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column — Score + Categories */}
            <div className="lg:col-span-1 space-y-5">
              <div className="bg-surface rounded-xl border border-border p-5">
                <ScoreIndicator score={assessment.overall_score} />
                <p className="text-sm text-muted mt-3 leading-relaxed">{assessment.summary}</p>
              </div>

              <div className="bg-surface rounded-xl border border-border p-5">
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
            </div>

            {/* Right column — Details */}
            <div className="lg:col-span-2 space-y-5">
              {/* Warnings */}
              {assessment.warnings.length > 0 && (
                <div className="bg-surface rounded-xl border border-border p-5">
                  <h3 className="text-xs font-semibold text-status-warning uppercase tracking-wider mb-3">Warnings</h3>
                  <div className="space-y-2">
                    {assessment.warnings.map((w, i) => (
                      <div key={i} className="p-3 bg-status-warning/5 border border-status-warning/15 rounded-lg">
                        <p className="text-sm font-medium text-foreground">{w.title}</p>
                        <p className="text-xs text-muted mt-1">{w.description}</p>
                        {w.regulation && (
                          <p className="text-xs text-status-warning/70 mt-1 italic">{w.regulation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Green flags */}
              {assessment.green_flags.length > 0 && (
                <div className="bg-surface rounded-xl border border-border p-5">
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
              <div className="bg-surface rounded-xl border border-border p-5">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Regulatory Pathway</h3>
                <div className="space-y-2">
                  {assessment.regulatory_pathway.map((step, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-background rounded-lg border border-border-light">
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

              {/* Mitigations */}
              <div className="bg-surface rounded-xl border border-border p-5">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Recommended Mitigations</h3>
                <div className="space-y-2">
                  {assessment.mitigations.map((m, i) => (
                    <div key={i} className="p-3 bg-background rounded-lg border border-border-light">
                      <p className="text-sm font-medium text-foreground">{m.issue}</p>
                      <p className="text-xs text-muted mt-1">{m.action}</p>
                      <p className="text-xs text-primary font-medium mt-1">Est. cost: {m.cost_estimate}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="p-4 bg-primary/5 border border-primary/15 rounded-xl">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Estimated Timeline</p>
                <p className="text-sm text-foreground">{assessment.estimated_timeline}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RECOMMENDATION RESULTS ── */}
      {mode === "recommend-results" && (
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
              <div>
                <span className="text-sm font-semibold text-foreground">AI Site Finder Results</span>
                <span className="text-xs text-muted ml-2">Residential Complex · Southern Ontario</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">{MOCK_RECOMMENDATIONS.candidates_analyzed} zones analyzed</span>
              <button
                onClick={() => setMode("select")}
                className="text-xs text-primary hover:text-primary-dark font-medium transition-colors"
              >
                Back to Demo Menu
              </button>
            </div>
          </div>

          {/* Overall summary */}
          <div className="bg-surface rounded-xl border border-border p-5 mb-6">
            <h2 className="text-base font-semibold text-foreground mb-2">
              {recs.length} Locations Found
            </h2>
            <p className="text-sm text-foreground leading-relaxed">
              {MOCK_RECOMMENDATIONS.recommendations.overall_summary}
            </p>
          </div>

          {/* Recommendation cards */}
          <div className="space-y-4">
            {recs.map((rec) => (
              <DemoRecommendCard key={rec.rank} rec={rec} />
            ))}
          </div>

          {/* Key considerations */}
          {MOCK_RECOMMENDATIONS.recommendations.key_considerations.length > 0 && (
            <div className="mt-6 p-5 bg-primary/5 border border-primary/20 rounded-xl">
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                Key Considerations
              </h3>
              <ul className="space-y-2">
                {MOCK_RECOMMENDATIONS.recommendations.key_considerations.map((c, i) => (
                  <li key={i} className="text-sm text-foreground flex gap-2">
                    <span className="text-primary shrink-0">-</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Inline RecommendCard for demo (no import dependency on API types) ── */

function getScoreColor(score: number) {
  if (score >= 80) return "text-status-clear bg-status-clear/10";
  if (score >= 60) return "text-primary bg-primary/10";
  if (score >= 40) return "text-status-warning bg-status-warning/10";
  return "text-status-critical bg-status-critical/10";
}

function getImpactBadge(impact: string) {
  if (impact === "positive") return "text-status-clear bg-status-clear/10";
  if (impact === "negative") return "text-status-critical bg-status-critical/10";
  return "text-muted bg-border-light";
}

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "laws", label: "Laws & Incentives" },
  { key: "environment", label: "Environment" },
  { key: "competition", label: "Competition" },
  { key: "timeline", label: "Timeline" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function DemoRecommendCard({ rec }: { rec: typeof MOCK_RECOMMENDATIONS.recommendations.recommendations[0] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`rounded-xl border transition-all cursor-pointer ${
        isExpanded
          ? "border-primary bg-primary/3 shadow-sm"
          : "border-border bg-surface hover:border-primary/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${isExpanded ? "bg-primary-dark" : "bg-primary"}`}>
          {rec.rank}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{rec.location_name}</p>
          <p className="text-xs text-muted truncate">{rec.zoning_details.current_zoning}</p>
        </div>
        <div className={`px-2.5 py-1 rounded-lg text-sm font-bold shrink-0 ${getScoreColor(rec.score)}`}>
          {rec.score}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-border-light">
          <div className="flex overflow-x-auto px-3 pt-2 gap-0.5 border-b border-border-light">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={(e) => { e.stopPropagation(); setActiveTab(tab.key); }}
                className={`px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap rounded-t-md transition-colors ${
                  activeTab === tab.key
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            {/* Overview */}
            {activeTab === "overview" && (
              <>
                <p className="text-sm text-foreground leading-relaxed">{rec.rationale}</p>
                <div className="flex gap-2">
                  {rec.estimated_timeline && (
                    <div className="flex-1 p-2 bg-primary/5 border border-primary/15 rounded-lg">
                      <p className="text-[10px] font-semibold text-primary uppercase mb-0.5">Regulatory Timeline</p>
                      <p className="text-xs text-foreground">{rec.estimated_timeline}</p>
                    </div>
                  )}
                  <div className="flex-1 p-2 bg-background border border-border-light rounded-lg">
                    <p className="text-[10px] font-semibold text-muted uppercase mb-0.5">Rezoning</p>
                    <p className="text-xs text-foreground">
                      {rec.zoning_details.rezoning_required
                        ? <span className="text-status-warning">Required ({rec.zoning_details.rezoning_difficulty})</span>
                        : <span className="text-status-clear">Not required</span>}
                    </p>
                  </div>
                </div>
                {rec.risks.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-status-warning uppercase tracking-wider mb-1.5">Risks</h4>
                    <ul className="space-y-1">
                      {rec.risks.map((risk, i) => (
                        <li key={i} className="text-xs text-muted flex gap-1.5">
                          <span className="text-status-warning shrink-0">!</span>{risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Laws & Incentives */}
            {activeTab === "laws" && (
              <>
                {rec.applicable_laws.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Applicable Laws</h4>
                    <div className="space-y-1.5">
                      {rec.applicable_laws.map((law, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0 mt-0.5 ${getImpactBadge(law.impact)}`}>{law.impact}</span>
                          <div>
                            <p className="text-xs font-medium text-foreground">{law.law}</p>
                            <p className="text-xs text-muted">{law.relevance}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {rec.incentives.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-status-clear uppercase tracking-wider mb-2">Available Incentives</h4>
                    <div className="space-y-2">
                      {rec.incentives.map((inc, i) => (
                        <div key={i} className="p-2.5 bg-status-clear/5 border border-status-clear/15 rounded-lg">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-foreground">{inc.name}</p>
                            <span className="text-[10px] font-semibold text-status-clear bg-status-clear/10 px-1.5 py-0.5 rounded">{inc.estimated_value}</span>
                          </div>
                          <p className="text-xs text-muted mt-0.5">{inc.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {rec.regulatory_process.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Regulatory Process</h4>
                    <div className="space-y-1.5">
                      {rec.regulatory_process.map((step, i) => (
                        <div key={i} className="flex gap-2.5 p-2 bg-background rounded-lg border border-border-light">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-primary">{i + 1}</div>
                          <div>
                            <p className="text-xs text-foreground">{step.step}</p>
                            <p className="text-[10px] text-muted">{step.timeline} · {step.agency}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Environment */}
            {activeTab === "environment" && rec.environmental_impact && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted uppercase">Ecological Sensitivity:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    rec.environmental_impact.ecological_sensitivity === "high" ? "text-status-critical bg-status-critical/10"
                    : rec.environmental_impact.ecological_sensitivity === "moderate" ? "text-status-warning bg-status-warning/10"
                    : "text-status-clear bg-status-clear/10"
                  }`}>{rec.environmental_impact.ecological_sensitivity}</span>
                </div>
                {rec.environmental_impact.key_concerns.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Key Environmental Concerns</h4>
                    <ul className="space-y-1">
                      {rec.environmental_impact.key_concerns.map((c, i) => (
                        <li key={i} className="text-xs text-foreground flex gap-1.5"><span className="text-status-warning shrink-0">~</span>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {rec.environmental_impact.required_studies.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Required Studies</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.environmental_impact.required_studies.map((s, i) => (
                        <span key={i} className="px-2 py-1 text-[11px] bg-primary/5 border border-primary/15 rounded-md text-foreground">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {rec.environmental_impact.mitigation_measures.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-status-clear uppercase tracking-wider mb-1.5">Mitigation Measures</h4>
                    <ul className="space-y-1">
                      {rec.environmental_impact.mitigation_measures.map((m, i) => (
                        <li key={i} className="text-xs text-foreground flex gap-1.5"><span className="text-status-clear shrink-0">+</span>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Competition */}
            {activeTab === "competition" && rec.competition && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted uppercase">Market Saturation:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    rec.competition.market_saturation === "high" ? "text-status-critical bg-status-critical/10"
                    : rec.competition.market_saturation === "moderate" ? "text-status-warning bg-status-warning/10"
                    : "text-status-clear bg-status-clear/10"
                  }`}>{rec.competition.market_saturation}</span>
                </div>
                <div className="p-2.5 bg-primary/5 border border-primary/15 rounded-lg">
                  <p className="text-[10px] font-semibold text-primary uppercase mb-0.5">Demand Outlook</p>
                  <p className="text-xs text-foreground">{rec.competition.demand_outlook}</p>
                </div>
                {rec.competition.nearby_similar.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Nearby Similar Projects</h4>
                    <div className="space-y-1.5">
                      {rec.competition.nearby_similar.map((proj, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-background rounded-lg border border-border-light">
                          <div>
                            <p className="text-xs font-medium text-foreground">{proj.name}</p>
                            <p className="text-[10px] text-muted">{proj.distance_km} km away</p>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            proj.status === "built" ? "text-status-clear bg-status-clear/10"
                            : proj.status === "under_construction" ? "text-status-warning bg-status-warning/10"
                            : "text-primary bg-primary/10"
                          }`}>{proj.status.replace(/_/g, " ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Timeline */}
            {activeTab === "timeline" && rec.construction_timeline && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-primary/5 border border-primary/15 rounded-lg text-center">
                    <p className="text-[10px] font-semibold text-primary uppercase">Pre-Con</p>
                    <p className="text-sm font-bold text-foreground">{rec.construction_timeline.pre_construction_months}mo</p>
                  </div>
                  <div className="p-2 bg-primary/5 border border-primary/15 rounded-lg text-center">
                    <p className="text-[10px] font-semibold text-primary uppercase">Build</p>
                    <p className="text-sm font-bold text-foreground">{rec.construction_timeline.construction_months}mo</p>
                  </div>
                  <div className="p-2 bg-primary-dark/10 border border-primary-dark/20 rounded-lg text-center">
                    <p className="text-[10px] font-semibold text-primary-dark uppercase">Total</p>
                    <p className="text-sm font-bold text-foreground">{rec.construction_timeline.total_months}mo</p>
                  </div>
                </div>
                <div className="p-2 bg-status-warning/5 border border-status-warning/15 rounded-lg">
                  <p className="text-[10px] font-semibold text-status-warning uppercase mb-0.5">Seasonal Considerations</p>
                  <p className="text-xs text-foreground">{rec.construction_timeline.seasonal_considerations}</p>
                </div>
                {rec.construction_timeline.key_milestones.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Key Milestones</h4>
                    <div className="space-y-1.5">
                      {rec.construction_timeline.key_milestones.map((ms, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-background rounded-lg border border-border-light">
                          <p className="text-xs text-foreground">{ms.phase}</p>
                          <span className="text-[10px] font-semibold text-muted">{ms.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
