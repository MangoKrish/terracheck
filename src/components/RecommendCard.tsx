"use client";

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

export default function RecommendCard({
  recommendation: rec,
  isExpanded,
  isActive,
  onClick,
}: RecommendCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border transition-all cursor-pointer ${
        isActive
          ? "border-primary bg-primary/3 shadow-sm"
          : "border-border bg-background hover:border-primary/30"
      }`}
    >
      {/* Collapsed header — always visible */}
      <div className="flex items-center gap-3 p-4">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${
            isActive ? "bg-primary-dark" : "bg-primary"
          }`}
        >
          {rec.rank}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {rec.location_name}
          </p>
          <p className="text-xs text-muted truncate">
            {rec.zoning_details.current_zoning}
          </p>
        </div>
        <div
          className={`px-2.5 py-1 rounded-lg text-sm font-bold shrink-0 ${getScoreColor(
            rec.score
          )}`}
        >
          {rec.score}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border-light pt-3">
          {/* Rationale */}
          <p className="text-sm text-foreground leading-relaxed">{rec.rationale}</p>

          {/* Applicable Laws */}
          {rec.applicable_laws && rec.applicable_laws.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Applicable Laws
              </h4>
              <div className="space-y-1.5">
                {rec.applicable_laws.map((law, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0 mt-0.5 ${getImpactBadge(
                        law.impact
                      )}`}
                    >
                      {law.impact}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-foreground">{law.law}</p>
                      <p className="text-xs text-muted">{law.relevance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Incentives */}
          {rec.incentives && rec.incentives.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-status-clear uppercase tracking-wider mb-2">
                Available Incentives
              </h4>
              <div className="space-y-2">
                {rec.incentives.map((inc, i) => (
                  <div key={i} className="p-2.5 bg-status-clear/5 border border-status-clear/15 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">{inc.name}</p>
                      <span className="text-[10px] font-semibold text-status-clear bg-status-clear/10 px-1.5 py-0.5 rounded">
                        {inc.estimated_value}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">{inc.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regulatory Process */}
          {rec.regulatory_process && rec.regulatory_process.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Regulatory Process
              </h4>
              <div className="space-y-1.5">
                {rec.regulatory_process.map((step, i) => (
                  <div key={i} className="flex gap-2.5 p-2 bg-background rounded-lg border border-border-light">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-primary">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs text-foreground">{step.step}</p>
                      <p className="text-[10px] text-muted">
                        {step.timeline} · {step.agency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline + Zoning */}
          <div className="flex gap-2">
            {rec.estimated_timeline && (
              <div className="flex-1 p-2 bg-primary/5 border border-primary/15 rounded-lg">
                <p className="text-[10px] font-semibold text-primary uppercase mb-0.5">Timeline</p>
                <p className="text-xs text-foreground">{rec.estimated_timeline}</p>
              </div>
            )}
            <div className="flex-1 p-2 bg-background border border-border-light rounded-lg">
              <p className="text-[10px] font-semibold text-muted uppercase mb-0.5">Rezoning</p>
              <p className="text-xs text-foreground">
                {rec.zoning_details.rezoning_required ? (
                  <span className="text-status-warning">Required ({rec.zoning_details.rezoning_difficulty})</span>
                ) : (
                  <span className="text-status-clear">Not required</span>
                )}
              </p>
            </div>
          </div>

          {/* Risks */}
          {rec.risks && rec.risks.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-status-warning uppercase tracking-wider mb-1.5">
                Risks
              </h4>
              <ul className="space-y-1">
                {rec.risks.map((risk, i) => (
                  <li key={i} className="text-xs text-muted flex gap-1.5">
                    <span className="text-status-warning shrink-0">!</span>
                    {risk}
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
