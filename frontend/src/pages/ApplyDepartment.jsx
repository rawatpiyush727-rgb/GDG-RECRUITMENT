import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { SpotlightNavbar } from "@/components/ui/spotlight-navbar";
import { DEPARTMENTS } from "@/data/departments";
import { useApplications } from "@/context/ApplicationsContext";
import { toast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, CheckCircle2, Clock, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Departments", href: "/departments" },
  { label: "About", href: "/#about" },
];

export default function ApplyDepartment() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { hasApplied, getApplication, applyToDepartment } = useApplications();

  const department = useMemo(() => {
    return DEPARTMENTS.find(
      (d) => d.id.toLowerCase() === (slug || "").toLowerCase()
    );
  }, [slug]);

  const isApplied = slug ? hasApplied(slug) : false;
  const existingApp = isApplied ? getApplication(slug) : null;

  const isClosed = department?.deadline
    ? new Date(department.deadline) < new Date()
    : false;

  const [formData, setFormData] = useState({
    yearOfStudy: "2nd Year",
    portfolioUrl: "",
    statement: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.statement.trim()) {
      setError("Please include a brief statement of interest");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await applyToDepartment(slug, {
        departmentName: department?.title || slug,
        yearOfStudy: formData.yearOfStudy,
        portfolioUrl: formData.portfolioUrl.trim(),
        statement: formData.statement.trim(),
      });

      // Requirement: Success toasts use the same verb as the button that triggered them ("Apply" produces "Applied")
      toast({
        variant: "success",
        title: "Applied",
        description: `Your application to ${department?.title || "department"} has been submitted successfully.`,
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!department) {
    return (
      <div className="min-h-screen w-full bg-[#080808] text-white flex flex-col">
        <SpotlightNavbar items={NAV_ITEMS} className="pt-3 sm:pt-4" />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Department Not Found</h1>
          <p className="mt-2 text-xs text-neutral-400">
            The department "{slug}" could not be found.
          </p>
          <Link
            to="/departments"
            className="mt-6 px-5 py-2.5 rounded-full bg-[#4285f4] text-xs font-semibold text-white"
          >
            Back to departments
          </Link>
        </main>
      </div>
    );
  }

  const formattedDeadline = department.deadline
    ? new Date(department.deadline).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen w-full bg-[#080808] text-white flex flex-col">
      <SpotlightNavbar items={NAV_ITEMS} className="pt-3 sm:pt-4" />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Back link */}
        <Link
          to="/departments"
          className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors mb-6 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4285f4] rounded"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to all departments
        </Link>

        {/* Card header */}
        <div className="rounded-2xl border border-white/10 bg-[#10131d] p-6 sm:p-8 shadow-2xl">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-medium tracking-wider uppercase text-[#4285f4] mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4285f4]" />
                Department Application
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {department.title}
              </h1>
              <p className="mt-2 text-xs text-neutral-300 leading-relaxed">
                {department.desc}
              </p>
            </div>
          </div>

          {/* Already applied banner */}
          {isApplied ? (
            <div className="rounded-xl border border-[#34a853]/30 bg-[#34a853]/10 p-5 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#34a853] shrink-0" />
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Application Already Submitted
                  </h2>
                  <p className="text-xs text-neutral-300 mt-0.5">
                    Current status:{" "}
                    <strong className="text-[#34a853] uppercase">
                      {existingApp?.status || "Under Review"}
                    </strong>
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to="/dashboard#applications"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#34a853] text-xs font-semibold text-white hover:bg-[#34a853]/90 transition-colors"
                >
                  View in Dashboard
                </Link>
              </div>
            </div>
          ) : isClosed ? (
            <div className="rounded-xl border border-neutral-700 bg-neutral-900/60 p-5 mb-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-neutral-400 shrink-0" />
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Applications Closed
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    The deadline for {department.title} was {formattedDeadline}.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-lg border border-[#ea4335]/30 bg-[#ea4335]/10 text-xs text-[#ea4335]"
                >
                  {error}
                </div>
              )}

              {formattedDeadline && (
                <div className="text-xs text-neutral-400 pb-1">
                  Application deadline: <span className="text-neutral-200">{formattedDeadline}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="yearOfStudy"
                  className="block text-xs font-semibold text-neutral-300 mb-1.5"
                >
                  Current Year of Study
                </label>
                <select
                  id="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      yearOfStudy: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]"
                >
                  <option value="1st Year" className="bg-[#10131d]">1st Year</option>
                  <option value="2nd Year" className="bg-[#10131d]">2nd Year</option>
                  <option value="3rd Year" className="bg-[#10131d]">3rd Year</option>
                  <option value="4th Year" className="bg-[#10131d]">4th Year</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="portfolioUrl"
                  className="block text-xs font-semibold text-neutral-300 mb-1.5"
                >
                  Portfolio / GitHub / Profile URL (optional)
                </label>
                <input
                  id="portfolioUrl"
                  type="url"
                  placeholder="https://github.com/username"
                  value={formData.portfolioUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      portfolioUrl: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]"
                />
              </div>

              <div>
                <label
                  htmlFor="statement"
                  className="block text-xs font-semibold text-neutral-300 mb-1.5"
                >
                  Why do you want to join this department? *
                </label>
                <textarea
                  id="statement"
                  rows={4}
                  required
                  placeholder="Tell us about your background, projects, or why you're interested in this department..."
                  value={formData.statement}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      statement: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl",
                    "bg-[#4285f4] text-white text-sm font-semibold",
                    "hover:bg-[#4285f4]/90 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]",
                    "disabled:opacity-50 disabled:pointer-events-none"
                  )}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Apply
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
