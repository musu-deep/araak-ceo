import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { ChevronRight, ChevronLeft, Plus, X, Bell, Palette as PaletteIcon, Trash2, Edit3, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

const COLORS = [
  { v: "#D4AF37", n: "ذهبي" }, { v: "#10b981", n: "أخضر" }, { v: "#3b82f6", n: "أزرق" },
  { v: "#f59e0b", n: "كهرماني" }, { v: "#ef4444", n: "أحمر" }, { v: "#a855f7", n: "بنفسجي" },
  { v: "#ec4899", n: "وردي" }, { v: "#64748b", n: "رمادي" },
];

const REMIND = [
  { v: 0, l: "وقت الحدث" }, { v: 5, l: "قبل 5 د" }, { v: 15, l: "قبل 15 د" },
  { v: 30, l: "قبل 30 د" }, { v: 60, l: "قبل ساعة" }, { v: 1440, l: "قبل يوم" },
];

const empty = { title: "", description: "", start_date: "", start_time: "09:00", end_time: "10:00", all_day: false, color: "#D4AF37", reminder_minutes: 15, active: true, event_type: "manual" };

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [cur, setCur] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [sel, setSel] = useState(null);

  const load = () => api.get("/calendar").then(r => setEvents(r.data));
  useEffect(() => { load(); }, []);

  const openAdd = (dateStr) => {
    setEditing(null);
    setForm({ ...empty, start_date: dateStr || new Date().toISOString().slice(0, 10) });
    setShowForm(true);
  };

  const openEdit = (e) => {
    if (!e.id.startsWith("manual") && !e.user_id) { setSel(e); return; }
    const d = new Date(e.start);
    setEditing(e);
    setForm({
      title: e.title.replace(/^(اجتماع|مهمة): /, ""),
      description: e.description || "",
      start_date: d.toISOString().slice(0, 10),
      start_time: d.toTimeString().slice(0, 5),
      end_time: e.end ? new Date(e.end).toTimeString().slice(0, 5) : "10:00",
      all_day: e.all_day || false,
      color: e.color || "#D4AF37",
      reminder_minutes: e.reminder_minutes ?? 15,
      active: e.active !== false,
      event_type: "manual",
    });
    setShowForm(true);
  };

  const submit = async (ev) => {
    ev.preventDefault();
    try {
      const start = form.all_day
        ? new Date(`${form.start_date}T00:00:00`).toISOString()
        : new Date(`${form.start_date}T${form.start_time}`).toISOString();
      const end = form.all_day ? null : new Date(`${form.start_date}T${form.end_time}`).toISOString();
      const payload = {
        title: form.title, description: form.description, start, end,
        event_type: "manual", color: form.color, all_day: form.all_day,
        reminder_minutes: Number(form.reminder_minutes), active: form.active,
      };
      if (editing && (editing.user_id || editing.id?.startsWith("manual"))) {
        await api.patch(`/calendar/${editing.id}`, payload);
        toast.success("تم التحديث");
      } else {
        await api.post("/calendar", payload);
        toast.success("تمت الإضافة");
      }
      setShowForm(false); load();
    } catch { toast.error("تعذر الحفظ"); }
  };

  const del = async () => {
    if (!editing || !confirm("حذف الحدث؟")) return;
    await api.delete(`/calendar/${editing.id}`);
    toast.success("تم الحذف"); setShowForm(false); load();
  };

  const toggle = async (e) => {
    e.stopPropagation?.();
    try { await api.patch(`/calendar/${editing.id}`, { active: !form.active }); setForm({...form, active: !form.active}); load(); }
    catch { toast.error("تعذر"); }
  };

  const year = cur.getFullYear(), month = cur.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const cells = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(year, month, d);
    const ds = date.toISOString().slice(0, 10);
    const dayEvents = events.filter(e => {
      const ed = new Date(e.start);
      return ed.getFullYear() === year && ed.getMonth() === month && ed.getDate() === d;
    });
    cells.push({ d, date, ds, events: dayEvents });
  }
  const monthName = cur.toLocaleDateString("ar-EG", { month: "long", year: "numeric" });

  return (
    <div data-testid="calendar-page">
      <div className="flex items-end justify-between mb-7 flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-yellow-500/80">التقويم</div>
          <h1 className="font-heading text-4xl font-black mt-2">تقويم تنفيذي</h1>
          <p className="text-slate-500 text-sm mt-1">انقر على أي يوم لإضافة حدث • انقر على حدث لتعديله</p>
        </div>
        <button onClick={() => openAdd()} data-testid="add-event-btn" className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold flex items-center gap-2"><Plus size={18}/> حدث جديد</button>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setCur(new Date(year, month - 1, 1))} className="p-2 rounded hover:bg-white/5"><ChevronRight size={18}/></button>
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-xl font-bold">{monthName}</h2>
            <button onClick={() => setCur(new Date())} className="text-xs px-3 py-1 rounded bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20">اليوم</button>
          </div>
          <button onClick={() => setCur(new Date(year, month + 1, 1))} className="p-2 rounded hover:bg-white/5"><ChevronLeft size={18}/></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"].map(d => <div key={d} className="text-center text-[11px] uppercase tracking-widest text-slate-500 py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((c, i) => {
            if (!c) return <div key={i} className="h-28"></div>;
            const isToday = new Date().toDateString() === c.date.toDateString();
            return (
              <div key={i} onClick={() => openAdd(c.ds)}
                className={`h-28 p-2 rounded-lg border cursor-pointer transition-all ${isToday ? "border-yellow-500/40 bg-yellow-500/5" : "border-white/5 bg-white/[0.02] hover:border-yellow-500/30 hover:bg-yellow-500/[0.03]"} overflow-hidden group`}>
                <div className="flex items-center justify-between">
                  <div className={`text-xs font-bold tabular-nums ${isToday ? "text-yellow-300" : "text-slate-400"}`}>{c.d}</div>
                  <Plus size={12} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"/>
                </div>
                <div className="mt-1 space-y-0.5">
                  {c.events.slice(0, 3).map((e, idx) => (
                    <button key={idx} onClick={(ev) => { ev.stopPropagation(); openEdit(e); }}
                      className="block w-full text-right text-[10px] truncate px-1.5 py-0.5 rounded hover:opacity-90"
                      style={{ background: `${e.color || "#D4AF37"}25`, color: e.color || "#D4AF37", opacity: e.active === false ? 0.4 : 1 }}>
                      {e.title}
                    </button>
                  ))}
                  {c.events.length > 3 && <div className="text-[10px] text-slate-500 px-1.5">+{c.events.length - 3} المزيد</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Read-only modal for system events (meetings/tasks) */}
      {sel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSel(null)}>
          <div className="glass-card p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-lg font-bold mb-2">{sel.title}</h2>
            <div className="text-xs text-slate-400 mb-3">{new Date(sel.start).toLocaleString("ar-EG")}</div>
            {sel.description && <p className="text-sm text-slate-300">{sel.description}</p>}
            <div className="mt-4 text-xs text-slate-500">حدث تلقائي — يُدار من موديوله الأصلي</div>
            <button onClick={() => setSel(null)} className="mt-4 w-full py-2 rounded bg-white/5">إغلاق</button>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-xl font-bold flex items-center gap-2">
                {editing ? <><Edit3 size={18}/> تعديل البند</> : <><Plus size={18}/> بند جديد</>}
              </h2>
              <div className="flex items-center gap-1">
                {editing && (
                  <>
                    <button onClick={toggle} title={form.active ? "إيقاف" : "تفعيل"} className="p-2 rounded hover:bg-white/10">
                      {form.active ? <ToggleRight className="text-emerald-400" size={18}/> : <ToggleLeft className="text-slate-500" size={18}/>}
                    </button>
                    <button onClick={del} className="p-2 rounded hover:bg-rose-500/10 text-rose-300"><Trash2 size={16}/></button>
                  </>
                )}
                <button onClick={() => setShowForm(false)} className="p-2 rounded hover:bg-white/10"><X size={18}/></button>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <input required autoFocus placeholder="عنوان البند" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-[#0a0d14]/80 border border-white/10 focus:border-yellow-500/40 focus:outline-none text-base font-medium"/>
              <textarea placeholder="الوصف (اختياري)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm min-h-[70px]"/>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.all_day} onChange={e => setForm({...form, all_day: e.target.checked})}/>
                <span>طوال اليوم</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">التاريخ</label>
                  <input required type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm"/>
                </div>
                {!form.all_day && (
                  <>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">من</label>
                      <input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm"/>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">إلى</label>
                      <input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm"/>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Bell size={12}/> التذكير</label>
                <select value={form.reminder_minutes} onChange={e => setForm({...form, reminder_minutes: Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm">
                  {REMIND.map(r => <option key={r.v} value={r.v}>{r.l}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-2 flex items-center gap-1"><PaletteIcon size={12}/> اللون</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button key={c.v} type="button" onClick={() => setForm({...form, color: c.v})}
                      className={`w-9 h-9 rounded-full transition-all ${form.color === c.v ? "ring-2 ring-offset-2 ring-offset-[#0a0d14] ring-white scale-110" : "hover:scale-105"}`}
                      style={{ background: c.v }} title={c.n}/>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-3 rounded-lg bg-yellow-500 text-black font-bold hover:bg-yellow-400">{editing ? "حفظ التعديلات" : "إضافة الحدث"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
