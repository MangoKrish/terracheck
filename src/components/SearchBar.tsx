"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface SearchBarProps {
  onLocationSelect?: (lat: number, lng: number, name: string) => void;
}

export default function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=ca&limit=5&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data: SearchResult[] = await res.json();
      setResults(data);
      setShowDropdown(data.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 400);
  };

  const handleSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const parts = result.display_name.split(",");
    const shortName = parts.slice(0, 3).join(",").trim();
    setQuery(shortName);
    setShowDropdown(false);
    onLocationSelect?.(lat, lng, shortName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && results.length > 0) {
      handleSelect(results[0]);
    }
    if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setShowDropdown(true)}
        placeholder="Search an address or place..."
        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-[1100] overflow-hidden">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-surface-hover transition-colors flex items-start gap-2 border-b border-border-light last:border-0"
            >
              <svg className="w-4 h-4 text-muted shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span className="line-clamp-2">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
