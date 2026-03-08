"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ── Intersection Observer hook ── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ══════════════════════════════════════════════════════════════════
   WATERCOLOR ART — Large SVG paintings in the David Whyte style
   These create the central visual identity of each section
   ══════════════════════════════════════════════════════════════════ */

/* Hero tree — large, occupies most of the viewport */
function HeroTree() {
  return (
    <svg viewBox="0 0 900 1000" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="wc" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="20" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="2" />
        </filter>
        <filter id="sblur"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="mblur"><feGaussianBlur stdDeviation="3" /></filter>
        <radialGradient id="c1" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#1B4332" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#1B4332" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="c2" cx="45%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#52B788" stopOpacity="0.75" />
          <stop offset="60%" stopColor="#40916C" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#2D6A4F" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="c3" cx="55%" cy="35%" r="50%">
          <stop offset="0%" stopColor="#74C69D" stopOpacity="0.65" />
          <stop offset="80%" stopColor="#52B788" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#40916C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6D4C41" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#4E342E" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {/* Ground wash */}
      <ellipse cx="450" cy="900" rx="380" ry="45" fill="#A1887F" opacity="0.15" filter="url(#sblur)" />

      {/* Trunk + branches */}
      <g filter="url(#wc)">
        <path d="M430 900 L440 640 Q445 560 438 480 L435 380" fill="none" stroke="url(#tk)" strokeWidth="22" strokeLinecap="round" />
        <path d="M440 640 Q405 590 355 520" fill="none" stroke="url(#tk)" strokeWidth="12" strokeLinecap="round" />
        <path d="M438 560 Q470 510 520 460" fill="none" stroke="url(#tk)" strokeWidth="10" strokeLinecap="round" />
        <path d="M435 480 Q400 430 340 370" fill="none" stroke="url(#tk)" strokeWidth="8" strokeLinecap="round" />
        <path d="M437 420 Q465 380 510 330" fill="none" stroke="url(#tk)" strokeWidth="7" strokeLinecap="round" />
        <path d="M436 400 Q420 350 390 300" fill="none" stroke="url(#tk)" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* Canopy — deep shadow */}
      <g filter="url(#wc)">
        <ellipse cx="430" cy="340" rx="260" ry="230" fill="url(#c1)" opacity="0.55" />
        <ellipse cx="350" cy="400" rx="200" ry="170" fill="#1B4332" opacity="0.35" />
      </g>

      {/* Canopy — mid greens */}
      <g filter="url(#wc)">
        <ellipse cx="450" cy="290" rx="280" ry="250" fill="url(#c2)" opacity="0.65" />
        <ellipse cx="370" cy="350" rx="190" ry="160" fill="#40916C" opacity="0.45" />
        <ellipse cx="530" cy="310" rx="170" ry="150" fill="#2D6A4F" opacity="0.4" />
      </g>

      {/* Canopy — highlights */}
      <g filter="url(#wc)">
        <ellipse cx="430" cy="240" rx="230" ry="190" fill="url(#c3)" opacity="0.55" />
        <ellipse cx="360" cy="270" rx="130" ry="110" fill="#74C69D" opacity="0.35" />
        <ellipse cx="500" cy="250" rx="140" ry="120" fill="#52B788" opacity="0.3" />
        <ellipse cx="420" cy="200" rx="150" ry="110" fill="#95D5B2" opacity="0.25" />
      </g>

      {/* Canopy — top bright */}
      <g filter="url(#wc)">
        <ellipse cx="410" cy="170" rx="100" ry="75" fill="#B7E4C7" opacity="0.22" />
        <ellipse cx="450" cy="140" rx="70" ry="55" fill="#D8F3DC" opacity="0.18" />
      </g>

      {/* Distant trees */}
      <g filter="url(#mblur)" opacity="0.25">
        <ellipse cx="120" cy="800" rx="60" ry="85" fill="#2D6A4F" />
        <rect x="116" y="800" width="8" height="95" rx="4" fill="#6D4C41" opacity="0.5" />
        <ellipse cx="780" cy="820" rx="50" ry="70" fill="#40916C" />
        <rect x="776" y="820" width="7" height="75" rx="3" fill="#6D4C41" opacity="0.4" />
      </g>

      {/* Bottom earth */}
      <ellipse cx="450" cy="940" rx="450" ry="50" fill="#BCAAA4" opacity="0.1" filter="url(#sblur)" />
    </svg>
  );
}

/* Landscape with viaduct for section 2 (like DW's bridge scene) */
function LandscapeArt() {
  return (
    <svg viewBox="0 0 1400 600" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="wl" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="14" />
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C5D5E4" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#E8EEF2" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="1400" height="300" fill="url(#sky)" filter="url(#wl)" />

      {/* Clouds */}
      <g filter="url(#wl)" opacity="0.3">
        <ellipse cx="400" cy="120" rx="200" ry="60" fill="#D6E4EE" />
        <ellipse cx="900" cy="80" rx="180" ry="50" fill="#C5D5E4" />
        <ellipse cx="650" cy="150" rx="150" ry="40" fill="#E0EAF0" />
      </g>

      {/* Distant hills */}
      <g filter="url(#wl)">
        <path d="M0 380 Q200 280 400 330 Q650 250 850 310 Q1050 270 1200 320 Q1300 290 1400 330 L1400 600 L0 600Z" fill="#2D6A4F" opacity="0.2" />
        <path d="M0 420 Q300 360 600 390 Q900 340 1100 380 Q1250 350 1400 390 L1400 600 L0 600Z" fill="#40916C" opacity="0.15" />
      </g>

      {/* Viaduct / bridge */}
      <g filter="url(#wl)" opacity="0.35">
        <rect x="300" y="350" width="500" height="12" rx="2" fill="#6D4C41" />
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <g key={i}>
            <path d={`M${330 + i * 70} 362 Q${365 + i * 70} 420 ${400 + i * 70} 362`} fill="none" stroke="#795548" strokeWidth="6" opacity="0.6" />
            <rect x={325 + i * 70} y="362" width="5" height="90" fill="#6D4C41" opacity="0.4" />
          </g>
        ))}
      </g>

      {/* Trees */}
      <g filter="url(#wl)" opacity="0.4">
        <ellipse cx="200" cy="370" rx="40" ry="55" fill="#1B4332" />
        <ellipse cx="250" cy="375" rx="30" ry="45" fill="#2D6A4F" />
        <ellipse cx="850" cy="350" rx="45" ry="60" fill="#2D6A4F" />
        <ellipse cx="1100" cy="365" rx="35" ry="50" fill="#40916C" />
      </g>

      {/* Mist */}
      <rect x="0" y="380" width="1400" height="100" fill="#E8E0D8" opacity="0.25" filter="url(#wl)" />

      {/* Foreground earth */}
      <path d="M0 480 Q400 460 700 470 Q1000 455 1400 480 L1400 600 L0 600Z" fill="#A1887F" opacity="0.12" filter="url(#wl)" />
    </svg>
  );
}

/* ── Signpost with arrow-shaped signs ── */
function Signpost() {
  return (
    <div className="relative" style={{ width: 380, height: 380 }}>
      {/* Vertical post */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-6 w-3 rounded-full"
        style={{ background: "linear-gradient(to bottom, #5C4033, #8D6E63, #A1887F)" }} />
      {/* Base shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-2 rounded-full bg-[#5C4033]/20 blur-sm" />

      {/* Sign 1 → Assess (right) */}
      <Link href="/assess" className="group absolute top-[20px] left-[calc(50%+8px)]">
        <div className="transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-[1.03]">
          <div className="px-5 py-3.5 text-white font-semibold text-[15px] tracking-wide transition-all duration-300 group-hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #5B4DC7 0%, #4A6CF7 60%, #3B8A6A 100%)", clipPath: "polygon(0 0, 82% 0, 100% 50%, 82% 100%, 0 100%)", width: 210, boxShadow: "0 4px 20px rgba(91,77,199,0.25)" }}>
            Assess Your Land
          </div>
        </div>
      </Link>

      {/* Sign 2 → Recommend (left) */}
      <Link href="/recommend" className="group absolute top-[120px] right-[calc(50%+8px)]">
        <div className="transition-transform duration-300 group-hover:-translate-x-2 group-hover:scale-[1.03]">
          <div className="px-5 py-3.5 text-white font-semibold text-[15px] tracking-wide text-right transition-all duration-300 group-hover:brightness-110"
            style={{ background: "linear-gradient(225deg, #5B4DC7 0%, #4A6CF7 60%, #3B8A6A 100%)", clipPath: "polygon(18% 0, 100% 0, 100% 100%, 18% 100%, 0 50%)", width: 210, boxShadow: "0 4px 20px rgba(91,77,199,0.25)" }}>
            AI Recommend
          </div>
        </div>
      </Link>

      {/* Sign 3 → Dashboard (right) */}
      <Link href="/dashboard" className="group absolute top-[220px] left-[calc(50%+8px)]">
        <div className="transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-[1.03]">
          <div className="px-5 py-3.5 text-white font-semibold text-[15px] tracking-wide transition-all duration-300 group-hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #5B4DC7 0%, #4A6CF7 60%, #3B8A6A 100%)", clipPath: "polygon(0 0, 82% 0, 100% 50%, 82% 100%, 0 100%)", width: 210, boxShadow: "0 4px 20px rgba(91,77,199,0.25)" }}>
            Your Dashboard
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   HOMEPAGE — David Whyte inspired scroll experience
   Cream backgrounds, large watercolor art, serif overlaid text
   ══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const s2 = useInView();
  const s3 = useInView();
  const s4 = useInView();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ background: "#F2EDE8" }}>
      {/* ── Navbar — minimal like DW ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-8 transition-all duration-500 ${
        scrolled ? "bg-[#F2EDE8]/90 backdrop-blur-md" : "bg-transparent"}`}>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold text-[#2a2a2a] tracking-tight">TerraCheck</Link>
          <span className="hidden sm:block text-[#2a2a2a]/30">|</span>
          <Link href="/assess" className="hidden sm:block text-sm text-[#2a2a2a]/50 hover:text-[#2a2a2a] transition-colors">Assessment</Link>
          <Link href="/recommend" className="hidden sm:block text-sm text-[#2a2a2a]/50 hover:text-[#2a2a2a] transition-colors">Smart Recommend</Link>
        </div>
        <div className="flex items-center gap-4">
          <a href="/auth/login" className="text-sm text-[#2a2a2a]/50 hover:text-[#2a2a2a] transition-colors">Sign in</a>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════
          SECTION 1: HERO
          Massive watercolor tree + overlaid serif text + signpost
          Just like DW's hero with the tree painting
          ════════════════════════════════════════════════ */}
      <section className="relative min-h-screen overflow-hidden" style={{ background: "#F2EDE8" }}>
        {/* THE ART: Watercolor tree — large, central-right, like DW */}
        <div className="absolute top-[5%] right-[-5%] w-[65%] h-[90%] pointer-events-none opacity-80">
          <HeroTree />
        </div>

        {/* Text overlaid on the left — David Whyte style */}
        <div className="relative z-10 flex flex-col justify-center min-h-screen px-8 sm:px-16 max-w-2xl pt-16">
          <div className="animate-fade-in-up">
            <h1 className="font-serif text-[2.8rem] sm:text-[3.5rem] lg:text-[4.2rem] font-normal leading-[1.15] text-[#2a2a2a]/80 tracking-tight">
              Know your land
              <br />
              <span className="text-[#2a2a2a]/50">before you build.</span>
            </h1>
            <p className="mt-6 font-serif text-xl sm:text-2xl text-[#2a2a2a]/35 leading-relaxed italic max-w-md">
              AI-powered environmental and regulatory viability for Ontario land development.
            </p>
          </div>

          {/* Signpost below the text */}
          <div className="mt-12 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Signpost />
          </div>
        </div>

        {/* "Scroll to explore" — bottom left like DW */}
        <div className="absolute bottom-8 left-8 sm:left-16 animate-scroll-hint">
          <span className="text-sm text-[#2a2a2a]/30 underline underline-offset-4 decoration-[#2a2a2a]/15">Scroll to explore</span>
        </div>

        {/* "Open the landscape" text — right side like DW */}
        <div className="absolute bottom-[40%] right-8 sm:right-16 hidden lg:block">
          <span className="text-sm text-[#2a2a2a]/25 writing-mode-vertical" style={{ writingMode: "vertical-rl" }}>
            Open the landscape
          </span>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SECTION 2: LANDSCAPE with text — DW style
          Watercolor landscape art + overlaid poetic text
          ════════════════════════════════════════════════ */}
      <section ref={s2.ref} className="relative min-h-screen overflow-hidden" style={{ background: "#F2EDE8" }}>
        {/* Watercolor landscape art — full width, upper portion */}
        <div className="absolute top-0 left-0 w-full h-[70%] opacity-70 pointer-events-none">
          <LandscapeArt />
        </div>
        {/* Fade to cream at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-[#F2EDE8] to-transparent pointer-events-none" />

        <div className={`relative z-10 flex flex-col justify-end min-h-screen px-8 sm:px-16 pb-20 transition-all duration-[1.2s] ${s2.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="max-w-xl">
            <h2 className="font-serif text-[2.5rem] sm:text-[3.2rem] font-normal leading-[1.15] text-[#2a2a2a]/70">
              Drop a pin.
              <br />
              Get answers instantly.
            </h2>
            <p className="mt-5 text-lg text-[#2a2a2a]/35 leading-relaxed max-w-md">
              Click any location on our interactive map for an AI-powered viability report — flood risk, zoning, contamination, protected areas, and full regulatory pathway.
            </p>
            <Link href="/assess" className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-[#2a2a2a]/50 hover:text-[#2a2a2a] underline underline-offset-4 decoration-[#2a2a2a]/20 transition-colors">
              Start an assessment
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SECTION 3: AI RECOMMEND — with abstract watercolor
          ════════════════════════════════════════════════ */}
      <section ref={s3.ref} className="relative min-h-screen overflow-hidden" style={{ background: "#F2EDE8" }}>
        {/* Abstract watercolor shapes — right side */}
        <svg className="absolute right-0 top-[10%] w-[50%] h-[80%] opacity-40 pointer-events-none" viewBox="0 0 700 800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="wa3" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="9" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="18" />
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          <g filter="url(#wa3)">
            <ellipse cx="350" cy="300" rx="280" ry="250" fill="#2D6A4F" opacity="0.3" />
            <ellipse cx="300" cy="380" rx="220" ry="200" fill="#40916C" opacity="0.2" />
            <ellipse cx="400" cy="250" rx="180" ry="160" fill="#52B788" opacity="0.2" />
            <ellipse cx="320" cy="200" rx="130" ry="100" fill="#74C69D" opacity="0.15" />
            <ellipse cx="380" cy="450" rx="200" ry="150" fill="#1B4332" opacity="0.15" />
          </g>
        </svg>

        <div className={`relative z-10 flex flex-col justify-center min-h-screen px-8 sm:px-16 transition-all duration-[1.2s] ${s3.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="max-w-2xl">
            <h2 className="font-serif text-[2.5rem] sm:text-[3.2rem] font-normal leading-[1.15] text-[#2a2a2a]/70">
              AI finds the perfect
              <br />
              <span className="text-[#2a2a2a]/40">location for you.</span>
            </h2>
            <p className="mt-5 text-lg text-[#2a2a2a]/35 leading-relaxed max-w-lg">
              Describe your project and our AI analyzes 47 zones across Ontario — environment, regulations, competition, and cost — to recommend the optimal sites.
            </p>

            {/* Feature list — understated, like DW's content lists */}
            <div className="mt-10 space-y-4">
              {[
                { label: "Environmental analysis", sub: "Ecological sensitivity, species at risk, contamination checks" },
                { label: "Regulatory framework", sub: "Zoning laws, Ontario Land Tribunal, building codes" },
                { label: "Market competition", sub: "Nearby projects, market saturation, demand outlook" },
                { label: "Cost optimization", sub: "Land costs, NOHFC grants, municipal incentives" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]/40 mt-2.5 shrink-0" />
                  <div>
                    <p className="text-base text-[#2a2a2a]/60 font-medium">{item.label}</p>
                    <p className="text-sm text-[#2a2a2a]/30 mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/recommend" className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-[#2a2a2a]/50 hover:text-[#2a2a2a] underline underline-offset-4 decoration-[#2a2a2a]/20 transition-colors">
              Find optimal sites
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SECTION 4: CTA + FOOTER
          ════════════════════════════════════════════════ */}
      <section ref={s4.ref} className="relative py-28 overflow-hidden" style={{ background: "#F2EDE8" }}>
        {/* Subtle watercolor accent */}
        <svg className="absolute bottom-0 left-0 w-full h-[50%] opacity-20 pointer-events-none" viewBox="0 0 1400 300" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="wa4"><feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="3" seed="15" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="15" /><feGaussianBlur stdDeviation="4" /></filter>
          </defs>
          <ellipse cx="300" cy="200" rx="350" ry="120" fill="#B7E4C7" opacity="0.3" filter="url(#wa4)" />
          <ellipse cx="1000" cy="180" rx="300" ry="100" fill="#A7C4BC" opacity="0.25" filter="url(#wa4)" />
        </svg>

        <div className={`relative z-10 max-w-2xl mx-auto px-8 text-center transition-all duration-[1.2s] ${s4.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h2 className="font-serif text-[2.5rem] sm:text-[3rem] font-normal text-[#2a2a2a]/70 leading-tight">
            Ready to build smarter?
          </h2>
          <p className="mt-4 text-lg text-[#2a2a2a]/35 max-w-md mx-auto">
            Join developers and planners across Ontario who use TerraCheck for data-driven land decisions.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/assess" className="px-7 py-3 bg-[#2a2a2a] text-white rounded-full text-sm font-medium hover:bg-[#1a1a1a] transition-colors">
              Start an Assessment
            </Link>
            <Link href="/recommend" className="px-7 py-3 text-[#2a2a2a]/60 border border-[#2a2a2a]/15 rounded-full text-sm font-medium hover:border-[#2a2a2a]/30 transition-colors">
              Find Optimal Locations
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-24 text-center">
          <p className="text-sm text-[#2a2a2a]/25 font-medium tracking-tight">TerraCheck</p>
          <p className="text-xs text-[#2a2a2a]/15 mt-1">Built for Hack Canada 2025</p>
        </div>
      </section>
    </div>
  );
}
