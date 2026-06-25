import React from "react";
import {
  Scale,
  FileText,
  ShieldAlert,
  CalendarClock,
  Gavel,
  FileSignature,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Search,
  ArrowUpRight,
  Clock3,
  Building2,
  ClipboardList,
  BookOpenCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const kpis = [
  { title: "قضايا نشطة", value: 14, note: "3 عالية المخاطر", icon: Gavel, tone: "rose" },
  { title: "عقود قيد المراجعة", value: 22, note: "7 بانتظار اعتماد", icon: FileSignature, tone: "blue" },
  { title: "جلسات قادمة", value: 6, note: "خلال 14 يوم", icon: CalendarClock, tone: "amber" },
  { title: "امتثال السياسات", value: "86%", note: "+8% هذا الشهر", icon: ShieldAlert, tone: "emerald" },
];

const riskTrend = [
  { month: "يناير", risk: 32, contracts: 18 },
  { month: "فبراير", risk: 28, contracts: 22 },
  { month: "مارس", risk: 41, contracts: 31 },
  { month: "أبريل", risk: 36, contracts: 27 },
  { month: "مايو", risk: 24, contracts: 35 },
  { month: "يونيو", risk: 19, contracts: 42 },
];

const cases = [
  { title: "نزاع توريد مواد صناعية", party: "مورد خارجي", status: "قيد المرافعة", risk: "مرتفع", due: "بعد 6 أيام" },
  { title: "مطالبة تعاقدية", party: "مقاول فرعي", status: "مراجعة مذكرة", risk: "متوسط", due: "بعد 12 يوم" },
  { title: "اعتراض نظامي", party: "جهة تنظيمية", status: "تجهيز رد", risk: "مرتفع", due: "خلال 48 ساعة" },
  { title: "تسوية ودية", party: "عميل رئيسي", status: "قيد الاعتماد", risk: "منخفض", due: "بعد 21 يوم" },
];

const contracts = [
  { name: "اتفاقية توريد حديد", owner: "أراك الحديد", stage: "مراجعة بنود الجزاءات", score: 78 },
  { name: "عقد خدمات لوجستية", owner: "أراك لوجستيك", stage: "مراجعة المسؤوليات", score: 64 },
  { name: "مذكرة تفاهم استراتيجية", owner: "الإدارة التنفيذية", stage: "بانتظار توقيع", score: 88 },
  { name: "عقد تشغيل وصيانة", owner: "المشاريع", stage: "تدقيق نهائي", score: 72 },
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

function riskTone(risk) {
  if (risk === "مرتفع") return "rose";
  if (risk === "متوسط") return "amber";
  return "emerald";
}

export default function LegalPage() {
  return (
    <div dir="rtl" className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-7 shadow-2xl">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs font-bold text-amber-200">
              <Scale size={15} />
              Legal Operations Command Center
            </div>
            <h1 className="font-heading text-4xl font-black text-white">
              لوحة المتابعات القانونية
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              لوحة قيادة قانونية لمكتب الرئيس التنفيذي: القضايا، العقود، الجلسات، المخاطر النظامية، الامتثال، والمذكرات التنفيذية في واجهة واحدة.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <button className="rounded-2xl bg-amber-400 px-5 py-3 font-bold text-slate-950 shadow-lg shadow-amber-500/20">
              <FileText size={16} className="ml-2 inline" />
              مذكرة قانونية
            </button>
            <button className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold text-white hover:bg-white/15">
              <Search size={16} className="ml-2 inline" />
              فحص عقد
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
                  <p className="mt-2 text-xs text-slate-500">{item.note}</p>
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
              <h2 className="font-heading text-xl font-bold text-white">اتجاه المخاطر القانونية</h2>
              <p className="mt-1 text-xs text-slate-500">مقارنة المخاطر والعقود المعالجة شهرياً</p>
            </div>
            <Badge tone="blue">Legal Risk Pulse</Badge>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrend}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="risk" stroke="#fb7185" fill="#fb718533" />
                <Area type="monotone" dataKey="contracts" stroke="#38bdf8" fill="#38bdf833" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <Brain className="text-amber-300" size={22} />
            <h2 className="font-heading text-xl font-bold text-white">محرك المخاطر القانونية</h2>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
              <div className="flex items-center gap-2 font-bold text-rose-200">
                <AlertTriangle size={17} />
                خطر تعاقدي
              </div>
              <p className="mt-2 text-sm leading-6 text-rose-100/80">
                عقد الخدمات اللوجستية يحتوي على بند مسؤولية مفتوح دون سقف تعويض واضح.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2 font-bold text-amber-200">
                <Clock3 size={17} />
                موعد حرج
              </div>
              <p className="mt-2 text-sm leading-6 text-amber-100/80">
                توجد جلسة خلال 6 أيام وتتطلب اعتماد مذكرة الرد قبل 48 ساعة.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 font-bold text-emerald-200">
                <CheckCircle2 size={17} />
                امتثال جيد
              </div>
              <p className="mt-2 text-sm leading-6 text-emerald-100/80">
                تحسّن مؤشر الالتزام بالسياسات التعاقدية بنسبة 8% هذا الشهر.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-white">ملف القضايا النشطة</h2>
              <p className="mt-1 text-xs text-slate-500">متابعة القضايا حسب الطرف والحالة والمخاطر والموعد</p>
            </div>
            <Gavel className="text-amber-300" size={22} />
          </div>

          <div className="space-y-3">
            {cases.map((item) => (
              <div key={item.title} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-white">{item.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.party} • {item.due}</div>
                  </div>
                  <ArrowUpRight className="text-slate-500 group-hover:text-white" size={18} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone={riskTone(item.risk)}>{item.risk}</Badge>
                  <Badge>{item.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-white">العقود والاتفاقيات</h2>
              <p className="mt-1 text-xs text-slate-500">درجات الجاهزية والمخاطر قبل الاعتماد أو التوقيع</p>
            </div>
            <FileSignature className="text-blue-300" size={22} />
          </div>

          <div className="space-y-4">
            {contracts.map((item) => (
              <div key={item.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-bold text-white">{item.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.owner} • {item.stage}</div>
                  </div>
                  <div className="text-xl font-black text-white">{item.score}%</div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-amber-300 to-blue-400"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { title: "فتح قضية", icon: Gavel },
          { title: "مراجعة عقد", icon: FileSignature },
          { title: "إصدار مذكرة", icon: ClipboardList },
          { title: "تحديث سياسة", icon: BookOpenCheck },
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