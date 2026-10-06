import React from "react";
import { Link } from "react-router-dom";
import { Activity, Building2, ShoppingCart, Store, Target, AlertTriangle, FileBarChart, ArrowLeft, Layers3 } from "lucide-react";

const plans = [
  { name: "الخطة التشغيلية لمجموعة أراك", type: "المجموعة", status: "قيد التنفيذ", icon: Building2, progress: 68, href: "/projects" },
  { name: "الخطة التنفيذية لأراك هوم", type: "التجارة الإلكترونية", status: "قيد التنفيذ", icon: ShoppingCart, progress: 61, href: "/projects" },
  { name: "الخطة المقترحة لأراك ستورز", type: "التجزئة والتشغيل", status: "مرحلة التأسيس", icon: Store, progress: 32, href: "/projects" },
];

const layers = [
  { title: "الأهداف والخطط", desc: "الأهداف الاستراتيجية والتشغيلية وخطط الوحدات", icon: Target },
  { title: "المبادرات والمشاريع", desc: "تحويل الخطة إلى برامج ومشاريع قابلة للمتابعة", icon: Layers3 },
  { title: "المؤشرات والتنبيهات", desc: "قياس الإنجاز والانحراف والتعثر والقرارات المطلوبة", icon: Activity },
  { title: "التقارير التنفيذية", desc: "مخرجات موحدة للرئيس التنفيذي من جميع الوحدات", icon: FileBarChart },
];

export default function ExecutiveExecutionPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-l from-yellow-500/10 via-white/[0.03] to-transparent p-6">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
          <div>
            <div className="text-xs tracking-[0.22em] text-yellow-400/80 mb-2">EXECUTIVE EXECUTION SYSTEM</div>
            <h1 className="text-3xl font-bold text-slate-50">التنفيذ المؤسسي</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
              البوابة الموحدة لربط الخطة التشغيلية للمجموعة بخطط الوحدات والمشاريع والمهام والمؤشرات والتقارير، مع إبقاء منصة الرئيس التنفيذي نقطة الإشراف والقرار.
            </p>
          </div>
          <Link to="/reports" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10">
            التقارير التنفيذية <ArrowLeft size={16} />
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {layers.map(({ title, desc, icon: Icon }) => (
          <div key={title} className="glass-card p-5 border border-white/5">
            <Icon size={20} className="text-yellow-400 mb-4" />
            <div className="font-semibold text-slate-100">{title}</div>
            <div className="mt-2 text-xs leading-6 text-slate-500">{desc}</div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1.6fr_.8fr] gap-6">
        <section className="glass-card p-5 border border-white/5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-100">الخطط والوحدات التنفيذية</h2>
              <p className="text-xs text-slate-500 mt-1">مدخل واحد للتجارة الإلكترونية وبقية مؤسسات أراك</p>
            </div>
            <span className="text-xs text-slate-500">{plans.length} مسارات حالية</span>
          </div>
          <div className="space-y-3">
            {plans.map(({ name, type, status, icon: Icon, progress, href }) => (
              <Link key={name} to={href} className="block rounded-xl border border-white/5 bg-white/[0.025] p-4 hover:border-yellow-500/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/15 flex items-center justify-center text-yellow-400"><Icon size={20}/></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold text-slate-100">{name}</div>
                      <div className="text-xs text-slate-400">{progress}%</div>
                    </div>
                    <div className="flex gap-2 mt-1 text-[11px] text-slate-500"><span>{type}</span><span>•</span><span>{status}</span></div>
                    <div className="h-1.5 rounded-full bg-white/5 mt-3 overflow-hidden"><div className="h-full bg-yellow-500/70 rounded-full" style={{ width: `${progress}%` }} /></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <aside className="glass-card p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-5"><Activity size={18} className="text-yellow-400"/><h2 className="font-bold text-slate-100">نبض التنفيذ</h2></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/[0.03] p-4"><div className="text-2xl font-bold text-slate-100">54%</div><div className="text-xs text-slate-500 mt-1">متوسط الإنجاز</div></div>
            <div className="rounded-xl bg-white/[0.03] p-4"><div className="text-2xl font-bold text-slate-100">3</div><div className="text-xs text-slate-500 mt-1">خطط مرتبطة</div></div>
          </div>
          <div className="mt-4 rounded-xl border border-amber-500/15 bg-amber-500/5 p-4">
            <div className="flex gap-2 text-amber-300 text-sm font-medium"><AlertTriangle size={17}/> قرارات وتنبيهات</div>
            <p className="text-xs leading-6 text-slate-500 mt-2">تُعرض هنا لاحقًا الانحرافات الحرجة والقرارات المنتظرة بعد ربط بيانات الخطط والأنظمة الفعلية.</p>
          </div>
          <div className="mt-4 text-[11px] leading-5 text-slate-600">الأرقام الحالية تمهيدية لهيكلة الواجهة، وتُستبدل تلقائيًا بالقيم الفعلية عند ربط مصادر البيانات.</div>
        </aside>
      </div>
    </div>
  );
}
