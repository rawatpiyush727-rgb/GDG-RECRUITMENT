import { useState } from "react";
import { Link } from "react-router-dom";
import { useApplications } from "@/context/ApplicationsContext";
import { FileText, ArrowRight, ChevronDown, ExternalLink as LinkIcon, GraduationCap, AlignLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentApplications() {
  const { applications, loading } = useApplications();
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">
        My Applications
      </h1>
      <p className="text-xs text-neutral-400 mb-8">
        {applications.length} submitted
      </p>

      {/* Skeleton list while loading */}
      {loading ? (
        <div className="space-y-3" aria-label="Loading applications">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-20 w-full rounded-xl border border-white/10 bg-[#111625]/40 animate-pulse"
            />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#10131d] p-8 sm:p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mb-4">
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-white">
            No active applications yet
          </h3>
          <p className="mt-1.5 text-xs text-neutral-400 max-w-sm mx-auto">
            You haven't applied to any GDG On Campus departments yet. Explore our technical and creative teams to find your fit.
          </p>
          <div className="mt-6">
            <Link
              to="/departments"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4285f4] text-xs font-semibold text-white hover:bg-[#4285f4]/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]"
            >
              Browse departments
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app, index) => {
            const appId = app._id || index;
            const isExpanded = expandedId === appId;

            const deptName =
              app.departmentName ||
              app.department?.title ||
              app.departmentId?.toUpperCase() ||
              "Department";

            const appliedDate = app.createdAt
              ? new Date(app.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recently";

            const status = (app.status || "Under Review").toLowerCase();

            let statusBadgeStyle = "bg-[#fbbc05]/20 text-[#fbbc05] border-[#fbbc05]/40";
            if (status === "accepted") {
              statusBadgeStyle = "bg-[#34a853]/20 text-[#34a853] border-[#34a853]/40";
            } else if (status === "rejected") {
              statusBadgeStyle = "bg-[#ea4335]/20 text-[#ea4335] border-[#ea4335]/40";
            } else if (status === "under review" || status === "pending" || status === "under_review") {
              statusBadgeStyle = "bg-[#4285f4]/20 text-[#4285f4] border-[#4285f4]/40";
            }

            return (
              <div
                key={appId}
                className="rounded-xl border border-white/10 bg-[#10131d] transition-colors hover:border-white/20"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {deptName}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Applied on {appliedDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border",
                        statusBadgeStyle
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {app.status || "Under Review"}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleExpand(appId)}
                      className={cn(
                        "p-2 text-neutral-400 hover:text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4] rounded-lg",
                      )}
                      title={isExpanded ? "Collapse details" : "View application details"}
                      aria-expanded={isExpanded}
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Expandable detail panel (read-only) */}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="border-t border-white/[0.06] px-4 sm:px-5 pb-5 pt-4 space-y-4">
                    {/* Year of Study */}
                    {app.yearOfStudy && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-neutral-500" />
                          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                            Year of Study
                          </span>
                        </div>
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-neutral-200">
                          {app.yearOfStudy}
                        </div>
                      </div>
                    )}

                    {/* Portfolio URL */}
                    {app.portfolioUrl && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <LinkIcon className="h-3.5 w-3.5 text-neutral-500" />
                          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                            Portfolio / GitHub
                          </span>
                        </div>
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm">
                          <a
                            href={app.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#4285f4] hover:underline break-all"
                          >
                            {app.portfolioUrl}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Statement */}
                    {app.statement && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <AlignLeft className="h-3.5 w-3.5 text-neutral-500" />
                          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                            Statement of Interest
                          </span>
                        </div>
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">
                          {app.statement}
                        </div>
                      </div>
                    )}

                    {/* If none of the fields have data */}
                    {!app.yearOfStudy && !app.portfolioUrl && !app.statement && (
                      <p className="text-xs text-neutral-500 italic">
                        No additional details were submitted with this application.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
