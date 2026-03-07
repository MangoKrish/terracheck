import Link from "next/link";

interface AssessmentCardProps {
  id: string;
  location: string;
  date: string;
  score: number;
  layerCount: number;
}

export default function AssessmentCard({ id, location, date, score, layerCount }: AssessmentCardProps) {
  const getScoreColor = () => {
    if (score >= 70) return "text-status-clear bg-status-clear/10";
    if (score >= 40) return "text-status-warning bg-status-warning/10";
    return "text-status-critical bg-status-critical/10";
  };

  return (
    <Link href={`/assess?id=${id}`}>
      <div className="group bg-surface rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
        {/* Mini map placeholder */}
        <div className="w-full h-32 bg-[#e8f0e8] rounded-lg mb-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-15">
            <svg width="100%" height="100%">
              <defs>
                <pattern id={`grid-${id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2D6A4F" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-${id})`} />
            </svg>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#2D6A4F" stroke="#1B4332" strokeWidth="1">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" fill="white" stroke="none" />
            </svg>
          </div>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {location}
            </h3>
            <p className="text-xs text-muted mt-1">{date}</p>
          </div>
          <span className={`shrink-0 text-sm font-bold px-2.5 py-1 rounded-lg ${getScoreColor()}`}>
            {score}
          </span>
        </div>

        <p className="text-xs text-muted-light mt-3">{layerCount} data layers analyzed</p>
      </div>
    </Link>
  );
}
