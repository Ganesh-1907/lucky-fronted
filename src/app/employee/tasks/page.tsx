"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ClipboardList, Plus, X, CheckCircle2, Clock, AlertCircle,
  Calendar, Trash2, Edit3
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import api from "@/lib/api";

const PRIORITY_CONFIGS: Record<string, { color: string; label: string }> = {
  URGENT: { color: "bg-red-500/15 text-red-400 border-red-500/30", label: "Urgent" },
  HIGH: { color: "bg-orange-500/15 text-orange-400 border-orange-500/30", label: "High" },
  MEDIUM: { color: "bg-blue-500/15 text-blue-400 border-blue-500/30", label: "Medium" },
  LOW: { color: "bg-slate-600/20 text-slate-400 border-slate-600/30", label: "Low" },
};

const STATUS_CONFIGS: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  PENDING: { color: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: <Clock size={12} />, label: "Pending" },
  IN_PROGRESS: { color: "bg-blue-500/15 text-blue-400 border-blue-500/30", icon: <AlertCircle size={12} />, label: "In Progress" },
  COMPLETED: { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: <CheckCircle2 size={12} />, label: "Completed" },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({});
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM",
  });
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (filterStatus) params.set("status", filterStatus);
      const res: any = await api.get(`/employee/tasks?${params.toString()}`);
      setTasks(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, page]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCreate = async () => {
    if (!form.title || !form.dueDate) return;
    setSaving(true);
    try {
      if (editTask) {
        await api.patch(`/employee/tasks/${editTask.id}`, form);
      } else {
        await api.post("/employee/tasks", form);
      }
      setShowModal(false);
      setEditTask(null);
      setForm({ title: "", description: "", dueDate: "", priority: "MEDIUM" });
      fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.patch(`/employee/tasks/${id}`, { status });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/employee/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (task: any) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      dueDate: new Date(task.dueDate).toISOString().split("T")[0],
      priority: task.priority,
    });
    setShowModal(true);
  };

  const statusOrder = ["PENDING", "IN_PROGRESS", "COMPLETED"];
  const getNextStatus = (current: string) => {
    const idx = statusOrder.indexOf(current);
    return idx < statusOrder.length - 1 ? statusOrder[idx + 1] : null;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Tasks</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your personal tasks and to-dos.</p>
        </div>
        <button
          onClick={() => { setEditTask(null); setForm({ title: "", description: "", dueDate: "", priority: "MEDIUM" }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          <Plus size={14} /> New Task
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => { setFilterStatus(""); setPage(1); }}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
            !filterStatus
              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
              : "bg-slate-800/50 text-slate-400 border border-slate-700/40 hover:bg-slate-800"
          )}
        >
          <ClipboardList size={14} /> All
        </button>
        {Object.entries(STATUS_CONFIGS).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => { setFilterStatus(key); setPage(1); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border",
              filterStatus === key
                ? cfg.color
                : "bg-slate-800/50 text-slate-400 border-slate-700/40 hover:bg-slate-800"
            )}
          >
            {cfg.icon} {cfg.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-800/50 rounded-2xl animate-pulse" />
          ))
        ) : tasks.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-12 text-center">
            <ClipboardList size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No tasks found. Create one to get started!</p>
          </div>
        ) : (
          tasks.map((task) => {
            const isOverdue = task.status !== "COMPLETED" && new Date(task.dueDate) < new Date(new Date().toDateString());
            const nextStatus = getNextStatus(task.status);
            const statusCfg = STATUS_CONFIGS[task.status];
            const priorityCfg = PRIORITY_CONFIGS[task.priority];

            return (
              <div
                key={task.id}
                className={cn(
                  "bg-slate-800/50 border rounded-2xl p-4 hover:border-slate-600/60 transition-all group",
                  isOverdue ? "border-red-500/30" : "border-slate-700/50",
                  task.status === "COMPLETED" && "opacity-60"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Status toggle */}
                    <button
                      onClick={() => nextStatus && handleStatusChange(task.id, nextStatus)}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                        statusCfg.color
                      )}
                      title={nextStatus ? `Move to ${STATUS_CONFIGS[nextStatus].label}` : "Completed"}
                    >
                      {statusCfg.icon}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn(
                          "text-sm font-medium",
                          task.status === "COMPLETED" ? "text-slate-500 line-through" : "text-slate-200"
                        )}>
                          {task.title}
                        </p>
                        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border", priorityCfg.color)}>
                          {priorityCfg.label}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className={cn(
                          "text-xs flex items-center gap-1",
                          isOverdue ? "text-red-400" : "text-slate-500"
                        )}>
                          <Calendar size={10} /> Due: {formatDate(task.dueDate)}
                        </span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", statusCfg.color)}>
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(task)}
                      className="p-1.5 rounded-lg hover:bg-cyan-500/10 text-cyan-400 transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">Page {pagination.page} of {pagination.totalPages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 disabled:opacity-40">Previous</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {/* Create/Edit Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowModal(false); setEditTask(null); }}>
          <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
                {editTask ? "Edit Task" : "New Task"}
              </h3>
              <button onClick={() => { setShowModal(false); setEditTask(null); }} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1.5 block">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Call customer, Collect quotation"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1.5 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Add details..."
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1.5 block">Due Date *</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm(p => ({ ...p, dueDate: e.target.value }))}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1.5 block">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm(p => ({ ...p, priority: e.target.value }))}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowModal(false); setEditTask(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700/50 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !form.title || !form.dueDate}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-medium text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : editTask ? "Update" : "Create Task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
