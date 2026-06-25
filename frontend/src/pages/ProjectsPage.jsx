import React, { useEffect, useState } from "react";
import api, { SECTOR_LABELS, STATUS_LABELS, PRIORITY_LABELS } from "../lib/api";
import RAGBadge from "../components/RAGBadge";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, X, Tag } from "lucide-react";
import { toast } from "sonner";

const SECTORS = Object.entries(SECTOR_LABELS);

export default function ProjectsPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    sector: "arak_development",
    progress: 0,
    status: "active",
    priority: "medium",
    end_date: "",
    budget: 0,
  });

  const load = () =>
    api
      .get("/projects")
      .then((r) => setProjects(r.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const filtered = projects.filter(
    (p) =>
      (sector === "all" || p.sector === sector) &&
      (!q || p.name.includes(q) || (p.description || "").includes(q))
  );

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/projects", {
        ...form,
        progress: Number(form.progress),
        budget: Number(form.budget),
      });
      toast.success("تم إنشاء المشروع بنجاح");
      setShowForm(false);
      setForm({
        name: "",
        description: "",
        sector: "arak_development",
        progress: 0,
        status: "active",
        priority: "medium",
        end_date: "",
        budget: 0,
      });
      load();
    } catch (e) {
      toast.error("تعذر إنشاء المشروع");
    }
  };

  return (
    <div data-testid="projects-page">
      <div className="flex items-center justify-between mb-7 flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-yellow-500/80">
            إدارة المشاريع
          </div>
          <h1 className="font-heading text-4xl font-black text-slate-50 mt-2">
            مشاريع المجموعة
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {filtered.length} مشروع • مفلتر حسب صلاحياتك
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            data-testid="new-project-btn"
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold flex items-center gap-2 hover:from-yellow-400 hover:to-yellow-500 shadow-lg shadow-yellow-900/20"
          >
            <Plus size={18} /> مشروع جديد
          </button>

          <button
            data-testid="smart-pricing-btn"
            onClick={() => navigate("/projects/pricing")}
            className="px-5 py-2.5 rounded-lg border border-yellow-500/70 text-slate-50 font-bold flex items-center gap-2 hover:bg-yellow-500 hover:text-black transition-all shadow-lg shadow-yellow-900/10"
          >
            <Tag size={18} /> التسعير الذكي
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[260px]">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={16}
          />
          <input
            data-testid="search-projects"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن مشروع..."
            className="w-full pr-10 pl-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 focus:border-yellow-500/40 focus:outline-none text-sm"
          />
        </div>

        <select
          data-testid="filter-sector"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 focus:border-yellow-500/40 focus:outline-none text-sm"
        >
          <option value="all">كل القطاعات</option>
          {SECTORS.map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 shimmer rounded-lg"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500">
          لا توجد مشاريع
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              data-testid={`project-card-${p.id}`}
              className="glass-card p-5 hover:border-yellow-500/30 transition-all hover:translate-y-[-2px] block group"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <RAGBadge rag={p.rag} />
                <span className="text-[10px] uppercase tracking-widest text-slate-500">
                  {SECTOR_LABELS[p.sector]}
                </span>
              </div>

              <h3 className="font-heading text-lg font-bold text-slate-100 group-hover:text-yellow-300 transition-colors line-clamp-2">
                {p.name}
              </h3>

              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {p.description}
              </p>

              <div className="mt-5">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">نسبة الإنجاز</span>
                  <span className="text-yellow-400 tabular-nums font-bold">
                    {p.progress}٪
                  </span>
                </div>

                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-yellow-400 to-yellow-600"
                    style={{ width: `${p.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
                <span className="px-2 py-1 rounded bg-white/5">
                  {STATUS_LABELS[p.status]}
                </span>
                <span className="px-2 py-1 rounded bg-white/5">
                  أولوية: {PRIORITY_LABELS[p.priority]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="glass-card p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-xl font-bold">مشروع جديد</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <input
                data-testid="form-project-name"
                required
                placeholder="اسم المشروع"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 focus:border-yellow-500/40 focus:outline-none text-sm"
              />

              <textarea
                placeholder="وصف موجز"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 focus:border-yellow-500/40 focus:outline-none text-sm min-h-[80px]"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  data-testid="form-project-sector"
                  value={form.sector}
                  onChange={(e) =>
                    setForm({ ...form, sector: e.target.value })
                  }
                  className="px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 focus:outline-none text-sm"
                >
                  {SECTORS.map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>

                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                  className="px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 focus:outline-none text-sm"
                >
                  {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      أولوية: {v}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="نسبة الإنجاز"
                  value={form.progress}
                  onChange={(e) =>
                    setForm({ ...form, progress: e.target.value })
                  }
                  className="px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 focus:outline-none text-sm"
                />

                <input
                  type="number"
                  placeholder="الميزانية"
                  value={form.budget}
                  onChange={(e) =>
                    setForm({ ...form, budget: e.target.value })
                  }
                  className="px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 focus:outline-none text-sm"
                />

                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
                  }
                  className="col-span-2 px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 focus:outline-none text-sm"
                />
              </div>

              <button
                data-testid="form-submit-project"
                type="submit"
                className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold hover:from-yellow-400"
              >
                إنشاء المشروع
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}