"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "AI is analyzing your requirements...",
  "Scanning Ontario for optimal zones...",
  "Cross-referencing environmental data...",
  "Evaluating zoning compatibility...",
  "Checking regulatory frameworks...",
  "Analyzing competition & market conditions...",
  "Reviewing development incentives...",
  "Assessing construction timelines...",
  "Wait a moment — AI is powering your plans...",
  "Compiling final recommendations...",
];

export default function CloudinaryLoader() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const videoUrl = cloudName
    ? `https://res.cloudinary.com/${cloudName}/video/upload/e_loop/q_auto/f_auto/terracheck_scan`
    : null;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-[#0f1a14] flex items-center justify-center relative">
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

      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1a14]/60 via-[#0f1a14]/80 to-[#0f1a14]/60" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary-light/60 to-transparent animate-scan" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 text-center px-6">
        <div className="w-24 h-24 mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-3 rounded-full border border-primary/30" />
          <div className="absolute inset-5 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          </div>
          <div
            className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-primary to-transparent origin-left"
            style={{ animation: "sweep 3s linear infinite" }}
          />
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#40916C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <p className="text-white text-base font-semibold">
            AI Analysis in Progress
          </p>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#40916C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>

        <p className="text-white/50 text-sm mb-5 h-5 transition-all duration-500">
          {STEPS[stepIndex]}
        </p>

        <div className="w-48 mx-auto h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-700"
            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
