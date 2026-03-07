"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import RecommendForm from "@/components/RecommendForm";
import RecommendCard from "@/components/RecommendCard";
import CloudinaryLoader from "@/components/CloudinaryLoader";
import { useState, useCallback } from "react";
import {
  recommendLocations,
  type RecommendRequest,
  type RecommendResponse,
  type RecommendedLocation,
} from "@/lib/api";

const RecommendMap = dynamic(() => import("@/components/RecommendMap"), {
  ssr: false,
});

type PageState = "idle" | "loading" | "results";

export default function RecommendPage() {
  const [state, setState] = useState<PageState>("idle");
  const [result, setResult] = useState<RecommendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeLocation, setActiveLocation] =
    useState<RecommendedLocation | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const handleSubmit = useCallback(async (formData: RecommendRequest) => {
    setState("loading");
    setError(null);
    setResult(null);

    try {
      const data = await recommendLocations(formData);
      setResult(data);
      setState("results");
      if (data.recommendations.recommendations.length > 0) {
        setExpandedCard(0);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to get recommendations"
      );
      setState("idle");
    }
  }, []);

  const handleCardClick = (
    location: RecommendedLocation,
    index: number
  ) => {
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

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar />

      {/* Top toolbar */}
      <div className="h-14 border-b border-border bg-surface flex items-center px-6 gap-4">
        <div className="flex items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2D6A4F"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          <span className="text-sm font-semibold text-foreground">
            Smart Recommend
          </span>
        </div>
        {state === "results" && (
          <button
            onClick={handleReset}
            className="text-xs text-primary hover:text-primary-dark transition-colors font-medium"
          >
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
            {state === "loading" && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-foreground mb-1">
                  AI is analyzing your requirements...
                </p>
                <p className="text-xs text-muted">
                  Scanning zones, environment, competition, and timelines across Ontario
                </p>
              </div>
            )}

            {/* Results state */}
            {state === "results" && result && (
              <>
                {/* Summary */}
                <div className="mb-5">
                  <h2 className="text-base font-semibold text-foreground">
                    {recs.length} Location{recs.length !== 1 ? "s" : ""} Found
                  </h2>
                  <p className="text-sm text-foreground mt-2 leading-relaxed">
                    {result.recommendations.overall_summary}
                  </p>
                </div>

                {/* Recommendation cards */}
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

                {/* Key considerations */}
                {result.recommendations.key_considerations &&
                  result.recommendations.key_considerations.length > 0 && (
                    <div className="mt-6 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                        Key Considerations
                      </h3>
                      <ul className="space-y-1.5">
                        {result.recommendations.key_considerations.map(
                          (c, i) => (
                            <li
                              key={i}
                              className="text-xs text-foreground flex gap-2"
                            >
                              <span className="text-primary shrink-0">-</span>
                              {c}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* New search button */}
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
