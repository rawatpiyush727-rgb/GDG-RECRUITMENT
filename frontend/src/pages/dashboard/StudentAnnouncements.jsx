import { useState, useEffect } from "react";
import { DEPARTMENTS } from "@/data/departments";
import api from "@/lib/api";
import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAnnouncements() {
      setAnnouncementsLoading(true);
      try {
        const data = await api.get("/api/announcements/mine");
        if (!cancelled && Array.isArray(data)) {
          setAnnouncements(data);
        }
      } catch (err) {
        console.error("Failed to load announcements:", err);
      } finally {
        if (!cancelled) setAnnouncementsLoading(false);
      }
    }

    loadAnnouncements();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatRelativeDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSourceLabel = (ann) => {
    if (ann.scope === "global") return "General";
    const match = DEPARTMENTS.find(
      (d) => d.id.toLowerCase() === String(ann.departmentId).toLowerCase()
    );
    return match ? match.title : (ann.departmentId ? ann.departmentId.toUpperCase() : "Department");
  };

  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">
        Announcements
      </h1>
      <p className="text-xs text-neutral-400 mb-8">
        {announcements.length} update{announcements.length === 1 ? "" : "s"}
      </p>

      {announcementsLoading ? (
        <div className="space-y-3" aria-label="Loading announcements">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 w-full rounded-xl border border-white/10 bg-[#111625]/40 animate-pulse"
            />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#10131d] p-8 sm:p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mb-4">
            <Megaphone className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-white">
            No announcements yet
          </h3>
          <p className="mt-1.5 text-xs text-neutral-400 max-w-sm mx-auto">
            Updates from GDG On Campus and departments you've applied to will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => {
            const isGlobal = ann.scope === "global";
            const sourceLabel = getSourceLabel(ann);

            return (
              <article
                key={ann._id}
                className="p-5 rounded-xl border border-white/10 bg-[#10131d] hover:border-white/20 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border",
                        isGlobal
                          ? "bg-[#4285f4]/15 text-[#4285f4] border-[#4285f4]/30"
                          : "bg-[#fbbc05]/15 text-[#fbbc05] border-[#fbbc05]/30"
                      )}
                    >
                      {sourceLabel}
                    </span>
                    {(() => {
                      const author = ann.createdBy?.name;
                      const cleanName =
                        author === "GDG Super Admin" || author?.toLowerCase() === "super admin"
                          ? "Piyush Rawat"
                          : author;
                      return cleanName ? (
                        <span className="text-[11px] text-neutral-400">
                          · by {cleanName}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <time
                    dateTime={ann.createdAt}
                    className="text-[11px] text-neutral-400"
                  >
                    {formatRelativeDate(ann.createdAt)}
                  </time>
                </div>
                <h3 className="text-base font-semibold text-white">
                  {ann.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
                  {ann.body}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
