import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { DEPARTMENTS } from "@/data/departments";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Filter,
  X,
  History,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminApplications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const hasToastedUnauthorized = useRef(false);

  const isSuperadmin = user?.role === "superadmin";
  const userDeptId = user?.departmentId;

  // Department filter: from query param for superadmin, auto-scoped for departmentAdmin
  const deptParam = searchParams.get("department") || "all";
  const effectiveDept = isSuperadmin ? deptParam : (userDeptId || "all");

  const currentDept = useMemo(() => {
    if (effectiveDept === "all") return null;
    return DEPARTMENTS.find((d) => d.id.toLowerCase() === String(effectiveDept).toLowerCase());
  }, [effectiveDept]);

  // Access control: departmentAdmin can only view their own department
  const isUnauthorized = useMemo(() => {
    if (!user) return false;
    if (isSuperadmin) return false;
    if (!userDeptId) return true;
    // If a dept param is specified and it's not theirs, block
    if (deptParam !== "all" && String(userDeptId).toLowerCase() !== String(deptParam).toLowerCase()) {
      return true;
    }
    return false;
  }, [user, isSuperadmin, userDeptId, deptParam]);

  useEffect(() => {
    if (isUnauthorized && !hasToastedUnauthorized.current) {
      hasToastedUnauthorized.current = true;
      toast({
        variant: "destructive",
        description: "You do not have access to that department",
      });
    }
  }, [isUnauthorized]);

  // Filter & Search states
  const initialStatus = searchParams.get("status") || "all";
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Sync status filter with URL query param
  useEffect(() => {
    const urlStatus = searchParams.get("status");
    if (urlStatus && urlStatus !== statusFilter) {
      setStatusFilter(urlStatus);
    }
  }, [searchParams]);

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    const newParams = new URLSearchParams(searchParams);
    if (status === "all") {
      newParams.delete("status");
    } else {
      newParams.set("status", status);
    }
    setSearchParams(newParams);
  };

  const handleDeptFilterChange = (dept) => {
    const newParams = new URLSearchParams(searchParams);
    if (dept === "all") {
      newParams.delete("department");
    } else {
      newParams.set("department", dept);
    }
    setSearchParams(newParams);
  };

  // Determine if we show the Department column in the table
  const showDeptColumn = effectiveDept === "all";

  // Fetch applications
  useEffect(() => {
    if (isUnauthorized) return;

    let cancelled = false;

    async function loadApplicants() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (effectiveDept && effectiveDept !== "all") {
          params.set("departmentId", effectiveDept);
        }
        if (statusFilter && statusFilter !== "all") {
          params.set("status", statusFilter);
        }
        if (searchQuery.trim()) {
          params.set("search", searchQuery.trim());
        }

        const queryStr = params.toString() ? `?${params.toString()}` : "";
        const data = await api.get(`/api/applications${queryStr}`);

        if (!cancelled) {
          setApplications(Array.isArray(data) ? data : []);
          if (selectedApp) {
            const updated = data.find((a) => a._id === selectedApp._id);
            if (updated) setSelectedApp(updated);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load applicants:", err);
          setApplications([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadApplicants();
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [effectiveDept, statusFilter, searchQuery, isUnauthorized]);

  // Handle status update
  const handleUpdateStatus = async (appId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const updated = await api.patch(`/api/applications/${appId}/status`, {
        status: newStatus,
      });

      setApplications((prev) =>
        prev.map((app) => (app._id === appId ? updated : app))
      );
      if (selectedApp?._id === appId) {
        setSelectedApp(updated);
      }

      toast({
        title: "Status Updated",
        description: `Application marked as ${newStatus}.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message || "Could not update status.",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (isUnauthorized) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">
        Applications
      </h1>
      <p className="text-xs text-neutral-400 mb-8">
        {currentDept
          ? `${currentDept.title} department applicants`
          : "Cross-department queue of all applications"}
      </p>

      {/* Filters Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by applicant name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#10131d] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#4285f4] focus:ring-1 focus:ring-[#4285f4] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Department Filter – superadmin only */}
          {isSuperadmin && (
            <div className="flex items-center gap-1.5 bg-[#10131d] p-1 rounded-lg border border-white/10">
              <span className="text-[11px] font-medium text-neutral-400 px-2 flex items-center gap-1">
                <Layers className="h-3 w-3" /> Dept:
              </span>
              <select
                value={deptParam}
                onChange={(e) => handleDeptFilterChange(e.target.value)}
                className="bg-transparent text-xs text-white px-2 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4285f4] cursor-pointer"
              >
                <option value="all" className="bg-[#10131d]">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id} className="bg-[#10131d]">
                    {dept.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-[#10131d] p-1 rounded-lg border border-white/10 overflow-x-auto">
            <span className="text-[11px] font-medium text-neutral-400 px-2 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Status:
            </span>
            {[
              { id: "all", label: "All" },
              { id: "pending", label: "Pending" },
              { id: "accepted", label: "Accepted" },
              { id: "rejected", label: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleStatusFilterChange(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                  statusFilter === tab.id
                    ? "bg-[#4285f4] text-white"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-neutral-400 bg-[#10131d] px-3.5 py-2 rounded-lg border border-white/10">
          Total results: <strong className="text-white">{applications.length}</strong>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="rounded-xl border border-white/10 bg-[#10131d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-white/[0.02] border-b border-white/10 uppercase tracking-wider text-[11px] text-neutral-400 font-semibold">
              <tr>
                <th scope="col" className="px-5 py-3.5">Applicant</th>
                <th scope="col" className="px-5 py-3.5">Email</th>
                {showDeptColumn && (
                  <th scope="col" className="px-5 py-3.5">Department</th>
                )}
                <th scope="col" className="px-5 py-3.5">Applied Date</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={showDeptColumn ? 6 : 5} className="py-12 text-center text-neutral-500">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/20 border-t-[#4285f4] rounded-full animate-spin" />
                      Loading applicants...
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={showDeptColumn ? 6 : 5} className="py-12 text-center text-neutral-500">
                    No applications found matching the current filters.
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const applicantName = app.userId?.name || app.formData?.fullName || "Anonymous";
                  const applicantEmail = app.userId?.email || app.formData?.email || "—";
                  const appliedDateStr = app.appliedDate || app.createdAt;
                  const formattedDate = appliedDateStr
                    ? new Date(appliedDateStr).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  const isPending = app.status === "pending" || app.status === "under_review";
                  const isAccepted = app.status === "accepted";
                  const isRejected = app.status === "rejected";

                  return (
                    <tr
                      key={app._id}
                      onClick={() => setSelectedApp(app)}
                      className={cn(
                        "hover:bg-white/[0.03] transition-colors cursor-pointer",
                        selectedApp?._id === app._id && "bg-white/[0.04]"
                      )}
                    >
                      <td className="px-5 py-4 font-semibold text-white flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-neutral-300">
                          {applicantName.charAt(0).toUpperCase()}
                        </div>
                        <span>{applicantName}</span>
                      </td>
                      <td className="px-5 py-4 font-mono text-neutral-400">
                        {applicantEmail}
                      </td>
                      {showDeptColumn && (
                        <td className="px-5 py-4 uppercase font-semibold text-neutral-300 text-[11px]">
                          {app.departmentName || app.departmentId}
                        </td>
                      )}
                      <td className="px-5 py-4 text-neutral-400">
                        {formattedDate}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                            isAccepted
                              ? "bg-[#34a853]/20 text-[#34a853]"
                              : isRejected
                              ? "bg-[#ea4335]/20 text-[#ea4335]"
                              : "bg-[#fbbc05]/20 text-[#fbbc05]"
                          )}
                        >
                          <span className="h-1 w-1 rounded-full bg-current" />
                          {isPending ? "Pending" : app.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          aria-label={`Review application for ${applicantName}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApp(app);
                          }}
                          className="px-2.5 py-1 rounded bg-white/10 text-white hover:bg-white/20 text-xs transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applicant Detail Drawer / Slide-Over Modal */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex justify-end animate-in fade-in duration-200"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="w-full max-w-lg bg-[#10131d] border-l border-white/10 h-full overflow-y-auto p-6 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400">
                    Application Detail
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    {selectedApp.userId?.name || selectedApp.formData?.fullName || "Applicant"}
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Close detail panel"
                  onClick={() => setSelectedApp(null)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="mb-6 p-4 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
                    Current Evaluation Status
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
                        selectedApp.status === "accepted"
                          ? "bg-[#34a853]/20 text-[#34a853]"
                          : selectedApp.status === "rejected"
                          ? "bg-[#ea4335]/20 text-[#ea4335]"
                          : "bg-[#fbbc05]/20 text-[#fbbc05]"
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {selectedApp.status === "under_review" || selectedApp.status === "pending"
                        ? "Pending Review"
                        : selectedApp.status}
                    </span>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={updatingStatus || selectedApp.status === "accepted"}
                    onClick={() => handleUpdateStatus(selectedApp._id, "accepted")}
                    aria-label="Accept applicant"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#34a853] hover:bg-[#2d9248] text-white text-xs font-semibold disabled:opacity-40 transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Accept
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatus || selectedApp.status === "rejected"}
                    onClick={() => handleUpdateStatus(selectedApp._id, "rejected")}
                    aria-label="Reject applicant"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#ea4335] hover:bg-[#d3382b] text-white text-xs font-semibold disabled:opacity-40 transition-colors"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              </div>

              {/* Submission Details */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                    Email Address
                  </label>
                  <p className="mt-1 font-mono text-white">
                    {selectedApp.userId?.email || selectedApp.formData?.email || "—"}
                  </p>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                    Department
                  </label>
                  <p className="mt-1 text-white font-medium">
                    {selectedApp.departmentName || selectedApp.departmentId}
                  </p>
                </div>

                {selectedApp.yearOfStudy && (
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                      Year of Study
                    </label>
                    <p className="mt-1 text-white">{selectedApp.yearOfStudy}</p>
                  </div>
                )}

                {selectedApp.portfolioUrl && (
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                      Portfolio / GitHub / Work Link
                    </label>
                    <p className="mt-1">
                      <a
                        href={selectedApp.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4285f4] hover:underline inline-flex items-center gap-1 break-all"
                      >
                        {selectedApp.portfolioUrl}
                        <ExternalLink className="h-3 w-3 inline-block" />
                      </a>
                    </p>
                  </div>
                )}

                {selectedApp.statement && (
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                      Statement / Motivation
                    </label>
                    <div className="mt-1.5 p-3 rounded-lg bg-white/[0.02] border border-white/10 text-neutral-300 whitespace-pre-wrap leading-relaxed">
                      {selectedApp.statement}
                    </div>
                  </div>
                )}

                {selectedApp.formData && Object.keys(selectedApp.formData).length > 0 && (
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                      Additional Information
                    </label>
                    <div className="mt-1.5 p-3 rounded-lg bg-white/[0.02] border border-white/10 space-y-2">
                      {Object.entries(selectedApp.formData).map(([k, v]) => {
                        if (k === "fullName" || k === "email" || typeof v === "object") return null;
                        return (
                          <div key={k} className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-neutral-400 capitalize">{k}:</span>
                            <span className="text-white font-medium">{String(v)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Status History Audit Timeline */}
                {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 && (
                  <div className="pt-3 border-t border-white/10">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium flex items-center gap-1.5 mb-2">
                      <History className="h-3.5 w-3.5 text-neutral-400" />
                      Status History Audit
                    </label>
                    <div className="space-y-2">
                      {selectedApp.statusHistory.map((entry, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-white/[0.02] border border-white/5 text-[11px] flex items-center justify-between"
                        >
                          <span className="capitalize font-semibold text-white">
                            {entry.status}
                          </span>
                          <span className="text-neutral-400">
                            {new Date(entry.changedAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
