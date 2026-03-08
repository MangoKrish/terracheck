"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";

/* ── Intersection Observer hook ── */
function useInView(threshold = 0.15) {
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

/* ── Animated counter ── */
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const duration = 1200;
        const step = (ts: number) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / duration, 1);
          setCount(Math.round(p * end));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ═══════════════════════════════════════════════
   HOMEPAGE — Clean, professional hackathon landing
   ═══════════════════════════════════════════════ */
export default function Home() {
  const features = useInView();
  const howItWorks = useInView();
  const stats = useInView();
  const cta = useInView();

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="transparent" />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light pt-32 pb-20 md:pt-40 md:pb-28">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />

        {/* Floating shapes */}
        <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-10 left-[5%] w-96 h-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium text-white/80">Built for Hack Canada 2025</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight animate-fade-in-up">
              Know your land
              <br />
              <span className="text-white/70">before you build.</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-white/60 max-w-xl leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              AI-powered environmental and regulatory pre-screening for Ontario land development. Drop a pin, get answers.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <Link href="/assess" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-primary-dark rounded-lg text-sm font-semibold hover:bg-white/90 transition-all shadow-lg shadow-black/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Start Assessment
              </Link>
              <Link href="/recommend" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg text-sm font-semibold hover:bg-white/20 transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                AI Site Finder
              </Link>
            </div>
          </div>

          {/* Hero visual — mini assessment preview */}
          <div className="hidden lg:block absolute top-24 right-6 w-[360px] animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Waterloo, ON</p>
                  <p className="text-xs text-white/50">43.4723° N, 80.5449° W</p>
                </div>
              </div>
              {/* Score */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4"/>
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 20}`} strokeDashoffset={`${2 * Math.PI * 20 * 0.22}`}/>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-green-400">78</span>
                </div>
                <div>
                  <p className="text-xs text-white/50">Viability Score</p>
                  <p className="text-sm font-semibold text-green-400">Good</p>
                </div>
              </div>
              {/* Mini categories */}
              {[
                { label: "Flood Risk", status: "Clear", color: "bg-green-400" },
                { label: "Zoning", status: "Warning", color: "bg-yellow-400" },
                { label: "Protected Areas", status: "Clear", color: "bg-green-400" },
                { label: "Contamination", status: "Clear", color: "bg-green-400" },
              ].map((cat) => (
                <div key={cat.label} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-white/60">{cat.label}</span>
                  <span className="flex items-center gap-1.5 text-xs text-white/80">
                    <span className={`w-1.5 h-1.5 rounded-full ${cat.color}`} />
                    {cat.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div ref={stats.ref} className="bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: 6, suffix: "", label: "Data Layers" },
            { value: 47, suffix: "", label: "Ontario Zones" },
            { value: 15, suffix: "", label: "Regions Covered" },
            { value: 100, suffix: "%", label: "AI-Powered" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">
                {stats.visible ? <Counter end={stat.value} suffix={stat.suffix} /> : "0" + stat.suffix}
              </p>
              <p className="text-xs text-muted mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section ref={features.ref} className="py-20 md:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Core Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">Everything you need for land decisions</h2>
            <p className="text-muted mt-3 max-w-xl mx-auto">Three powerful tools that combine real geospatial data with AI to give you actionable insights.</p>
          </div>

          <div className={`grid md:grid-cols-3 gap-6 transition-all duration-700 ${features.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {[
              {
                icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
                title: "Land Assessment",
                description: "Drop a pin anywhere in Ontario. Get instant analysis of flood risk, zoning, contamination, protected areas, Indigenous lands, and greenbelt status.",
                href: "/assess",
                cta: "Start assessing",
                color: "from-primary/10 to-primary/5",
              },
              {
                icon: <><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></>,
                title: "AI Site Finder",
                description: "Describe your project and our AI analyzes 47 zones across Ontario — environment, regulations, competition, and costs — to find optimal sites.",
                href: "/recommend",
                cta: "Find sites",
                color: "from-blue-500/10 to-blue-500/5",
              },
              {
                icon: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
                title: "Dashboard",
                description: "Track all your assessments in one place. Compare viability scores across different locations to make data-driven development decisions.",
                href: "/dashboard",
                cta: "View dashboard",
                color: "from-amber-500/10 to-amber-500/5",
              },
            ].map((feature, i) => (
              <div key={feature.title} className="group p-6 rounded-2xl border border-border bg-surface hover:border-primary/30 hover:shadow-lg transition-all duration-300" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{feature.icon}</svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted leading-relaxed mb-4">{feature.description}</p>
                <Link href={feature.href} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors group-hover:gap-2">
                  {feature.cta}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section ref={howItWorks.ref} className="py-20 md:py-28 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">Three steps to clarity</h2>
          </div>

          <div className={`grid md:grid-cols-3 gap-8 transition-all duration-700 ${howItWorks.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {[
              { step: "1", title: "Drop a Pin", desc: "Click anywhere on the interactive map or search an address to select your site of interest." },
              { step: "2", title: "AI Analyzes", desc: "Our engine queries 6 real geospatial layers and sends results to Gemini AI for comprehensive analysis." },
              { step: "3", title: "Get Your Report", desc: "Receive a viability score, category breakdowns, critical blockers, regulatory pathway, and cost estimates." },
            ].map((item, i) => (
              <div key={item.step} className="text-center" style={{ transitionDelay: `${i * 150}ms` }}>
                <div className="w-14 h-14 rounded-2xl bg-primary text-white text-xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DATA SOURCES ── */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Data Sources</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">Backed by real Ontario data</h2>
            <p className="text-muted mt-3 max-w-xl mx-auto">We query authoritative government datasets — not guesswork.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Flood Zones", color: "#3b82f6", icon: "💧" },
              { label: "Zoning Maps", color: "#8b5cf6", icon: "🏗️" },
              { label: "Contaminated Sites", color: "#ef4444", icon: "⚠️" },
              { label: "Protected Areas", color: "#22c55e", icon: "🌲" },
              { label: "Indigenous Treaties", color: "#f59e0b", icon: "📜" },
              { label: "Greenbelt Boundaries", color: "#10b981", icon: "🟢" },
            ].map((layer) => (
              <div key={layer.label} className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border">
                <span className="text-xl">{layer.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{layer.label}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }} />
                    <span className="text-xs text-muted">GeoJSON Layer</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section ref={cta.ref} className="py-20 md:py-28 bg-gradient-to-br from-primary-dark via-primary to-primary-light">
        <div className={`max-w-3xl mx-auto px-6 text-center transition-all duration-700 ${cta.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to build smarter?</h2>
          <p className="mt-4 text-lg text-white/60 max-w-md mx-auto">
            Stop guessing about land viability. Get data-driven answers in seconds.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/assess" className="px-8 py-3.5 bg-white text-primary-dark rounded-lg text-sm font-semibold hover:bg-white/90 transition-all shadow-lg">
              Start Your First Assessment
            </Link>
            <Link href="/recommend" className="px-8 py-3.5 bg-white/10 text-white border border-white/20 rounded-lg text-sm font-semibold hover:bg-white/20 transition-all">
              Try AI Site Finder
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-foreground py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span className="text-sm font-semibold text-white/80">TerraCheck</span>
          </div>
          <p className="text-xs text-white/40">Built for Hack Canada 2025 · AI-powered land viability</p>
          <div className="flex gap-4">
            <Link href="/assess" className="text-xs text-white/40 hover:text-white/70 transition-colors">Assess</Link>
            <Link href="/recommend" className="text-xs text-white/40 hover:text-white/70 transition-colors">Recommend</Link>
            <Link href="/dashboard" className="text-xs text-white/40 hover:text-white/70 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
