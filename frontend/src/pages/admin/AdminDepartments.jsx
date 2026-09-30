import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { DEPARTMENTS } from "@/data/departments";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDepartments() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState(DEPARTMENTS);

  const isSuperadmin = user?.role === "superadmin";
  const userDeptId = user?.departmentId;

  const visibleDepartments = useMemo(() => {
    if (isSuperadmin) return departments;
    if (!userDeptId) return departments.slice(0, 1);
    return departments.filter(
      (d) => d.id.toLowerCase() === String(userDeptId).toLowerCase()
    );
  }, [isSuperadmin, userDeptId, departments]);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setLoading(true);
      try {
        const data = await api.get("/api/admin/stats");
        if (!cancelled && data) setStats(data);
      } catch {
        if (!cancelled) {
          setStats({
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

    loadStats();
    return () => { cancelled = true; };
  }, [isSuperadmin, userDeptId]);

  const handleDeleteDepartment = (dept) => {
    const deptStats = stats?.deptCounts?.[dept.id];
    const totalApps = deptStats?.total || 0;

    if (totalApps > 0) {
      toast({
        variant: "destructive",
        title: "Cannot Delete Department",
        description: `Cannot delete ${dept.title} with existing applications (${totalApps} total).`,
      });
      return;
    }

    setDepartments((prev) => prev.filter((d) => d.id !== dept.id));
    toast({
      title: "Department Deleted",
      description: `${dept.title} has been successfully deleted.`,
    });
  };

  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight text-white mb-8">
        Departments
      </h1>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-neutral-400">
          Showing {visibleDepartments.length} of {departments.length} total
        </span>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#10131d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-white/[0.02] border-b border-white/10 uppercase tracking-wider text-[11px] text-neutral-400 font-semibold">
              <tr>
                <th scope="col" className="px-5 py-3.5">Department</th>
                <th scope="col" className="px-5 py-3.5">Applicants</th>
                <th scope="col" className="px-5 py-3.5">Deadline</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visibleDepartments.map((dept) => {
                const isClosed = dept.deadline
                  ? new Date(dept.deadline) < new Date()
                  : false;

                const formatted = dept.deadline
                  ? new Date(dept.deadline).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Open";

                const deptAppStats = stats?.deptCounts?.[dept.id] || {
                  pending: 0,
                  total: 0,
                };

                return (
                  <tr
                    key={dept.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4 font-semibold text-white">
                      {dept.title}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        to={`/admin/applications?department=${dept.id}`}
                        aria-label={`View applicants for ${dept.title}: ${deptAppStats.pending} pending, ${deptAppStats.total} total`}
                        className="inline-flex items-center gap-1.5 font-medium text-[#4285f4] hover:underline"
                      >
                        <span>
                          {deptAppStats.pending} pending · {deptAppStats.total} total
                        </span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-neutral-400">
                      {formatted}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                          isClosed
                            ? "bg-neutral-800 text-neutral-400"
                            : "bg-[#34a853]/20 text-[#34a853]"
                        )}
                      >
                        <span className="h-1 w-1 rounded-full bg-current" />
                        {isClosed ? "Closed" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          aria-label={`Edit ${dept.title} department`}
                          title={`Edit ${dept.title}`}
                          className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit {dept.title}</span>
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${dept.title} department`}
                          title={`Delete ${dept.title}`}
                          onClick={() => handleDeleteDepartment(dept)}
                          className="p-1.5 rounded-md text-neutral-400 hover:text-[#ea4335] hover:bg-[#ea4335]/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea4335]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete {dept.title}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
