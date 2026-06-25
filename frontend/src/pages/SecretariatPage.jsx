import React from "react";
import {
  CalendarDays,
  Mail,
  FileSignature,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  Users,
  Send,
  Brain,
  BriefcaseBusiness,
  BellRing,
  ArrowUpRight,
  ClipboardCheck,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const kpis = [
  { title: "وارد تنفيذي", value: 28, change: "+12%", icon: Mail, tone: "blue" },
  { title: "طلبات لقاء", value: 9, change: "5 عاجلة", icon: Users, tone: "amber" },
  { title: "قرارات بانتظار الاعتماد", value: 6, change: "خلال 48 ساعة", icon: FileSignature, tone: "emerald" },
  { title: "تكليفات متأخرة", value: 4, change: "تحتاج تصعيد", icon: AlertTriangle, tone: "rose" },
];

const schedule = [
  { time: "09:00", title: "مراجعة مؤشرات المشاريع", type: "اجتماع داخلي", priority: "مرتفع" },
  { time: "11:30", title: "لقاء مع قطاع التنمية", type: "طلب لقاء", priority: "متوسط" },
  { time: "13:00", title: "اعتماد خطاب رسمي", type: "توقيع", priority: "عاجل" },
  { time: "15:30", title: "متابعة تقرير أراك الحديد", type: "متابعة", priority: "مرتفع" },
];

const inbox = [
  { title: "خطاب شراكة استراتيجية", from: "مكتب الرئيس التنفيذي", status: "بحاجة اعتماد", risk: "مرتفع" },
  { title: "طلب اجتماع عاجل", from: "قطاع الاستثمار", status: "قيد الجدولة", risk: "متوسط" },
  { title: "تقرير متابعة أسبوعي", from: "إدارة المتابعة", status: "تم الفرز", risk: "منخفض" },
  { title: "مذكرة قانونية", from: "الشؤون القانونية", status: "تحتاج مراجعة", risk: "مرتفع" },
];

const chartData = [
  { day: "الأحد", tasks: 18, meetings: 5 },
  { day: "الاثنين", tasks: 24, meetings: 7 },
  { day: "الثلاثاء", tasks: 21, meetings: 4 },
  { day: "الأربعاء", tasks: 29, meetings: 9 },
  { day: "الخميس", tasks: 16, meetings: 6 },
];

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-white/[0.045] backdrop-blur-xl shadow-2xl shadow-black/10 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ children, tone = "slate" }) {
  const tones = {
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    slate: "bg-slate-500/10 text-slate-300 border-white/10",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default function SecretariatPage() {
  return (
    <div dir="rtl" className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-7 shadow-2xl">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs font-bold text-amber-200">
              <BriefcaseBusiness size={15} />
              Executive Secretariat Command Center
            </div>
            <h1 className="font-heading text-4xl font-black text-white">
              لوحة السكرتارية التنفيذية
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              واجهة تشغيل يومية لمكتب الرئيس التنفيذي: إدارة الوارد، جدول اللقاءات، القرارات، التكليفات، المراسلات، والتنبيهات الذكية.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <button className="rounded-2xl bg-amber-400 px-5 py-3 font-bold text-slate-950 shadow-lg shadow-amber-500/20">
              <CalendarDays size={16} className="ml-2 inline" />
              جدولة لقاء
            </button>
            <button className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold text-white hover:bg-white/15">
              <Send size={16} className="ml-2 inline" />
              تعميم جديد
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">{item.title}</p>
                  <div className="mt-2 text-3xl font-black text-white">{item.value}</div>
                  <p className="mt-2 text-xs text-slate-500">{item.change}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <Icon className="text-amber-300" size={22} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-white">مؤشر أداء المكتب التنفيذي</h2>
              <p className="mt-1 text-xs text-slate-500">المهام والاجتماعات خلال الأسبوع</p>
            </div>
            <Badge tone="blue">Live Office Pulse</Badge>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="tasks" stroke="#38bdf8" fill="#38bdf833" />
                <Area type="monotone" dataKey="meetings" stroke="#f59e0b" fill="#f59e0b33" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-white">جدول اليوم</h2>
            <Clock3 className="text-amber-300" size={21} />
          </div>

          <div className="space-y-3">
            {schedule.map((item) => (
              <div key={item.time} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm text-amber-300">{item.time}</span>
                  <Badge tone={item.priority === "عاجل" ? "rose" : item.priority === "مرتفع" ? "amber" : "blue"}>
                    {item.priority}
                  </Badge>
                </div>
                <div className="mt-3 font-bold text-white">{item.title}</div>
                <div className="mt-1 text-xs text-slate-500">{item.type}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-white">صندوق الوارد التنفيذي</h2>
              <p className="mt-1 text-xs text-slate-500">فرز ذكي للمراسلات حسب الأهمية والمخاطر والإجراء المطلوب</p>
            </div>
            <Mail className="text-blue-300" size={22} />
          </div>

          <div className="space-y-3">
            {inbox.map((item) => (
              <div key={item.title} className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06]">
                <div>
                  <div className="font-bold text-white">{item.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.from}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={item.risk === "مرتفع" ? "rose" : item.risk === "متوسط" ? "amber" : "emerald"}>
                    {item.risk}
                  </Badge>
                  <Badge>{item.status}</Badge>
                  <ArrowUpRight className="text-slate-500 group-hover:text-white" size={18} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <Brain className="text-amber-300" size={22} />
            <h2 className="font-heading text-xl font-bold text-white">مساعد السكرتارية الذكي</h2>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
              <div className="flex items-center gap-2 font-bold text-rose-200">
                <AlertTriangle size={17} />
                تضارب مواعيد
              </div>
              <p className="mt-2 text-sm leading-6 text-rose-100/80">
                يوجد اجتماعان متقاربان خلال 30 دقيقة. يُقترح دمج المتابعة مع اجتماع قطاع التنمية.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2 font-bold text-amber-200">
                <BellRing size={17} />
                إجراء مقترح
              </div>
              <p className="mt-2 text-sm leading-6 text-amber-100/80">
                خطاب الشراكة يحتاج توقيع الرئيس التنفيذي قبل نهاية اليوم.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 font-bold text-emerald-200">
                <CheckCircle2 size={17} />
                متابعة مكتملة
              </div>
              <p className="mt-2 text-sm leading-6 text-emerald-100/80">
                تم إغلاق 7 تكليفات تنفيذية هذا الأسبوع بنسبة التزام 82%.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { title: "إعداد محضر", icon: ClipboardCheck },
          { title: "إرسال مراسلة", icon: MessageSquareText },
          { title: "طلب اعتماد", icon: ShieldCheck },
          { title: "تنبيه متابعة", icon: BellRing },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button key={action.title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 text-right font-bold text-white transition hover:bg-white/[0.08]">
              <Icon className="mb-4 text-amber-300" size={24} />
              {action.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}