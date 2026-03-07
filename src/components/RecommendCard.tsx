"use client";

import { useState } from "react";
import { type RecommendedLocation } from "@/lib/api";

interface RecommendCardProps {
  recommendation: RecommendedLocation;
  isExpanded: boolean;
  isActive: boolean;
  onClick: () => void;
}

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

export default function RecommendCard({
  recommendation: rec,
  isExpanded,
  isActive,
  onClick,
}: RecommendCardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border transition-all cursor-pointer ${
        isActive
          ? "border-primary bg-primary/3 shadow-sm"
          : "border-border bg-background hover:border-primary/30"
      }`}
    >
      {/* Header — always visible */}
      <div className="flex items-center gap-3 p-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${isActive ? "bg-primary-dark" : "bg-primary"}`}>
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

      {/* Expanded — tabbed content */}
      {isExpanded && (
        <div className="border-t border-border-light">
          {/* Tab bar */}
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

          {/* Tab content */}
          <div className="p-4 space-y-3" onClick={(e) => e.stopPropagation()}>

            {/* ── OVERVIEW ── */}
            {activeTab === "overview" && (<>
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
              {rec.risks && rec.risks.length > 0 && (
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
            </>)}

            {/* ── LAWS & INCENTIVES ── */}
            {activeTab === "laws" && (<>
              {rec.applicable_laws?.length > 0 && (
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
              {rec.incentives?.length > 0 && (
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
              {rec.regulatory_process?.length > 0 && (
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
            </>)}

            {/* ── ENVIRONMENT ── */}
            {activeTab === "environment" && (<>
              {rec.environmental_impact ? (<>
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
              </>) : (
                <p className="text-xs text-muted italic py-4 text-center">Environmental data not available. Connect Gemini API for full analysis.</p>
              )}
            </>)}

            {/* ── COMPETITION ── */}
            {activeTab === "competition" && (<>
              {rec.competition ? (<>
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
              </>) : (
                <p className="text-xs text-muted italic py-4 text-center">Competition data not available. Connect Gemini API for full analysis.</p>
              )}
            </>)}

            {/* ── TIMELINE ── */}
            {activeTab === "timeline" && (<>
              {rec.construction_timeline ? (<>
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
              </>) : (
                <p className="text-xs text-muted italic py-4 text-center">Timeline data not available. Connect Gemini API for full analysis.</p>
              )}
              {rec.special_conditions && rec.special_conditions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Special Conditions & Restrictions</h4>
                  <div className="space-y-1.5">
                    {rec.special_conditions.map((cond, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0 mt-0.5 ${getImpactBadge(cond.impact)}`}>{cond.impact}</span>
                        <div>
                          <p className="text-xs font-medium text-foreground capitalize">{cond.type.replace(/_/g, " ")}</p>
                          <p className="text-xs text-muted">{cond.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>)}
          </div>
        </div>
      )}
    </div>
  );
}
