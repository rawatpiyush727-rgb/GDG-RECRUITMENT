import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { DEPARTMENTS } from "@/data/departments";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  Pencil,
  Trash2,
  Plus,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminAnnouncements() {
  const { user } = useAuth();

  const isSuperadmin = user?.role === "superadmin";
  const userDeptId = user?.departmentId;

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [submittingAnn, setSubmittingAnn] = useState(false);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newScope, setNewScope] = useState("global");
  const [newDeptId, setNewDeptId] = useState(DEPARTMENTS[0]?.id || "dsa");

  // Edit form state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editScope, setEditScope] = useState("global");
  const [editDeptId, setEditDeptId] = useState("dsa");
  const [savingEdit, setSavingEdit] = useState(false);

  // Fetch announcements
  const loadAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const data = await api.get("/api/announcements");
      if (Array.isArray(data)) {
        setAnnouncements(data);
      }
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [isSuperadmin, userDeptId]);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (newTitle.trim().length < 3 || newTitle.trim().length > 120) {
      toast({
        variant: "destructive",
        title: "Invalid Title",
        description: "Title must be between 3 and 120 characters.",
      });
      return;
    }
    if (!newBody.trim() || newBody.trim().length > 2000) {
      toast({
        variant: "destructive",
        title: "Invalid Body",
        description: "Body is required and must not exceed 2000 characters.",
      });
      return;
    }

    setSubmittingAnn(true);
    try {
      const payload = {
        title: newTitle.trim(),
        body: newBody.trim(),
      };
      if (isSuperadmin) {
        payload.scope = newScope;
        if (newScope === "department") {
          payload.departmentId = newDeptId;
        }
      }
      const created = await api.post("/api/announcements", payload);
      setAnnouncements((prev) => [created, ...prev]);
      setNewTitle("");
      setNewBody("");
      if (isSuperadmin) {
        setNewScope("global");
        setNewDeptId(DEPARTMENTS[0]?.id || "dsa");
      }
      toast({
        title: "Announcement Created",
        description: "Announcement posted successfully.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Publish Failed",
        description: err?.message || "Could not create announcement.",
      });
    } finally {
      setSubmittingAnn(false);
    }
  };

  const startEdit = (ann) => {
    setEditingId(ann._id);
    setEditTitle(ann.title);
    setEditBody(ann.body);
    setEditScope(ann.scope);
    setEditDeptId(ann.departmentId || DEPARTMENTS[0]?.id || "dsa");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
  };

  const handleSaveEdit = async (id) => {
    if (editTitle.trim().length < 3 || editTitle.trim().length > 120) {
      toast({
        variant: "destructive",
        title: "Invalid Title",
        description: "Title must be between 3 and 120 characters.",
      });
      return;
    }
    if (!editBody.trim() || editBody.trim().length > 2000) {
      toast({
        variant: "destructive",
        title: "Invalid Body",
        description: "Body is required and must not exceed 2000 characters.",
      });
      return;
    }

    setSavingEdit(true);
    try {
      const payload = {
        title: editTitle.trim(),
        body: editBody.trim(),
      };
      if (isSuperadmin) {
        payload.scope = editScope;
        if (editScope === "department") {
          payload.departmentId = editDeptId;
        }
      }
      const updated = await api.patch(`/api/announcements/${id}`, payload);
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === id ? updated : a))
      );
      setEditingId(null);
      toast({
        title: "Announcement Updated",
        description: "Your changes have been saved.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err?.message || "Could not update announcement.",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await api.delete(`/api/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      toast({
        title: "Announcement Deleted",
        description: "The announcement has been deleted.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: err?.message || "Could not delete announcement.",
      });
    }
  };

  const getDeptDisplayName = (deptId) => {
    const found = DEPARTMENTS.find(
      (d) => d.id.toLowerCase() === String(deptId).toLowerCase()
    );
    return found ? found.title : (deptId ? deptId.toUpperCase() : "Department");
  };

  const formatAnnDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">
        Announcements
      </h1>
      <p className="text-xs text-neutral-400 mb-8">
        {announcements.length} announcement{announcements.length === 1 ? "" : "s"}
      </p>

      {/* Create Announcement Form */}
      <div className="rounded-xl border border-white/10 bg-[#10131d] p-5 sm:p-6 mb-6">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4 text-[#4285f4]" />
          Post an Announcement
        </h3>
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label
              htmlFor="announcement-title"
              className="block text-xs font-medium text-neutral-300 mb-1.5"
            >
              Title (3–120 characters)
            </label>
            <input
              id="announcement-title"
              type="text"
              required
              minLength={3}
              maxLength={120}
              placeholder="e.g., Orientation Details, Workshop Schedule..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#080808] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#4285f4] focus:ring-1 focus:ring-[#4285f4]"
            />
          </div>

          <div>
            <label
              htmlFor="announcement-body"
              className="block text-xs font-medium text-neutral-300 mb-1.5"
            >
              Message Body (Plain text, up to 2000 characters)
            </label>
            <textarea
              id="announcement-body"
              required
              rows={4}
              maxLength={2000}
              placeholder="Write your announcement here..."
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#080808] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#4285f4] focus:ring-1 focus:ring-[#4285f4] resize-y"
            />
          </div>

          {/* Scope control: ABSOLUTELY ABSENT FROM DOM FOR departmentAdmin */}
          {isSuperadmin && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1 pb-1">
              <span className="text-xs font-medium text-neutral-300">
                Scope:
              </span>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="radio"
                    name="create-ann-scope"
                    value="global"
                    checked={newScope === "global"}
                    onChange={() => setNewScope("global")}
                    className="text-[#4285f4] focus:ring-[#4285f4] bg-[#080808] border-white/20"
                  />
                  <span>Global (All Students)</span>
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="radio"
                    name="create-ann-scope"
                    value="department"
                    checked={newScope === "department"}
                    onChange={() => setNewScope("department")}
                    className="text-[#4285f4] focus:ring-[#4285f4] bg-[#080808] border-white/20"
                  />
                  <span>Specific Department</span>
                </label>
              </div>

              {newScope === "department" && (
                <div className="flex items-center gap-2">
                  <label htmlFor="create-ann-dept" className="text-xs text-neutral-400">
                    Department:
                  </label>
                  <select
                    id="create-ann-dept"
                    value={newDeptId}
                    onChange={(e) => setNewDeptId(e.target.value)}
                    className="rounded-lg border border-white/10 bg-[#080808] text-xs text-white px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#4285f4]"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={submittingAnn}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4285f4] text-xs font-semibold text-white hover:bg-[#4285f4]/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]"
            >
              {submittingAnn ? "Posting..." : "Post Announcement"}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Announcements List */}
      {loadingAnnouncements ? (
        <div className="space-y-3" aria-label="Loading announcements">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-28 w-full rounded-xl border border-white/10 bg-[#111625]/40 animate-pulse"
            />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#10131d] p-8 text-center text-neutral-400 text-xs sm:text-sm">
          No announcements yet.
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => {
            const isEditing = editingId === ann._id;
            const isGlobal = ann.scope === "global";
            const sourceLabel = isGlobal
              ? "Global"
              : getDeptDisplayName(ann.departmentId);

            if (isEditing) {
              return (
                <div
                  key={ann._id}
                  className="rounded-xl border border-[#4285f4]/50 bg-[#10131d] p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      Edit Announcement
                    </span>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="text-neutral-400 hover:text-white text-xs"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={120}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#080808] px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#4285f4]"
                  />
                  <textarea
                    rows={3}
                    maxLength={2000}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#080808] px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#4285f4] resize-y"
                  />

                  {/* If superadmin, allow changing scope during edit as well */}
                  {isSuperadmin && (
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <label className="inline-flex items-center gap-1.5 text-xs text-neutral-300">
                        <input
                          type="radio"
                          name={`edit-scope-${ann._id}`}
                          value="global"
                          checked={editScope === "global"}
                          onChange={() => setEditScope("global")}
                          className="text-[#4285f4] focus:ring-[#4285f4] bg-[#080808] border-white/20"
                        />
                        <span>Global</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 text-xs text-neutral-300">
                        <input
                          type="radio"
                          name={`edit-scope-${ann._id}`}
                          value="department"
                          checked={editScope === "department"}
                          onChange={() => setEditScope("department")}
                          className="text-[#4285f4] focus:ring-[#4285f4] bg-[#080808] border-white/20"
                        />
                        <span>Department</span>
                      </label>
                      {editScope === "department" && (
                        <select
                          value={editDeptId}
                          onChange={(e) => setEditDeptId(e.target.value)}
                          className="rounded-lg border border-white/10 bg-[#080808] text-xs text-white px-2.5 py-1"
                        >
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.title}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-neutral-300 hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={savingEdit}
                      onClick={() => handleSaveEdit(ann._id)}
                      className="px-3 py-1.5 rounded-lg bg-[#4285f4] text-xs font-semibold text-white hover:bg-[#4285f4]/90 transition-colors disabled:opacity-50"
                    >
                      {savingEdit ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={ann._id}
                className="rounded-xl border border-white/10 bg-[#10131d] p-5 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border",
                          isGlobal
                            ? "bg-[#4285f4]/15 text-[#4285f4] border-[#4285f4]/30"
                            : "bg-[#fbbc05]/15 text-[#fbbc05] border-[#fbbc05]/30"
                        )}
                      >
                        {sourceLabel}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {formatAnnDate(ann.createdAt)}
                      </span>
                      {(() => {
                        const author = ann.createdBy?.name;
                        const cleanName =
                          author === "GDG Super Admin" || author?.toLowerCase() === "super admin"
                            ? "Piyush Rawat"
                            : author;
                        return cleanName ? (
                          <span className="text-[11px] text-neutral-500">
                            · by {cleanName}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <h4 className="text-base font-semibold text-white pt-1">
                      {ann.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed pt-1">
                      {ann.body}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1 shrink-0 ml-2">
                    <button
                      type="button"
                      aria-label={`Edit announcement: ${ann.title}`}
                      title="Edit announcement"
                      onClick={() => startEdit(ann)}
                      className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete announcement: ${ann.title}`}
                      title="Delete announcement"
                      onClick={() => handleDeleteAnnouncement(ann._id)}
                      className="p-1.5 rounded-md text-neutral-400 hover:text-[#ea4335] hover:bg-[#ea4335]/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea4335]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete</span>
                    </button>
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
