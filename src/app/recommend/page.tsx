"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import RecommendForm from "@/components/RecommendForm";
import RecommendCard from "@/components/RecommendCard";
import CloudinaryLoader from "@/components/CloudinaryLoader";
import { useState, useCallback, useEffect, useRef } from "react";
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

  /* ── Side panel loader sub-component ── */
  function SidePanelLoader() {
    const LOAD_STEPS = [
      { label: "Scanning zoning databases", time: 4000 },
      { label: "Cross-referencing environmental data", time: 5000 },
      { label: "Evaluating regulatory frameworks", time: 5000 },
      { label: "Analyzing market competition", time: 6000 },
      { label: "Checking development incentives", time: 4000 },
      { label: "Assessing construction timelines", time: 5000 },
      { label: "Running AI site selection model", time: 8000 },
      { label: "Compiling final recommendations", time: 5000 },
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
    const pct = Math.min(Math.round((elapsed / totalTime) * 100), 96);

    return (
      <div className="py-6">
        {/* Header */}
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

        {/* Circular progress */}
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

        {/* Step list */}
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

        {/* Bottom bar */}
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

            {/* Loading state — step-by-step progress */}
            {state === "loading" && <SidePanelLoader />}

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
