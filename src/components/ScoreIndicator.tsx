interface ScoreIndicatorProps {
  score: number;
  label?: string;
}

export default function ScoreIndicator({ score, label = "Viability Score" }: ScoreIndicatorProps) {
  const getColor = () => {
    if (score >= 70) return { text: "text-status-clear", bg: "bg-status-clear", ring: "stroke-status-clear" };
    if (score >= 40) return { text: "text-status-warning", bg: "bg-status-warning", ring: "stroke-status-warning" };
    return { text: "text-status-critical", bg: "bg-status-critical", ring: "stroke-status-critical" };
  };

  const colors = getColor();
  const circumference = 2 * Math.PI * 36;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="rgba(236, 243, 158, 0.2)"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            className={colors.ring}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold ${colors.text}`}>{score}</span>
        </div>
      </div>
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className={`text-sm font-semibold ${colors.text}`}>
          {score >= 70 ? "Good" : score >= 40 ? "Moderate" : "High Risk"}
        </p>
      </div>
    </div>
  );
}
