type Status = "clear" | "warning" | "critical";

interface CategoryCardProps {
  title: string;
  status: Status;
  summary: string;
}

const statusConfig: Record<Status, { label: string; dotClass: string; bgClass: string; textClass: string }> = {
  clear: {
    label: "Clear",
    dotClass: "bg-status-clear",
    bgClass: "bg-status-clear/8",
    textClass: "text-status-clear",
  },
  warning: {
    label: "Warning",
    dotClass: "bg-status-warning",
    bgClass: "bg-status-warning/8",
    textClass: "text-status-warning",
  },
  critical: {
    label: "Critical",
    dotClass: "bg-status-critical",
    bgClass: "bg-status-critical/8",
    textClass: "text-status-critical",
  },
};

export default function CategoryCard({ title, status, summary }: CategoryCardProps) {
  const config = statusConfig[status];

  return (
    <div className="p-4 bg-surface rounded-lg border border-border hover:border-border/80 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
          {config.label}
        </span>
      </div>
      <p className="text-sm text-muted leading-relaxed">{summary}</p>
    </div>
  );
}
