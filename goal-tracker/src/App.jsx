import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import {
  FiTarget, FiCheckCircle, FiClock, FiZap, FiPlus, FiSearch,
  FiEdit2, FiTrash2, FiX, FiTrendingUp, FiFlag, FiCalendar,
  FiFilter, FiAward, FiAlertTriangle
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from "recharts";

const API = "http://localhost:5000/api/goals";

const CATEGORIES = ["Study", "Fitness", "Career", "Finance", "Personal"];
const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["Pending", "In Progress", "Completed"];

const PRIORITY_COLORS = {
  High: { bg: "bg-red-500/20", text: "text-red-400", dot: "#f87171" },
  Medium: { bg: "bg-amber-500/20", text: "text-amber-400", dot: "#fbbf24" },
  Low: { bg: "bg-emerald-500/20", text: "text-emerald-400", dot: "#34d399" },
};

const STATUS_COLORS = {
  Completed: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  Pending: { bg: "bg-slate-500/20", text: "text-slate-400" },
  "In Progress": { bg: "bg-violet-500/20", text: "text-violet-400" },
};

const CATEGORY_COLORS = {
  Study: "#818cf8",
  Fitness: "#f472b6",
  Career: "#34d399",
  Finance: "#fbbf24",
  Personal: "#60a5fa",
};

const PIE_COLORS = ["#a78bfa", "#374151"];

const defaultForm = {
  title: "",
  description: "",
  category: "Study",
  priority: "Medium",
  deadline: "",
};

// ────────────────────────────────────────────────
// Stat Card
// ────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-2xl p-5 border border-white/5"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className={`absolute inset-0 opacity-10 ${gradient}`} />
      <div className="relative z-10 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${gradient} bg-opacity-20`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-black text-white mt-0.5">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────
// Progress Bar
// ────────────────────────────────────────────────
function ProgressBar({ value }) {
  const color =
    value === 100
      ? "from-emerald-500 to-teal-400"
      : value >= 50
      ? "from-violet-500 to-purple-400"
      : "from-pink-500 to-rose-400";
  return (
    <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
}

// ────────────────────────────────────────────────
// Goal Card
// ────────────────────────────────────────────────
function GoalCard({ goal, onProgress, onComplete, onEdit, onDelete }) {
  const pri = PRIORITY_COLORS[goal.priority] || PRIORITY_COLORS.Medium;
  const sta = STATUS_COLORS[goal.status] || STATUS_COLORS.Pending;
  const catColor = CATEGORY_COLORS[goal.category] || "#a78bfa";

  const deadline = goal.deadline
    ? new Date(goal.deadline).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "No deadline";

  const isOverdue =
    goal.deadline &&
    new Date(goal.deadline) < new Date() &&
    goal.status !== "Completed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative flex flex-col gap-3 p-5 rounded-2xl border border-white/5 group"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        backdropFilter: "blur(10px)",
        borderLeft: `3px solid ${catColor}`,
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base leading-snug truncate pr-2">
            {goal.title}
          </h3>
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{goal.description}</p>
        </div>
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(goal)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-violet-500/30 text-slate-400 hover:text-violet-300 transition-colors"
          >
            <FiEdit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(goal._id)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/30 text-slate-400 hover:text-red-400 transition-colors"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${pri.bg} ${pri.text}`}>
          <FiFlag className="w-3 h-3" /> {goal.priority}
        </span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${sta.bg} ${sta.text}`}>
          {goal.status}
        </span>
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
          style={{ background: `${catColor}22`, color: catColor }}
        >
          {goal.category}
        </span>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Progress</span>
          <span className="font-bold text-white">{goal.progress || 0}%</span>
        </div>
        <ProgressBar value={goal.progress || 0} />
      </div>

      {/* Deadline */}
      <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? "text-red-400" : "text-slate-400"}`}>
        {isOverdue ? <FiAlertTriangle className="w-3.5 h-3.5" /> : <FiCalendar className="w-3.5 h-3.5" />}
        {isOverdue ? "Overdue · " : ""}{deadline}
      </div>

      {/* Action buttons */}
      {goal.status !== "Completed" && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onProgress(goal._id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-violet-500/20 text-slate-300 hover:text-violet-300 border border-white/5 hover:border-violet-500/30 transition-all"
          >
            <FiTrendingUp className="w-3.5 h-3.5" /> +10%
          </button>
          <button
            onClick={() => onComplete(goal._id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
          >
            <FiCheckCircle className="w-3.5 h-3.5" /> Complete
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ────────────────────────────────────────────────
// Edit Modal
// ────────────────────────────────────────────────
function EditModal({ goal, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: goal.title,
    description: goal.description,
    category: goal.category,
    priority: goal.priority,
    deadline: goal.deadline ? goal.deadline.split("T")[0] : "",
  });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    setLoading(true);
    try {
      await axios.put(`${API}/edit/${goal._id}`, form);
      toast.success("Goal updated ✨");
      onSaved();
      onClose();
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/10 p-6 space-y-4"
        style={{ background: "linear-gradient(145deg, #1a1a2e, #0f0f1a)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white">Edit Goal</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>
        <FormFields form={form} handle={handle} />
        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all"
          style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
        >
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────
// Shared Form Fields
// ────────────────────────────────────────────────
function FormFields({ form, handle }) {
  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors";
  const labelClass = "block text-xs font-semibold text-slate-400 mb-1.5";
  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>Title</label>
        <input name="title" value={form.title} onChange={handle} placeholder="Goal title…" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea name="description" value={form.description} onChange={handle} rows={2} placeholder="What do you want to achieve?" className={`${inputClass} resize-none`} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Category</label>
          <select name="category" value={form.category} onChange={handle} className={inputClass}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Priority</label>
          <select name="priority" value={form.priority} onChange={handle} className={inputClass}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>Deadline</label>
        <input type="date" name="deadline" value={form.deadline} onChange={handle} className={inputClass} />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Custom Tooltip for Pie
// ────────────────────────────────────────────────
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-xl border border-white/10 text-xs text-white"
        style={{ background: "#1a1a2e" }}>
        <p className="font-bold">{payload[0].name}</p>
        <p className="text-slate-300">{payload[0].value} goals</p>
      </div>
    );
  }
  return null;
}

// ────────────────────────────────────────────────
// Main App
// ────────────────────────────────────────────────
export default function App() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [editGoal, setEditGoal] = useState(null);

  const fetchGoals = useCallback(async () => {
    try {
      const res = await axios.get(API);
      setGoals(res.data);
    } catch {
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const handleForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addGoal = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    setAdding(true);
    try {
      await axios.post(API, form);
      toast.success("Goal created 🚀");
      setForm(defaultForm);
      fetchGoals();
    } catch {
      toast.error("Failed to add goal");
    } finally {
      setAdding(false);
    }
  };

  const updateProgress = async (id) => {
    try {
      await axios.put(`${API}/${id}`);
      toast.success("Progress updated +10% 📈");
      fetchGoals();
    } catch {
      toast.error("Update failed");
    }
  };

  const completeGoal = async (id) => {
    try {
      await axios.put(`${API}/${id}`, { complete: true });
      toast.success("Goal completed! 🎉");
      fetchGoals();
    } catch {
      toast.error("Failed to complete goal");
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      toast.success("Goal deleted");
      fetchGoals();
    } catch {
      toast.error("Delete failed");
    }
  };

  // Stats
  const total = goals.length;
  const completed = goals.filter((g) => g.status === "Completed").length;
  const inProgress = goals.filter((g) => g.status === "In Progress").length;
  const highPriority = goals.filter((g) => g.priority === "High").length;

  // Analytics data
  const pieData = [
    { name: "Completed", value: completed },
    { name: "Pending", value: total - completed },
  ];

  const catData = CATEGORIES.map((c) => ({
    name: c,
    value: goals.filter((g) => g.category === c).length,
  })).filter((d) => d.value > 0);

  // Filtered & sorted
  const filtered = goals
    .filter((g) => {
      const q = search.toLowerCase();
      return (
        g.title.toLowerCase().includes(q) &&
        (categoryFilter === "All" || g.category === categoryFilter) &&
        (statusFilter === "All" || g.status === statusFilter)
      );
    })
    .sort((a, b) => {
      if (sortBy === "Newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "Oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "Highest Progress") return (b.progress || 0) - (a.progress || 0);
      if (sortBy === "Deadline") return new Date(a.deadline || "9999") - new Date(b.deadline || "9999");
      if (sortBy === "Priority") {
        const order = { High: 0, Medium: 1, Low: 2 };
        return order[a.priority] - order[b.priority];
      }
      return 0;
    });

  const selectClass =
    "bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50 transition-colors cursor-pointer";

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: "radial-gradient(ellipse at top left, #1a0a2e 0%, #0a0a14 40%, #000008 100%)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a1a2e",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "14px",
            fontSize: "13px",
          },
        }}
      />

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                <FiTarget className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                Goal Tracker
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-1 ml-14">Track, manage, and crush your goals</p>
          </div>
          <motion.div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Today</p>
            <p className="text-sm font-semibold text-slate-300">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </motion.div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiTarget} label="Total Goals" value={total} gradient="bg-violet-500" delay={0.1} />
          <StatCard icon={FiCheckCircle} label="Completed" value={completed} gradient="bg-emerald-500" delay={0.15} />
          <StatCard icon={FiClock} label="In Progress" value={inProgress} gradient="bg-blue-500" delay={0.2} />
          <StatCard icon={FiZap} label="High Priority" value={highPriority} gradient="bg-rose-500" delay={0.25} />
        </div>

        {/* Analytics + Add Form */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Pie Charts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/5 p-6 space-y-4"
            style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))" }}
          >
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <FiAward className="w-4 h-4 text-violet-400" /> Analytics
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-500 text-center mb-1">Completion</p>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />Done</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600 inline-block" />Left</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 text-center mb-1">By Category</p>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="50%" outerRadius={65} paddingAngle={3} dataKey="value">
                      {catData.map((d, i) => <Cell key={i} fill={CATEGORY_COLORS[d.name] || "#a78bfa"} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-400">
                  {catData.map((d) => (
                    <span key={d.name} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: CATEGORY_COLORS[d.name] }} />
                      {d.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Add Goal Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-white/5 p-6 space-y-4"
            style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))" }}
          >
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <FiPlus className="w-4 h-4 text-pink-400" /> New Goal
            </h2>
            <FormFields form={form} handle={handleForm} />
            <button
              onClick={addGoal}
              disabled={adding}
              className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
            >
              <FiPlus className="w-4 h-4" />
              {adding ? "Adding…" : "Add Goal"}
            </button>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-3 items-center"
        >
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search goals…"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectClass}>
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
            <option value="All">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectClass}>
            {["Newest", "Oldest", "Highest Progress", "Deadline", "Priority"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className="text-xs text-slate-500 ml-1">{filtered.length} goal{filtered.length !== 1 ? "s" : ""}</span>
        </motion.div>

        {/* Goals Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-slate-300">No goals yet</h3>
            <p className="text-slate-500 text-sm mt-1">Create your first goal and start tracking progress</p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {filtered.map((goal) => (
                <GoalCard
                  key={goal._id}
                  goal={goal}
                  onProgress={updateProgress}
                  onComplete={completeGoal}
                  onEdit={setEditGoal}
                  onDelete={deleteGoal}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editGoal && (
          <EditModal
            goal={editGoal}
            onClose={() => setEditGoal(null)}
            onSaved={fetchGoals}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
