"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";

function getScoreColor(score: number): string {
  if (score >= 70) return "text-status-clear bg-status-clear/10";
  if (score >= 40) return "text-status-warning bg-status-warning/10";
  return "text-status-critical bg-status-critical/10";
}

const MOCK_HISTORY = [
  {
    id: "1",
    type: "assessment" as const,
    timestamp: new Date(Date.now() - 120000).toISOString(),
    locationName: "Hamilton, Ontario",
    score: 72,
    status: "viable_with_conditions",
    summary: "Good development potential with moderate regulatory requirements. Greenbelt overlap and agricultural zoning require amendments.",
    layersQueried: 7,
    layersIntersecting: 3,
  },
  {
    id: "2",
    type: "recommendation" as const,
    timestamp: new Date(Date.now() - 300000).toISOString(),
    projectType: "residential_complex",
    region: "southern_ontario",
    scale: "medium",
    locationCount: 3,
    topScore: 85,
    summary: "Milton, Kitchener, and Barrie present the strongest opportunities for medium-scale residential development.",
  },
  {
    id: "3",
    type: "assessment" as const,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    locationName: "Kitchener, Waterloo Region",
    score: 85,
    status: "viable",
    summary: "Excellent location for development. Mixed-use corridor zoning supports residential intensification.",
    layersQueried: 7,
    layersIntersecting: 1,
  },
];

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "viable": return "Viable";
    case "viable_with_conditions": return "Viable w/ Conditions";
    case "challenging": return "Challenging";
    case "not_viable": return "Not Viable";
    default: return status;
  }
}

export default function DemoDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar linkPrefix="/demo" />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Your Assessments</h1>
            <p className="text-sm text-muted mt-1">
              {MOCK_HISTORY.length} saved report{MOCK_HISTORY.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/demo/assess"
              className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Assessment
            </Link>
            <Link
              href="/demo/recommend"
              className="px-4 py-2.5 border border-border text-foreground rounded-lg text-sm font-semibold hover:border-primary/30 transition-colors"
            >
              AI Site Finder
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_HISTORY.map((item) => (
            <div
              key={item.id}
              className="bg-surface rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    item.type === "assessment"
                      ? "bg-primary/10 text-primary"
                      : "bg-status-warning/10 text-status-warning"
                  }`}
                >
                  {item.type === "assessment" ? "Assessment" : "Recommendation"}
                </span>
                <span className="text-xs text-muted">{timeAgo(item.timestamp)}</span>
              </div>

              {item.type === "assessment" ? (
                <>
                  <h3 className="text-sm font-semibold text-foreground truncate">{item.locationName}</h3>
                  <p className="text-xs text-muted mt-1 line-clamp-2">{item.summary}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">
                        {item.layersIntersecting}/{item.layersQueried} layers
                      </span>
                      <span className="text-xs text-muted-light">·</span>
                      <span className="text-xs text-muted">{getStatusLabel(item.status)}</span>
                    </div>
                    <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${getScoreColor(item.score)}`}>
                      {item.score}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-semibold text-foreground capitalize">
                    {item.projectType.replace(/_/g, " ")}
                  </h3>
                  <p className="text-xs text-muted mt-0.5 capitalize">
                    {item.region.replace(/_/g, " ")} · {item.scale} scale
                  </p>
                  <p className="text-xs text-muted mt-1 line-clamp-2">{item.summary}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted">
                      {item.locationCount} location{item.locationCount !== 1 ? "s" : ""} found
                    </span>
                    <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${getScoreColor(item.topScore)}`}>
                      Top: {item.topScore}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
