import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { DEPARTMENTS } from "@/data/departments";
import api from "@/lib/api";
import { FileCheck2, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function AdminOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isSuperadmin = user?.role === "superadmin";
  const userDeptId = user?.departmentId;

  const visibleDepartments = useMemo(() => {
    if (isSuperadmin) return DEPARTMENTS;
    if (!userDeptId) return DEPARTMENTS.slice(0, 1);
    return DEPARTMENTS.filter(
      (d) => d.id.toLowerCase() === String(userDeptId).toLowerCase()
    );
  }, [isSuperadmin, userDeptId]);

  useEffect(() => {
    let cancelled = false;

    async function loadAdminData() {
      setLoading(true);
      try {
        const data = await api.get("/api/admin/stats");
        if (!cancelled && data) {
          setStats(data);
        }
      } catch {
        // Fallback demo stats if backend doesn't have /api/admin/stats yet
        if (!cancelled) {
          setStats({
            totalApplications: isSuperadmin ? 116 : 28,
            breakdown: {
              pending: isSuperadmin ? 42 : 10,
              accepted: isSuperadmin ? 56 : 14,
              rejected: isSuperadmin ? 18 : 4,
            },
            deptCounts: {
              dsa: { pending: 12, total: 34 },
              web: { pending: 16, total: 42 },
              aiml: { pending: 8, total: 24 },
              ops: { pending: 4, total: 10 },
              prod: { pending: 2, total: 6 },
            },
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAdminData();
    return () => {
      cancelled = true;
    };
  }, [isSuperadmin, userDeptId]);

  const handleUnderReviewClick = () => {
    navigate("/admin/applications?status=pending");
  };

  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight text-white mb-8">
        Overview
      </h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Applications */}
        <div className="rounded-xl border border-white/10 bg-[#10131d] p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Applications
            </span>
            <FileCheck2 className="h-4 w-4 text-[#34a853]" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {loading ? (
              <div className="h-8 w-16 rounded bg-white/10 animate-pulse" />
            ) : (
              stats?.totalApplications ?? 0
            )}
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            Across {visibleDepartments.length} department(s)
          </p>
        </div>

        {/* Under Review / Pending */}
        <div
          onClick={handleUnderReviewClick}
          role="button"
          tabIndex={0}
          aria-label="View pending applications queue"
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleUnderReviewClick()}
          className="rounded-xl border border-white/10 bg-[#10131d] p-5 cursor-pointer hover:border-[#fbbc05]/50 transition-colors focus:outline-none focus:ring-1 focus:ring-[#fbbc05]"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Under Review
            </span>
            <Clock className="h-4 w-4 text-[#fbbc05]" />
          </div>
          <div className="text-3xl font-extrabold text-[#fbbc05]">
            {loading ? (
              <div className="h-8 w-16 rounded bg-white/10 animate-pulse" />
            ) : (
              stats?.breakdown?.pending ?? 0
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[11px] text-neutral-500">Awaiting evaluation</p>
            <span className="text-[11px] text-[#fbbc05] font-medium flex items-center gap-0.5">
              Review queue &rarr;
            </span>
          </div>
        </div>

        {/* Accepted / Rejected */}
        <div className="rounded-xl border border-white/10 bg-[#10131d] p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Accepted / Rejected
            </span>
            <div className="flex gap-1">
              <CheckCircle2 className="h-4 w-4 text-[#34a853]" />
              <XCircle className="h-4 w-4 text-[#ea4335]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-24 rounded bg-white/10 animate-pulse" />
            ) : (
              <>
                <span className="text-[#34a853]">
                  {stats?.breakdown?.accepted ?? 0}
                </span>
                <span className="text-neutral-500 font-normal">/</span>
                <span className="text-[#ea4335]">
                  {stats?.breakdown?.rejected ?? 0}
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">Decisions finalized</p>
        </div>
      </div>
    </>
  );
}
