import React, { useEffect, useState } from "react";
import api, { SECTOR_LABELS, STATUS_LABELS } from "../lib/api";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, LineChart, Line,
} from "recharts";
import RAGBadge from "../components/RAGBadge";

const COLORS = ["#D4AF37", "#34d399", "#60a5fa", "#fbbf24", "#a78bfa", "#fb7185"];

export default function ReportsPage() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/projects"), api.get("/tasks")]).then(([p, t]) => {
      setProjects(p.data); setTasks(t.data);
    });
  }, []);

  const sectorAgg = {};
  projects.forEach(p => {
    const s = p.sector;
    sectorAgg[s] = sectorAgg[s] || { sector: s, count: 0, progress: 0, budget: 0, completed: 0 };
    sectorAgg[s].count += 1;
    sectorAgg[s].progress += p.progress || 0;
    sectorAgg[s].budget += p.budget || 0;
    if (p.status === "completed") sectorAgg[s].completed += 1;
  });
  const sectorData = Object.values(sectorAgg).map(s => ({
    ...s, name: SECTOR_LABELS[s.sector] || s.sector,
    avgProgress: Math.round(s.progress / Math.max(s.count, 1)),
    completionRate: Math.round((s.completed / Math.max(s.count, 1)) * 100),
  }));

  const radarData = sectorData.map(s => ({ subject: s.name, الإنجاز: s.avgProgress, الإكمال: s.completionRate }));

  const statusData = ["planning", "active", "on_hold", "completed", "cancelled"].map(s => ({
    name: STATUS_LABELS[s] || s,
    value: projects.filter(p => p.status === s).length,
  }));

  return (
    <div data-testid="reports-page">
      <div className="mb-7">
        <div className="text-xs uppercase tracking-[0.3em] text-yellow-500/80">التقارير والتحليلات</div>
        <h1 className="font-heading text-4xl font-black mt-2">تحليلات تنفيذية متقدمة</h1>
        <p className="text-slate-500 text-sm mt-1">رؤى عميقة لاتخاذ القرارات الإستراتيجية</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="glass-card p-6">
          <h3 className="font-heading text-lg font-bold mb-1">مصفوفة الأداء القطاعي</h3>
          <p className="text-xs text-slate-500 mb-4">مقارنة نسبة الإنجاز ومعدل الإكمال عبر القطاعات</p>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)"/>
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }}/>
              <PolarRadiusAxis tick={{ fill: "#94a3b8", fontSize: 10 }} domain={[0, 100]}/>
              <Radar name="الإنجاز" dataKey="الإنجاز" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.3}/>
              <Radar name="الإكمال" dataKey="الإكمال" stroke="#34d399" fill="#34d399" fillOpacity={0.2}/>
              <Legend wrapperStyle={{ fontSize: 12 }}/>
              <Tooltip contentStyle={{ background: "#111622", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-heading text-lg font-bold mb-1">الميزانية حسب القطاع</h3>
          <p className="text-xs text-slate-500 mb-4">توزيع الميزانية الإجمالية</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={sectorData} cx="50%" cy="50%" innerRadius={60} outerRadius={110}
                paddingAngle={2} dataKey="budget" nameKey="name" label={(e) => `${e.name}`} labelLine={false}>
                {sectorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none"/>)}
              </Pie>
              <Tooltip contentStyle={{ background: "#111622", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                formatter={(v) => new Intl.NumberFormat("ar-EG").format(v)}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-heading text-lg font-bold mb-1">الإنجاز مقابل الإكمال</h3>
          <p className="text-xs text-slate-500 mb-4">القطاعات حسب نسبة الإنجاز ومعدل الإكمال</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 100]}/>
              <Tooltip contentStyle={{ background: "#111622", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} formatter={(v) => `${v}٪`}/>
              <Legend wrapperStyle={{ fontSize: 12 }}/>
              <Bar dataKey="avgProgress" name="الإنجاز %" fill="#D4AF37" radius={[6,6,0,0]}/>
              <Bar dataKey="completionRate" name="الإكمال %" fill="#34d399" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-heading text-lg font-bold mb-1">حالات المشاريع</h3>
          <p className="text-xs text-slate-500 mb-4">التوزيع الحالي</p>
          <div className="space-y-3 mt-6">
            {statusData.map((s, i) => {
              const total = statusData.reduce((a, b) => a + b.value, 0) || 1;
              const pct = Math.round((s.value / total) * 100);
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">{s.name}</span>
                    <span className="text-slate-500 tabular-nums">{s.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLORS[i] }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sector Detail Table */}
      <div className="glass-card p-6">
        <h3 className="font-heading text-lg font-bold mb-4">ملخص أداء القطاعات</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-slate-500 border-b border-white/5">
                <th className="py-3 font-semibold">القطاع</th>
                <th className="py-3 font-semibold">عدد المشاريع</th>
                <th className="py-3 font-semibold">متوسط الإنجاز</th>
                <th className="py-3 font-semibold">الميزانية</th>
                <th className="py-3 font-semibold">معدل الإكمال</th>
              </tr>
            </thead>
            <tbody>
              {sectorData.map(s => (
                <tr key={s.sector} className="border-b border-white/5">
                  <td className="py-4 text-slate-100 font-medium">{s.name}</td>
                  <td className="py-4 tabular-nums text-slate-300">{s.count}</td>
                  <td className="py-4 tabular-nums text-yellow-400">{s.avgProgress}٪</td>
                  <td className="py-4 tabular-nums text-slate-300">{new Intl.NumberFormat("ar-EG").format(s.budget)}</td>
                  <td className="py-4 tabular-nums text-emerald-400">{s.completionRate}٪</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
