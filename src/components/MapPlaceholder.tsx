export default function MapPlaceholder() {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-[#e8f0e8] rounded-xl overflow-hidden border border-border">
      {/* Grid pattern to suggest a map */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2D6A4F" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Center pin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
        <div className="flex flex-col items-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#2D6A4F" stroke="#1B4332" strokeWidth="1">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" fill="white" stroke="none" />
          </svg>
          <div className="w-2 h-2 rounded-full bg-primary/30 mt-[-2px]" />
        </div>
      </div>

      {/* Coordinates display */}
      <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs text-muted font-mono border border-border">
        43.4723° N, 80.5449° W
      </div>

      {/* Zoom controls placeholder */}
      <div className="absolute top-4 right-4 flex flex-col gap-1">
        <button className="w-8 h-8 bg-surface border border-border rounded-md flex items-center justify-center text-muted hover:text-foreground transition-colors text-lg leading-none">
          +
        </button>
        <button className="w-8 h-8 bg-surface border border-border rounded-md flex items-center justify-center text-muted hover:text-foreground transition-colors text-lg leading-none">
          −
        </button>
      </div>

      {/* Click hint */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8 bg-foreground/80 text-white text-xs px-3 py-1.5 rounded-full">
        Click anywhere to drop a pin
      </div>
    </div>
  );
}
