"use client";

import { useEffect, useState, useRef } from "react";

const STEPS = [
  { label: "Scanning zoning databases", icon: "🗺️", duration: 4000 },
  { label: "Cross-referencing environmental data", icon: "🌿", duration: 5000 },
  { label: "Evaluating regulatory frameworks", icon: "📋", duration: 5000 },
  { label: "Analyzing market competition", icon: "📊", duration: 6000 },
  { label: "Checking development incentives", icon: "💰", duration: 4000 },
  { label: "Assessing construction timelines", icon: "🏗️", duration: 5000 },
  { label: "Running AI site selection model", icon: "🤖", duration: 8000 },
  { label: "Compiling final recommendations", icon: "✨", duration: 5000 },
];

const TOTAL_DURATION = STEPS.reduce((sum, s) => sum + s.duration, 0);

export default function CloudinaryLoader() {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const ms = Date.now() - startRef.current;
      setElapsed(ms);
      if (ms < TOTAL_DURATION + 2000) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Determine which step we're on
  let accumulated = 0;
  let activeStep = STEPS.length - 1;
  for (let i = 0; i < STEPS.length; i++) {
    if (elapsed < accumulated + STEPS[i].duration) {
      activeStep = i;
      break;
    }
    accumulated += STEPS[i].duration;
  }

  // Overall percentage (caps at 96% to avoid implying completion)
  const rawPct = Math.min((elapsed / TOTAL_DURATION) * 100, 96);
  const pct = Math.round(rawPct);

  // Particle positions — scattered across the full area
  const particles = Array.from({ length: 30 }, (_, i) => ({
    x: ((i * 37 + 13) % 100),
    y: ((i * 53 + 7) % 100),
    delay: (i * 0.3) % 5,
    size: 2 + (i % 4),
    opacity: 0.15 + (i % 5) * 0.08,
  }));

  // Concentric ring data
  const rings = [
    { r: 100, duration: "12s", opacity: 0.06 },
    { r: 160, duration: "18s", opacity: 0.04 },
    { r: 220, duration: "24s", opacity: 0.03 },
    { r: 280, duration: "30s", opacity: 0.02 },
  ];

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-[#060f0a] flex flex-col items-center justify-center relative">

      {/* Animated radial gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(45,106,79,0.15) 0%, rgba(6,15,10,0) 70%)",
          animation: "breathe 6s ease-in-out infinite",
        }}
      />

      {/* Concentric expanding rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {rings.map((ring, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-primary"
            style={{
              width: ring.r,
              height: ring.r,
              opacity: ring.opacity,
              animation: `ringPulse ${ring.duration} ease-in-out infinite`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}
      </div>

      {/* Radar sweep */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[500px] h-[500px]"
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg, transparent 340deg, rgba(45,106,79,0.12) 355deg, transparent 360deg)",
            animation: "radarSweep 4s linear infinite",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: `rgba(82, 183, 136, ${p.opacity})`,
              animation: `float ${3 + p.delay}s ease-in-out infinite alternate`,
              animationDelay: `${p.delay}s`,
              boxShadow: `0 0 ${p.size * 2}px rgba(82, 183, 136, ${p.opacity * 0.5})`,
            }}
          />
        ))}
      </div>

      {/* Animated grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(82,183,136,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(82,183,136,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          animation: "gridShift 20s linear infinite",
        }}
      />

      {/* Horizontal scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="w-full h-[2px]"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(82,183,136,0.4) 30%, rgba(82,183,136,0.6) 50%, rgba(82,183,136,0.4) 70%, transparent 100%)",
            animation: "scan 5s linear infinite",
            boxShadow: "0 0 15px rgba(82,183,136,0.3), 0 0 30px rgba(82,183,136,0.15)",
          }}
        />
      </div>

      {/* Data stream lines (vertical) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[15, 35, 55, 75, 90].map((left, i) => (
          <div
            key={i}
            className="absolute top-0 w-px h-full"
            style={{
              left: `${left}%`,
              background: `linear-gradient(180deg, transparent 0%, rgba(82,183,136,${0.04 + i * 0.01}) 40%, rgba(82,183,136,${0.06 + i * 0.01}) 50%, rgba(82,183,136,${0.04 + i * 0.01}) 60%, transparent 100%)`,
              animation: `dataStream ${3 + i * 0.7}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* ──────── Main content ──────── */}
      <div className="relative z-10 text-center px-8 max-w-md w-full">

        {/* Circular progress indicator */}
        <div className="w-36 h-36 mx-auto mb-7 relative">
          {/* Outer glow ring */}
          <div
            className="absolute -inset-3 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, rgba(45,106,79,${0.1 + rawPct * 0.002}) 0%, rgba(82,183,136,${0.2 + rawPct * 0.003}) ${rawPct}%, transparent ${rawPct}%)`,
              filter: "blur(8px)",
            }}
          />
          <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 100 100">
            {/* Background track */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(82,183,136,0.08)" strokeWidth="3" />
            {/* Tick marks */}
            {Array.from({ length: 40 }, (_, i) => {
              const angle = (i / 40) * 2 * Math.PI - Math.PI / 2;
              const inner = 37;
              const outer = 39;
              return (
                <line
                  key={i}
                  x1={50 + inner * Math.cos(angle)}
                  y1={50 + inner * Math.sin(angle)}
                  x2={50 + outer * Math.cos(angle)}
                  y2={50 + outer * Math.sin(angle)}
                  stroke={i / 40 * 100 <= rawPct ? "rgba(82,183,136,0.4)" : "rgba(255,255,255,0.05)"}
                  strokeWidth="0.5"
                />
              );
            })}
            {/* Progress arc */}
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke="url(#progressGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - rawPct / 100)}`}
              style={{ transition: "stroke-dashoffset 0.5s ease", filter: "drop-shadow(0 0 4px rgba(82,183,136,0.4))" }}
            />
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1B4332" />
                <stop offset="50%" stopColor="#2D6A4F" />
                <stop offset="100%" stopColor="#52B788" />
              </linearGradient>
            </defs>
          </svg>
          {/* Inner spinning ring */}
          <div className="absolute inset-5 rounded-full border border-primary/15 border-t-primary/50 animate-spin" style={{ animationDuration: "3s" }} />
          {/* Reverse spinning ring */}
          <div className="absolute inset-7 rounded-full border border-primary/10 border-b-primary/40 animate-spin" style={{ animationDuration: "5s", animationDirection: "reverse" }} />
          {/* Percentage text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <span className="text-3xl font-bold text-white tabular-nums tracking-tight">{pct}<span className="text-lg text-white/40 ml-0.5">%</span></span>
          </div>
          {/* Pulsing glow */}
          <div className="absolute inset-6 rounded-full bg-primary/5 animate-pulse" />
        </div>

        {/* Current step with icon */}
        <div className="mb-5">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <span className="text-lg">{STEPS[activeStep].icon}</span>
            <p className="text-white text-sm font-medium tracking-wide">{STEPS[activeStep].label}</p>
          </div>
          <p className="text-white/25 text-xs tracking-widest uppercase">Step {activeStep + 1} of {STEPS.length}</p>
        </div>

        {/* Step progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-700 ${
                i < activeStep
                  ? "w-5 bg-primary shadow-[0_0_6px_rgba(45,106,79,0.5)]"
                  : i === activeStep
                  ? "w-7 bg-primary animate-pulse shadow-[0_0_8px_rgba(82,183,136,0.6)]"
                  : "w-1.5 bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Bottom progress bar */}
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out relative"
            style={{
              width: `${rawPct}%`,
              background: "linear-gradient(90deg, #1B4332, #2D6A4F, #52B788)",
              boxShadow: "0 0 10px rgba(82,183,136,0.4), 0 0 20px rgba(82,183,136,0.2)",
            }}
          >
            {/* Shimmer effect on progress bar */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                animation: "shimmer 2s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        {/* TerraCheck branding */}
        <p className="text-white/15 text-[10px] mt-4 tracking-[0.2em] uppercase">TerraCheck AI Engine</p>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          from { transform: translateY(0px) scale(1); opacity: 0.2; }
          to { transform: translateY(-25px) scale(1.8); opacity: 0.5; }
        }
        @keyframes scan {
          0% { transform: translateY(-10vh); }
          100% { transform: translateY(110vh); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.03; }
          50% { transform: scale(1.15); opacity: 0.08; }
        }
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes gridShift {
          from { transform: translate(0, 0); }
          to { transform: translate(40px, 40px); }
        }
        @keyframes dataStream {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
