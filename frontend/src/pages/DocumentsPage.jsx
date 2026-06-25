import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import {
  Plus,
  X,
  FileText,
  ExternalLink,
  Trash2,
  Search,
  Archive,
  Brain,
  Database,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";

const CAT_LABEL = {
  meeting_notes: "محاضر اجتماعات",
  correspondence: "مراسلات",
  report: "تقارير",
  memo: "مذكرات",
  presentation: "عروض",
  contract: "عقود",
  policy: "سياسات",
  other: "أخرى",
};

const CAT_COLOR = {
  meeting_notes: "bg-sky-500/15 text-sky-300",
  correspondence: "bg-emerald-500/15 text-emerald-300",
  report: "bg-amber-500/15 text-amber-300",
  memo: "bg-violet-500/15 text-violet-300",
  presentation: "bg-rose-500/15 text-rose-300",
  contract: "bg-orange-500/15 text-orange-300",
  policy: "bg-blue-500/15 text-blue-300",
  other: "bg-slate-500/15 text-slate-300",
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [show, setShow] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "report",
    url: "",
    file_type: "PDF",
    is_public: true,
  });

  const load = () => api.get("/documents").then((r) => setDocs(r.data || []));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/documents", form);
      toast.success("تم حفظ الوثيقة في مركز المعرفة");
      setShow(false);
      setForm({
        title: "",
        description: "",
        category: "report",
        url: "",
        file_type: "PDF",
        is_public: true,
      });
      load();
    } catch {
      toast.error("تعذر حفظ الوثيقة");
    }
  };

  const del = async (id) => {
    if (!confirm("حذف الوثيقة؟")) return;

    await api.delete(`/documents/${id}`);
    load();
    toast.success("تم الحذف");
  };

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      const byCategory = filter === "all" || d.category === filter;
      const text = `${d.title || ""} ${d.description || ""} ${d.uploaded_by_name || ""}`.toLowerCase();
      const bySearch = text.includes(query.toLowerCase());
      return byCategory && bySearch;
    });
  }, [docs, filter, query]);

  const stats = useMemo(() => {
    return {
      total: docs.length,
      reports: docs.filter((d) => d.category === "report").length,
      meetings: docs.filter((d) => d.category === "meeting_notes").length,
      contracts: docs.filter((d) => d.category === "contract").length,
    };
  }, [docs]);

  return (
    <div data-testid="documents-page" className="space-y-7">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-yellow-500/80">
            Document & Knowledge Center
          </div>
          <h1 className="font-heading text-4xl font-black mt-2">
            مركز الوثائق والمعرفة
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            أرشفة، بحث، تصنيف، وذاكرة مؤسسية مساعدة للسكرتارية التنفيذية
          </p>
        </div>

        <button
          onClick={() => setShow(true)}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold flex items-center gap-2"
        >
          <Plus size={18} />
          إضافة وثيقة
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={<Archive size={20} />} label="إجمالي الوثائق" value={stats.total} />
        <StatCard icon={<FileText size={20} />} label="التقارير" value={stats.reports} />
        <StatCard icon={<CalendarDays size={20} />} label="محاضر الاجتماعات" value={stats.meetings} />
        <StatCard icon={<ShieldCheck size={20} />} label="العقود والسياسات" value={stats.contracts} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="text-yellow-400" size={22} />
            <div>
              <h3 className="font-bold text-slate-100">مساعد السكرتارية الذكي</h3>
              <p className="text-xs text-slate-500">
                يحول الوثائق إلى معرفة قابلة للبحث والمتابعة واتخاذ القرار
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3 text-xs">
            <InsightCard title="استخراج تلقائي" text="قرارات، مسؤوليات، تواريخ، ومرفقات." />
            <InsightCard title="ذاكرة مؤسسية" text="ربط الوثائق بالمشاريع والاجتماعات والقرارات." />
            <InsightCard title="بحث دلالي" text="الوصول للمعلومة دون معرفة اسم الملف." />
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Database className="text-yellow-400" size={22} />
            <div>
              <h3 className="font-bold text-slate-100">قاعدة المعرفة</h3>
              <p className="text-xs text-slate-500">مصدر موحد للوثائق والبيانات</p>
            </div>
          </div>

          <div className="text-sm text-slate-400 leading-7">
            هذه الوحدة تمثل أرشيف الرئيس التنفيذي، وسجل السكرتارية، وذاكرة
            المؤسسة في مكان واحد.
          </div>
        </div>
      </div>

      <div className="glass-card p-3 space-y-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في العنوان، الوصف، أو اسم الرافع..."
            className="w-full pr-10 pl-4 py-3 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
            الكل
          </FilterButton>

          {Object.entries(CAT_LABEL).map(([k, v]) => (
            <FilterButton key={k} active={filter === k} onClick={() => setFilter(k)}>
              {v}
            </FilterButton>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="glass-card p-10 text-center text-slate-500 col-span-full">
            لا توجد وثائق مطابقة
          </div>
        ) : (
          filtered.map((d) => (
            <div key={d.id} className="glass-card p-5 hover:border-yellow-500/30 group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                  <FileText size={20} />
                </div>

                <span
                  className={`text-[10px] px-2 py-1 rounded ${
                    CAT_COLOR[d.category] || CAT_COLOR.other
                  }`}
                >
                  {CAT_LABEL[d.category] || "أخرى"}
                </span>
              </div>

              <h3 className="font-heading font-bold text-slate-100 line-clamp-1">
                {d.title}
              </h3>

              <p className="text-xs text-slate-500 mt-2 line-clamp-2 min-h-[34px]">
                {d.description || "لا يوجد وصف مضاف لهذه الوثيقة."}
              </p>

              <div className="mt-4 space-y-1 text-xs text-slate-500">
                <div>رفع بواسطة: {d.uploaded_by_name || "—"}</div>
                <div>{new Date(d.created_at).toLocaleDateString("ar-EG")}</div>
                <div>نوع الملف: {d.file_type || "PDF"}</div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="text-[11px] text-yellow-300 mb-1">تحليل أولي</div>
                <div className="text-xs text-slate-500 leading-6">
                  جاهزة للأرشفة والربط مع الاجتماعات والمهام والقرارات.
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded bg-yellow-500/15 text-yellow-300 text-xs hover:bg-yellow-500/25"
                >
                  <ExternalLink size={12} />
                  فتح
                </a>

                <button
                  onClick={() => del(d.id)}
                  className="px-3 py-2 rounded bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {show && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShow(false)}
        >
          <div
            className="glass-card p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-heading text-xl font-bold">إضافة وثيقة</h2>
                <p className="text-xs text-slate-500 mt-1">
                  أضف الوثيقة إلى الأرشيف المؤسسي وقاعدة المعرفة
                </p>
              </div>

              <button onClick={() => setShow(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <input
                required
                placeholder="عنوان الوثيقة"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm"
              />

              <textarea
                placeholder="وصف موجز"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm min-h-[70px]"
              />

              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm"
              >
                {Object.entries(CAT_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.file_type}
                  onChange={(e) => setForm({ ...form, file_type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm"
                >
                  <option value="PDF">PDF</option>
                  <option value="DOCX">DOCX</option>
                  <option value="XLSX">XLSX</option>
                  <option value="PPTX">PPTX</option>
                  <option value="LINK">رابط</option>
                </select>

                <select
                  value={String(form.is_public)}
                  onChange={(e) =>
                    setForm({ ...form, is_public: e.target.value === "true" })
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm"
                >
                  <option value="true">متاح داخلياً</option>
                  <option value="false">خاص</option>
                </select>
              </div>

              <input
                required
                placeholder="رابط الوثيقة"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm"
                dir="ltr"
              />

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-yellow-500 text-black font-bold"
              >
                حفظ الوثيقة
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-yellow-400">{icon}</div>
        <div className="text-2xl font-black text-slate-100">{value}</div>
      </div>
      <div className="text-xs text-slate-500 mt-3">{label}</div>
    </div>
  );
}

function InsightCard({ title, text }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
      <div className="text-slate-100 font-bold mb-1">{title}</div>
      <div className="text-slate-500 leading-6">{text}</div>
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
        active
          ? "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30"
          : "bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5"
      }`}
    >
      {children}
    </button>
  );
}