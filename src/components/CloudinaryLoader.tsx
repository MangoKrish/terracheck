"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Loading geospatial data layers...",
  "Scanning zoning polygons...",
  "Checking environmental constraints...",
  "Analyzing regulatory requirements...",
  "Evaluating development incentives...",
  "Ranking candidate locations...",
];

export default function CloudinaryLoader() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Cloudinary video URL (if configured)
  const videoUrl = cloudName
    ? `https://res.cloudinary.com/${cloudName}/video/upload/e_loop/q_auto/f_auto/terracheck_scan`
    : null;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-[#0f1a14] flex items-center justify-center relative">
      {/* Cloudinary video background */}
      {videoUrl && (
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          onError={(e) => {
            (e.target as HTMLVideoElement).style.display = "none";
          }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1a14]/60 via-[#0f1a14]/80 to-[#0f1a14]/60" />

      {/* Scanning line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary-light/60 to-transparent animate-scan" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Center content */}
      <div className="relative z-10 text-center px-6">
        {/* Radar / scanning animation */}
        <div className="w-24 h-24 mx-auto mb-6 relative">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          {/* Middle ring */}
          <div className="absolute inset-3 rounded-full border border-primary/30" />
          {/* Inner spinning ring */}
          <div className="absolute inset-5 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          </div>
          {/* Sweeping line */}
          <div
            className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-primary to-transparent origin-left"
            style={{ animation: "sweep 3s linear infinite" }}
          />
        </div>

        <p className="text-white text-base font-semibold mb-1">
          Scanning Ontario
        </p>
        <p className="text-white/50 text-sm mb-5 h-5 transition-all duration-300">
          {STEPS[stepIndex]}
        </p>

        {/* Progress bar */}
        <div className="w-48 mx-auto h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
