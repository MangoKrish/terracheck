import Navbar from "@/components/Navbar";
import AssessmentCard from "@/components/AssessmentCard";
import Link from "next/link";

// Placeholder data — will come from API later
const savedAssessments = [
  {
    id: "1",
    location: "185 King St S, Waterloo, ON",
    date: "Mar 6, 2026",
    score: 78,
    layerCount: 5,
  },
  {
    id: "2",
    location: "450 Columbia St W, Waterloo, ON",
    date: "Mar 5, 2026",
    score: 42,
    layerCount: 6,
  },
  {
    id: "3",
    location: "200 University Ave W, Waterloo, ON",
    date: "Mar 4, 2026",
    score: 23,
    layerCount: 4,
  },
];

export default function Dashboard() {
  const isEmpty = false; // Toggle to true to see empty state

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Your Assessments</h1>
            <p className="text-sm text-muted mt-1">
              {isEmpty ? "No assessments yet" : `${savedAssessments.length} saved assessments`}
            </p>
          </div>
          <Link
            href="/assess"
            className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Assessment
          </Link>
        </div>

        {isEmpty ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">No assessments yet</h2>
            <p className="text-sm text-muted max-w-sm mb-6">
              Drop a pin on any location in Canada to get your first environmental and regulatory viability report.
            </p>
            <Link
              href="/assess"
              className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              Start your first assessment
            </Link>
          </div>
        ) : (
          /* Assessment grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedAssessments.map((assessment) => (
              <AssessmentCard key={assessment.id} {...assessment} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
