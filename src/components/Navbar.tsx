"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useState, useRef, useEffect } from "react";

interface NavbarProps {
  variant?: "solid" | "transparent";
  linkPrefix?: string;
}

export default function Navbar({ variant = "solid", linkPrefix = "" }: NavbarProps) {
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (variant !== "transparent") return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  /* ── Determine visual style ── */
  const isSolid = variant === "solid" || scrolled;

  const navCls = isSolid
    ? "bg-white/90 backdrop-blur-md border-b border-border text-foreground shadow-sm"
    : "bg-transparent text-white";

  const linkCls = (active: boolean) =>
    isSolid
      ? active
        ? "text-primary bg-primary/8"
        : "text-muted hover:text-foreground"
      : active
        ? "text-white bg-white/15"
        : "text-white/60 hover:text-white";

  return (
    <nav
      className={`h-16 flex items-center justify-between px-6 transition-all duration-500 ${
        variant === "transparent" ? "fixed top-0 inset-x-0 z-50" : ""
      } ${navCls}`}
    >
      <div className="flex items-center gap-8">
        <Link href={linkPrefix || "/"} className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isSolid ? "bg-primary" : "bg-white/15"}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">TerraCheck</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href={`${linkPrefix}/dashboard`}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${linkCls(pathname === `${linkPrefix}/dashboard`)}`}
          >
            Dashboard
          </Link>
          <Link
            href={`${linkPrefix}/assess`}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${linkCls(pathname === `${linkPrefix}/assess`)}`}
          >
            New Assessment
          </Link>
          <Link
            href={`${linkPrefix}/recommend`}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${linkCls(pathname === `${linkPrefix}/recommend`)}`}
          >
            Smart Recommend
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isLoading ? (
          <div className="w-8 h-8 rounded-full bg-border animate-pulse" />
        ) : user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 cursor-pointer"
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || "User"}
                  className="w-8 h-8 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-light/20 flex items-center justify-center text-sm font-medium text-primary-dark">
                  {initials}
                </div>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 w-56 bg-surface border border-border rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
                <a
                  href="/auth/logout"
                  className="block px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                >
                  Sign Out
                </a>
              </div>
            )}
          </div>
        ) : (
          <a
            href="/auth/login"
            className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-colors ${
              isSolid
                ? "border-primary text-primary hover:bg-primary hover:text-white"
                : "border-white/30 text-white hover:bg-white/10"
            }`}
          >
            Sign In
          </a>
        )}
      </div>
    </nav>
  );
}
