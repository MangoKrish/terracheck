"use client";

import { useEffect, useState, useRef } from "react";

const LOAD_STEPS = [
  { label: "Querying geospatial databases", time: 500 },
  { label: "Checking flood zone boundaries", time: 400 },
  { label: "Analyzing greenbelt overlap", time: 400 },
  { label: "Scanning for contaminated sites", time: 400 },
  { label: "Detecting nearby infrastructure", time: 500 },
  { label: "Evaluating zoning compatibility", time: 400 },
  { label: "Running AI regulatory analysis", time: 800 },
  { label: "Compiling viability report", time: 400 },
];

const TOTAL_TIME = LOAD_STEPS.reduce((s, t) => s + t.time, 0);
const CIRCUMFERENCE = 2 * Math.PI * 40;

export default function AssessLoader() {
  const startRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      setElapsed(Date.now() - startRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Determine current step
  let acc = 0;
  let step = LOAD_STEPS.length - 1;
  for (let i = 0; i < LOAD_STEPS.length; i++) {
    if (elapsed < acc + LOAD_STEPS[i].time) {
      step = i;
      break;
    }
    acc += LOAD_STEPS[i].time;
  }

  const pct = Math.min(Math.round((elapsed / TOTAL_TIME) * 100), 100);

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2D6A4F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Analyzing Location</h2>
          <p className="text-xs text-muted">{pct}% complete</p>
        </div>
      </div>

      {/* Circular progress */}
      <div className="w-20 h-20 mx-auto mb-5 relative">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e8ede9" strokeWidth="5" />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#2D6A4F"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - pct / 100)}
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
          <div
            key={i}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-500 ${
              i < step
                ? "bg-primary/5"
                : i === step
                ? "bg-primary/8 border border-primary/15"
                : "opacity-40"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                i < step
                  ? "bg-primary text-white"
                  : i === step
                  ? "border-2 border-primary"
                  : "border border-border"
              }`}
            >
              {i < step ? (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : i === step ? (
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              ) : null}
            </div>
            <span className={`text-xs ${i <= step ? "text-foreground font-medium" : "text-muted"}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom progress bar */}
      <div className="mt-5 w-full h-1.5 bg-border-light rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-center text-[11px] text-muted mt-3">
        Analyzing environmental and regulatory data
      </p>
    </div>
  );
}
