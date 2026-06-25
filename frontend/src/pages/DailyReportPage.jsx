import React, { useEffect, useState } from "react";
import api, { SECTOR_LABELS, PRIORITY_LABELS } from "../lib/api";
import RAGBadge from "../components/RAGBadge";
import { FileText, Printer, RefreshCw, AlertTriangle, Calendar as CalIcon, Mic, ClipboardList, TrendingUp } from "lucide-react";

export default function DailyReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => { setLoading(true); api.get("/reports/daily-executive").then(r => setReport(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const print = () => window.print();

  if (!report) {
    return <div className="h-64 shimmer rounded-lg"></div>;
  }

  const m = report.metrics;
  const today = new Date(report.generated_at).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div data-testid="daily-report-page" className="print:p-0">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4 print:hidden">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-yellow-500/80">التقرير التنفيذي اليومي</div>
          <h1 className="font-heading text-4xl font-black mt-2 flex items-center gap-3"><FileText className="text-yellow-500"/> الموجز اليومي</h1>
          <p className="text-slate-500 text-sm mt-1">{today}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-yellow-500/10 text-slate-300 hover:text-yellow-300 text-sm flex items-center gap-2"><RefreshCw size={14} className={loading?"animate-spin":""}/> تحديث</button>
          <button onClick={print} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold text-sm flex items-center gap-2"><Printer size={14}/> طباعة / PDF</button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6 text-center border-b pb-4">
        <div className="text-2xl font-bold">مجموعة أراك — التقرير التنفيذي اليومي</div>
        <div className="text-sm text-slate-500 mt-1">{today}</div>
        <div className="text-sm mt-1">إلى: {report.user.name}</div>
      </div>

      {/* AI Summary */}
      <div className="glass-card p-6 mb-5 border-yellow-500/30">
        <div className="flex items-center gap-2 mb-3">
          <div className="px-2 py-1 rounded bg-yellow-500/15 text-yellow-300 text-[10px] uppercase tracking-widest">AI Briefing</div>
          <span className="text-sm text-slate-400">موجز ذكي بقلم Claude</span>
        </div>
        <p className="text-lg text-slate-100 leading-loose font-heading whitespace-pre-wrap">{report.ai_summary}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Stat icon={<TrendingUp/>} label="إجمالي المشاريع" value={m.total_projects} sub={`${m.active_projects} نشط`}/>
        <Stat icon={<AlertTriangle/>} label="مشاريع حرجة" value={m.critical_projects} accent="red"/>
        <Stat icon={<ClipboardList/>} label="مهام متأخرة" value={m.overdue_tasks} accent="amber"/>
        <Stat icon={<CalIcon/>} label="اجتماعات اليوم" value={m.today_meetings}/>
        <Stat icon={<CalIcon/>} label="طلبات لقاء معلقة" value={m.pending_requests}/>
        <Stat icon={<Mic/>} label="توجيهات صوتية" value={m.pending_voice_directives}/>
        <Stat icon={<TrendingUp/>} label="متوسط الإنجاز" value={`${m.avg_progress}٪`} accent="green"/>
      </div>

      {/* Critical Projects */}
      {report.critical_projects.length > 0 && (
        <Section title="المشاريع الحرجة (تتطلب اهتمام فوري)" icon={<AlertTriangle className="text-rose-400"/>}>
          {report.critical_projects.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-rose-500/10">
              <div>
                <div className="font-medium text-slate-100">{p.name}</div>
                <div className="text-xs text-slate-500">{SECTOR_LABELS[p.sector]} • إنجاز {p.progress}٪</div>
              </div>
              <RAGBadge rag={p.rag}/>
            </div>
          ))}
        </Section>
      )}

      {/* Today Meetings */}
      {report.today_meetings.length > 0 && (
        <Section title="اجتماعات اليوم" icon={<CalIcon className="text-yellow-400"/>}>
          {report.today_meetings.map(m => (
            <div key={m.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="font-medium text-slate-100">{m.title}</div>
              <div className="text-xs text-slate-500 mt-1">{new Date(m.date).toLocaleTimeString("ar-EG", {timeStyle: "short"})} • {m.duration_minutes} دقيقة</div>
            </div>
          ))}
        </Section>
      )}

      {/* Overdue Tasks */}
      {report.overdue_tasks.length > 0 && (
        <Section title="المهام المتأخرة" icon={<ClipboardList className="text-amber-400"/>}>
          {report.overdue_tasks.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-amber-500/10">
              <div>
                <div className="font-medium text-slate-100">{t.title}</div>
                <div className="text-xs text-slate-500">استحقاق: {new Date(t.due_date).toLocaleDateString("ar-EG")} • {PRIORITY_LABELS[t.priority]}</div>
              </div>
              <span className="text-amber-400 tabular-nums text-sm">{t.progress}٪</span>
            </div>
          ))}
        </Section>
      )}

      {/* Pending Meeting Requests */}
      {report.pending_requests.length > 0 && (
        <Section title="طلبات لقاء بانتظار قرارك" icon={<CalIcon className="text-sky-400"/>}>
          {report.pending_requests.map(r => (
            <div key={r.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="font-medium text-slate-100">{r.subject}</div>
              <div className="text-xs text-slate-500 mt-1">من: {r.requester_name} • مقترح: {new Date(r.proposed_date).toLocaleDateString("ar-EG")}</div>
            </div>
          ))}
        </Section>
      )}

      {/* Pending Voice Directives */}
      {report.pending_voice_directives.length > 0 && (
        <Section title="توجيهات صوتية معلقة" icon={<Mic className="text-violet-400"/>}>
          {report.pending_voice_directives.map(v => (
            <div key={v.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-sm text-slate-100">{v.summary || (v.transcript || "").slice(0, 100)}</div>
              <div className="text-xs text-slate-500 mt-1">{(v.suggested_tasks || []).length} مهمة مقترحة • {new Date(v.created_at).toLocaleDateString("ar-EG")}</div>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Stat({ icon, label, value, sub, accent }) {
  const colors = { red: "text-rose-400", amber: "text-amber-400", green: "text-emerald-400" };
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-slate-500">{label}</div>
        <div className={`text-slate-500 ${colors[accent] || ""}`}>{icon}</div>
      </div>
      <div className={`mt-2 text-2xl font-heading font-bold tabular-nums ${colors[accent] || "text-slate-100"}`}>{value}</div>
      {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="glass-card p-5 mb-4">
      <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">{icon} {title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
