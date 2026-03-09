"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        let animationStart = 0;
        const duration = 1300;
        const step = (timestamp: number) => {
          if (!animationStart) animationStart = timestamp;
          const progress = Math.min((timestamp - animationStart) / duration, 1);
          setValue(Math.round(progress * end));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.45 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{value}{suffix}</span>;
}

const P = "/demo";

const layerCards = [
  { title: "Biome Scan", detail: "Pin a site and instantly cross-check floodplain pressure, habitat overlap, and policy constraints before design work starts.", label: "Assessment Path", href: `${P}/assess` },
  { title: "Site Discovery", detail: "Describe what you plan to build and the engine ranks Ontario zones by ecological fit, permitting friction, and readiness.", label: "Recommendation Path", href: `${P}/recommend` },
  { title: "Trail Log", detail: "Save every location review in one workspace so teams can compare options and move from intuition to evidence.", label: "Dashboard Path", href: `${P}/dashboard` },
];

const trailSteps = [
  { title: "Mark The Ground", description: "Search or drop a marker on the map where you want to explore development potential." },
  { title: "Let The Canopy Read", description: "TerraCheck inspects six live geospatial layers and routes evidence to AI for synthesis." },
  { title: "Choose The Safest Route", description: "Receive viability scores, blockers, and practical next actions for planners and stakeholders." },
];

export default function DemoHome() {
  const { ref: heroRef, visible: heroVisible } = useInView(0.2);
  const { ref: statsRef, visible: statsVisible } = useInView(0.35);
  const { ref: layersRef, visible: layersVisible } = useInView(0.2);
  const { ref: processRef, visible: processVisible } = useInView(0.25);
  const { ref: ctaRef, visible: ctaVisible } = useInView(0.4);

  const [scrollY, setScrollY] = useState(0);
  const [progress, setProgress] = useState(0);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const onPointerMove = (event: MouseEvent) => {
      setMouse({ x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight });
    };
    const onScroll = () => {
      const y = window.scrollY;
      const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      setScrollY(y);
      setProgress(Math.min(y / maxScroll, 1));
    };
    onScroll();
    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const fogShiftX = (mouse.x - 0.5) * 54;
  const fogShiftY = (mouse.y - 0.5) * 36;
  const canopyTiltX = (0.5 - mouse.y) * 8;
  const canopyTiltY = (mouse.x - 0.5) * 10;
  const ringValue = 64 + Math.round(progress * 24);
  const ringCircumference = 2 * Math.PI * 76;
  const ringOffset = ringCircumference * (1 - ringValue / 100);
  const canopyStatus = ringValue > 82 ? "Thriving" : ringValue > 72 ? "Steady" : "Watching";

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0f1a12] text-[#f0eadb]">
      <div className="pointer-events-none fixed left-0 top-0 z-[60] h-1 bg-[#8eb67f] transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      <Navbar variant="transparent" linkPrefix="/demo" />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#294735_0%,#152318_45%,#0b130d_100%)]" />
        <div className="forest-noise absolute inset-0 opacity-30" />
        <div className="absolute -left-24 top-16 h-[28rem] w-[28rem] rounded-full bg-[#4f7353]/35 blur-3xl animate-mist-sway" style={{ transform: `translate(${fogShiftX}px, ${fogShiftY}px)` }} />
        <div className="absolute -right-28 bottom-24 h-[32rem] w-[32rem] rounded-full bg-[#2c4733]/45 blur-3xl animate-mist-sway" style={{ transform: `translate(${-fogShiftX * 0.7}px, ${-fogShiftY * 0.4}px)` }} />
        <div className="absolute inset-x-0 bottom-0 h-[48vh] bg-[linear-gradient(to_top,rgba(7,11,8,0.88),rgba(7,11,8,0))]" />
      </div>

      <main>
        <section ref={heroRef} className="relative pt-28 pb-20 md:pt-36 md:pb-28">
          <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className={`transition-all duration-700 ${heroVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#8eb67f]/30 bg-[#1a2b1f]/65 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b5d0a4]">
                Ontario Forest Intelligence
              </span>
              <h1 className="mt-6 font-serif text-4xl leading-tight text-[#f7f1e3] md:text-6xl">
                Build with the forest,<br />not against it.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#d4cfbf] md:text-lg">
                TerraCheck turns environmental screening into an immersive first step. Drop a pin, watch the terrain respond, and move forward with data-backed confidence.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={`${P}/assess`} className="inline-flex items-center justify-center rounded-full bg-[#c6b07a] px-7 py-3 text-sm font-semibold tracking-wide text-[#1d2518] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d4be86]">
                  Start Land Reading
                </Link>
                <Link href={`${P}/recommend`} className="inline-flex items-center justify-center rounded-full border border-[#9bb48b]/45 bg-[#152218]/70 px-7 py-3 text-sm font-semibold tracking-wide text-[#dce7d1] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1d2f20]">
                  Explore AI Site Finder
                </Link>
              </div>
              <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 text-sm text-[#d8d1bf] sm:grid-cols-3">
                <div className="forest-chip"><p className="text-lg font-semibold text-[#f2ecd8]">6</p><p>Live layers</p></div>
                <div className="forest-chip"><p className="text-lg font-semibold text-[#f2ecd8]">47</p><p>Zones compared</p></div>
                <div className="forest-chip"><p className="text-lg font-semibold text-[#f2ecd8]">100%</p><p>AI assisted</p></div>
              </div>
            </div>

            <div className={`transition-all duration-700 delay-150 ${heroVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
              <div className="forest-card relative overflow-hidden p-7 md:p-9" style={{ transform: `translateY(${Math.min(scrollY * -0.045, 18)}px)` }}>
                <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full border border-[#7da56f]/20" />
                <div className="absolute -left-24 top-10 h-44 w-44 rounded-full bg-[#567652]/20 blur-3xl" />
                <p className="text-xs uppercase tracking-[0.2em] text-[#b5d0a4]">Canopy Pulse</p>
                <h2 className="mt-2 font-serif text-2xl text-[#f5efde]">Live Viability Stream</h2>
                <p className="mt-2 text-sm text-[#cec7b5]">Cursor movement shifts the atmospheric model to mimic field uncertainty and reveal sensitivity zones.</p>
                <div className="mx-auto mt-8 h-44 w-44 rounded-full border border-[#8db67e]/25 bg-[#111a13]/75 p-4 shadow-[0_20px_60px_rgba(2,8,3,0.45)]" style={{ transform: `perspective(820px) rotateX(${canopyTiltX}deg) rotateY(${canopyTiltY}deg)` }}>
                  <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
                    <circle cx="90" cy="90" r="76" fill="none" stroke="rgba(191,216,176,0.15)" strokeWidth="10" />
                    <circle cx="90" cy="90" r="76" fill="none" stroke="#c4ddab" strokeWidth="10" strokeLinecap="round" strokeDasharray={ringCircumference} strokeDashoffset={ringOffset} className="transition-all duration-700" />
                  </svg>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-4xl font-semibold text-[#ecf6df]">{ringValue}</p>
                    <p className="text-xs uppercase tracking-[0.15em] text-[#c5d8b8]">{canopyStatus}</p>
                  </div>
                </div>
                <div className="mt-8 space-y-2 text-sm">
                  <div className="forest-row"><span>Flood pressure</span><span className="text-[#bfd9ac]">Low</span></div>
                  <div className="forest-row"><span>Protected habitat</span><span className="text-[#f0d189]">Watch</span></div>
                  <div className="forest-row"><span>Policy friction</span><span className="text-[#bfd9ac]">Manageable</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section ref={statsRef} className="relative py-12">
          <div className="mx-auto grid max-w-6xl gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: 6, label: "Data layers" },
              { value: 47, label: "Evaluated zones" },
              { value: 15, label: "Regions covered" },
              { value: 24, suffix: "/7", label: "Monitoring loop" },
            ].map((stat) => (
              <div key={stat.label} className="forest-panel text-center p-4">
                <p className="text-3xl font-semibold text-[#edf6df]">
                  {statsVisible ? <Counter end={stat.value} suffix={stat.suffix ?? ""} /> : `0${stat.suffix ?? ""}`}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#b8c4b0]">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section ref={layersRef} className="py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.24em] text-[#b5d0a4]">Core Routes</p>
              <h2 className="mt-3 font-serif text-3xl text-[#f5efde] md:text-4xl">Three ways to read land with ecological context</h2>
            </div>
            <div className={`mt-10 grid gap-5 md:grid-cols-3 transition-all duration-700 ${layersVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
              {layerCards.map((card, index) => (
                <article key={card.title} className="forest-panel group relative overflow-hidden p-6" style={{ transform: `translateY(${scrollY * (index + 1) * -0.008}px)` }}>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-[#a9c09b]">{card.label}</span>
                  <h3 className="mt-3 font-serif text-2xl text-[#f7f2e4]">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#d4cdbb]">{card.detail}</p>
                  <Link href={card.href} className="mt-5 inline-flex items-center text-sm font-semibold text-[#c8dda8] transition-all duration-300 group-hover:translate-x-1">
                    Enter route<span className="ml-2">-&gt;</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section ref={processRef} className="py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#b5d0a4]">Field Method</p>
                <h2 className="mt-3 font-serif text-3xl text-[#f5efde] md:text-4xl">From first marker to defensible direction</h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-[#cec7b4]">This flow mimics a forest walk: observe, interpret, then commit to a route. Every step keeps legal and environmental risk visible.</p>
              </div>
              <div className={`space-y-6 transition-all duration-700 ${processVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
                {trailSteps.map((step, index) => (
                  <div key={step.title} className="forest-panel relative p-5 pl-16">
                    <div className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-[#9bb38b]/45 bg-[#19271d] text-sm font-semibold text-[#d8e9c7]">{index + 1}</div>
                    <h3 className="font-serif text-2xl text-[#f3eddd]">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#d1c9b7]">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section ref={ctaRef} className="pb-24 pt-20 md:pb-28">
          <div className={`mx-auto max-w-4xl px-6 transition-all duration-700 ${ctaVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <div className="forest-card relative overflow-hidden px-7 py-10 text-center md:px-12 md:py-14">
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,transparent,#c5d9a8,transparent)]" />
              <p className="text-xs uppercase tracking-[0.24em] text-[#b8d0aa]">Ready To Move</p>
              <h2 className="mt-4 font-serif text-3xl text-[#f6f1e4] md:text-5xl">Turn the next parcel into a clear decision.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#d5cebc] md:text-base">Walk into planning meetings with evidence, not assumptions. TerraCheck keeps your route grounded in ecology, regulation, and practical delivery.</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href={`${P}/assess`} className="inline-flex items-center justify-center rounded-full bg-[#c6b07a] px-8 py-3 text-sm font-semibold tracking-wide text-[#1d2518] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d5bf87]">Assess A Site</Link>
                <Link href={`${P}/recommend`} className="inline-flex items-center justify-center rounded-full border border-[#98b18a]/50 bg-[#162319]/75 px-8 py-3 text-sm font-semibold tracking-wide text-[#d7e3cb] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#203122]">Generate Site Options</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#2a3b2b] bg-[#0b120d]/85 py-7 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <p className="text-xs text-[#a8b7a0]">TerraCheck</p>
            <p className="text-xs text-[#a8b7a0]">Earth-led viability for Ontario development teams</p>
            <div className="flex items-center gap-4">
              <Link href={`${P}/assess`} className="text-xs text-[#a8b7a0] transition-colors hover:text-[#dbe8cf]">Assess</Link>
              <Link href={`${P}/recommend`} className="text-xs text-[#a8b7a0] transition-colors hover:text-[#dbe8cf]">Recommend</Link>
              <Link href={`${P}/dashboard`} className="text-xs text-[#a8b7a0] transition-colors hover:text-[#dbe8cf]">Dashboard</Link>
            </div>
          </div>
          <div className="border-t border-[#2a3b2b] mt-4 pt-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#7a8d74]">Built for Hack Canada 2025</p>
            <div className="flex items-center gap-4">
              <a href="https://docs.google.com/forms/d/e/1UYO_QU-nH5wgA06DvWullt_J4HnlbTUUoArrNdALsgs/viewform" target="_blank" rel="noopener noreferrer" className="text-xs text-[#7a8d74] hover:text-[#dbe8cf] transition-colors flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Give Feedback
              </a>
              <a href="mailto:sirigana@mcmaster.ca" className="text-xs text-[#7a8d74] hover:text-[#dbe8cf] transition-colors flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                sirigana@mcmaster.ca
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
