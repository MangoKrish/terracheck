"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useState, useEffect } from "react";
import {
  loadHistory,
  clearHistory,
  type SavedItem,
  type SavedAssessment,
  type SavedRecommendation,
} from "@/lib/history";

type FilterType = "all" | "assessment" | "recommendation";

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

function getScoreColor(score: number): string {
  if (score >= 70) return "text-status-clear bg-status-clear/10";
  if (score >= 40) return "text-status-warning bg-status-warning/10";
  return "text-status-critical bg-status-critical/10";
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

export default function Dashboard() {
  const { user, isLoading } = useUser();
  const [history, setHistory] = useState<SavedItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (user?.sub) {
      setHistory(loadHistory(user.sub));
    }
  }, [user]);

  const filtered =
    filter === "all" ? history : history.filter((item) => item.type === filter);

  const handleClear = () => {
    if (user?.sub && confirm("Clear all saved assessments? This cannot be undone.")) {
      clearHistory(user.sub);
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Your Assessments</h1>
            <p className="text-sm text-muted mt-1">
              {history.length > 0
                ? `${history.length} saved report${history.length !== 1 ? "s" : ""}`
                : "Track and compare your land viability reports"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/assess"
              className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Assessment
            </Link>
            <Link
              href="/recommend"
              className="px-4 py-2.5 border border-border text-foreground rounded-lg text-sm font-semibold hover:border-primary/30 transition-colors"
            >
              AI Site Finder
            </Link>
          </div>
        </div>

        {/* Filter tabs */}
        {history.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1 p-1 bg-surface rounded-lg border border-border w-fit">
              {(["all", "assessment", "recommendation"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    filter === f
                      ? "bg-primary text-white"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {f === "all" ? "All" : f === "assessment" ? "Assessments" : "Recommendations"}
                </button>
              ))}
            </div>
            <button
              onClick={handleClear}
              className="text-xs text-muted hover:text-status-critical transition-colors"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {history.length === 0 ? "No saved assessments yet" : "No matching results"}
            </h2>
            <p className="text-sm text-muted max-w-sm mb-6">
              Drop a pin on any location in Ontario to get your first environmental and regulatory viability report. All results are saved automatically.
            </p>
            <div className="flex gap-3">
              <Link
                href="/assess"
                className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                Start an Assessment
              </Link>
              <Link
                href="/recommend"
                className="px-5 py-2.5 border border-border text-foreground rounded-lg text-sm font-semibold hover:border-primary/30 transition-colors"
              >
                Try AI Site Finder
              </Link>
            </div>
          </div>
        )}

        {/* History grid */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-surface rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/20 transition-all"
              >
                {/* Type badge + time */}
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
                  <AssessmentCardContent item={item as SavedAssessment} />
                ) : (
                  <RecommendationCardContent item={item as SavedRecommendation} />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AssessmentCardContent({ item }: { item: SavedAssessment }) {
  return (
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
  );
}

function RecommendationCardContent({ item }: { item: SavedRecommendation }) {
  return (
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
  );
}
