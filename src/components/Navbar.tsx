"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
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

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <nav className="h-16 border-b border-border bg-surface flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-foreground tracking-tight">TerraCheck</span>
        </Link>

        {pathname !== "/" && (
          <div className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "text-primary bg-primary/8"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/assess"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === "/assess"
                  ? "text-primary bg-primary/8"
                  : "text-muted hover:text-foreground"
              }`}
            >
              New Assessment
            </Link>
          </div>
        )}
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
            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Sign In
          </a>
        )}
      </div>
    </nav>
  );
}
