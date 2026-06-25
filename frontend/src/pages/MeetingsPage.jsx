import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { Plus, Video, MapPin, Clock, X, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";

const TYPE_LABEL = { individual: "فردي", periodic: "دوري", emergency: "طارئ", board: "مجلس إدارة" };

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", meeting_type: "individual", date: "", duration_minutes: 60, location: "", meeting_link: "", attendee_ids: [], is_remote: false });

  const load = () => Promise.all([api.get("/meetings"), api.get("/users")]).then(([m, u]) => { setMeetings(m.data); setUsers(u.data); });
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/meetings", { ...form, date: new Date(form.date).toISOString() });
      toast.success("تم إنشاء الاجتماع"); setShow(false); load();
      setForm({ title: "", description: "", meeting_type: "individual", date: "", duration_minutes: 60, location: "", meeting_link: "", attendee_ids: [], is_remote: false });
    } catch { toast.error("تعذر الإنشاء"); }
  };

  return (
    <div data-testid="meetings-page">
      <div className="flex items-end justify-between mb-7 flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-yellow-500/80">الاجتماعات</div>
          <h1 className="font-heading text-4xl font-black mt-2">إدارة الاجتماعات</h1>
          <p className="text-slate-500 text-sm mt-1">{meetings.length} اجتماع مجدول</p>
        </div>
        <button data-testid="new-meeting-btn" onClick={() => setShow(true)} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold flex items-center gap-2"><Plus size={18}/> اجتماع جديد</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meetings.length === 0 ? <div className="glass-card p-12 text-center text-slate-500 col-span-2">لا توجد اجتماعات</div> :
        meetings.map(m => (
          <div key={m.id} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest text-yellow-500/80 px-2 py-1 bg-yellow-500/5 rounded">{TYPE_LABEL[m.meeting_type]}</span>
              <span className="text-xs text-slate-500">{new Date(m.date).toLocaleString("ar-EG", {dateStyle: "medium", timeStyle: "short"})}</span>
            </div>
            <h3 className="font-heading text-lg font-bold">{m.title}</h3>
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{m.description}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Clock size={12}/> {m.duration_minutes} د</span>
              {m.location && <span className="flex items-center gap-1"><MapPin size={12}/> {m.location}</span>}
              <span className="flex items-center gap-1"><UsersIcon size={12}/> {m.attendee_ids?.length || 0} مدعو</span>
            </div>
            {m.meeting_link && <a href={m.meeting_link} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"><Video size={12}/> دخول الاجتماع</a>}
          </div>
        ))}
      </div>

      {show && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShow(false)}>
          <div className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5"><h2 className="font-heading text-xl font-bold">اجتماع جديد</h2><button onClick={() => setShow(false)}><X size={18}/></button></div>
            <form onSubmit={submit} className="space-y-3">
              <input required placeholder="عنوان الاجتماع" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm"/>
              <textarea placeholder="جدول الأعمال" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm min-h-[70px]"/>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.meeting_type} onChange={e => setForm({...form, meeting_type: e.target.value})} className="px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm">
                  {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <input type="number" placeholder="مدة (دقائق)" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: Number(e.target.value)})} className="px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm"/>
                <input required type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="col-span-2 px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm"/>
                <input placeholder="الموقع" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm"/>
                <input placeholder="رابط Zoom/Meet (اختياري)" value={form.meeting_link} onChange={e => setForm({...form, meeting_link: e.target.value, is_remote: !!e.target.value})} className="px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm" dir="ltr"/>
              </div>
              <div className="border border-white/10 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-2">المدعوون</div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {users.map(u => (
                    <label key={u.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white/5 px-2 py-1 rounded">
                      <input type="checkbox" checked={form.attendee_ids.includes(u.id)} onChange={e => {
                        const ids = e.target.checked ? [...form.attendee_ids, u.id] : form.attendee_ids.filter(x => x !== u.id);
                        setForm({...form, attendee_ids: ids});
                      }}/>
                      <span>{u.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-3 rounded-lg bg-yellow-500 text-black font-bold">إنشاء الاجتماع</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
