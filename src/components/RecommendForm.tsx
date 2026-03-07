"use client";

import { useState } from "react";
import { type RecommendRequest } from "@/lib/api";

interface RecommendFormProps {
  onSubmit: (data: RecommendRequest) => void;
  error: string | null;
}

const FIELDS = [
  {
    key: "org_type",
    label: "Organization Type",
    options: [
      { value: "government", label: "Government Agency" },
      { value: "private", label: "Private Developer" },
      { value: "nonprofit", label: "Non-Profit Organization" },
    ],
  },
  {
    key: "project_type",
    label: "Project Type",
    options: [
      { value: "affordable_housing", label: "Affordable Housing" },
      { value: "residential_condo", label: "Residential Condo" },
      { value: "commercial", label: "Commercial" },
      { value: "mixed_use", label: "Mixed-Use Development" },
      { value: "industrial", label: "Industrial" },
      { value: "community_center", label: "Community Center" },
    ],
  },
  {
    key: "scale",
    label: "Scale",
    options: [
      { value: "small", label: "Small (under 50 units)" },
      { value: "medium", label: "Medium (50-200 units)" },
      { value: "large", label: "Large (200+ units)" },
    ],
  },
  {
    key: "budget",
    label: "Budget Range",
    options: [
      { value: "under_5m", label: "Under $5M" },
      { value: "5_to_20m", label: "$5M - $20M" },
      { value: "20_to_50m", label: "$20M - $50M" },
      { value: "over_50m", label: "$50M+" },
    ],
  },
  {
    key: "priority",
    label: "Top Priority",
    options: [
      { value: "cost", label: "Cost Efficiency" },
      { value: "speed", label: "Speed to Market" },
      { value: "environmental", label: "Environmental Impact" },
      { value: "community", label: "Community Benefit" },
    ],
  },
  {
    key: "region",
    label: "Region",
    options: [
      { value: "waterloo", label: "Waterloo Region" },
      { value: "gta", label: "Greater Toronto Area" },
      { value: "ontario_wide", label: "Ontario-Wide" },
    ],
  },
] as const;

const DEFAULTS: RecommendRequest = {
  org_type: "private",
  project_type: "affordable_housing",
  scale: "medium",
  budget: "5_to_20m",
  priority: "cost",
  region: "waterloo",
  additional_requirements: "",
};

export default function RecommendForm({ onSubmit, error }: RecommendFormProps) {
  const [form, setForm] = useState<RecommendRequest>(DEFAULTS);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Find Optimal Locations</h2>
          <p className="text-xs text-muted">Describe your project and we'll find the best zones</p>
        </div>
      </div>

      {/* Form fields */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
        className="space-y-4"
      >
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              {field.label}
            </label>
            <select
              value={(form as Record<string, string>)[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
            >
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Additional requirements */}
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
            Additional Requirements
          </label>
          <textarea
            value={form.additional_requirements}
            onChange={(e) => handleChange("additional_requirements", e.target.value)}
            placeholder="e.g., Near transit, accessibility needs, sustainability goals..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-status-critical/5 border border-status-critical/20 rounded-lg">
            <p className="text-xs text-status-critical">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          Find Locations
        </button>
      </form>
    </div>
  );
}
