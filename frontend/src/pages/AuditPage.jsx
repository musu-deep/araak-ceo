import React from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Activity,
  Cpu,
  Camera,
  Fingerprint,
  Truck,
  Factory,
  Server,
  Gauge,
  Eye,
  Wifi,
  HardDrive,
  ClipboardCheck,
  Brain,
  ArrowUpRight,
  CheckCircle2,
  BellRing,
  UploadCloud,
  FileUp,
  Database,
  FileSpreadsheet,
  X,
  FileText,
  Network,
  Download,
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

const healthData = [
  { day: "الأحد", compliance: 86, network: 94, assets: 79, alerts: 12 },
  { day: "الاثنين", compliance: 88, network: 93, assets: 81, alerts: 10 },
  { day: "الثلاثاء", compliance: 84, network: 96, assets: 78, alerts: 15 },
  { day: "الأربعاء", compliance: 91, network: 97, assets: 84, alerts: 8 },
  { day: "الخميس", compliance: 93, network: 96, assets: 87, alerts: 7 },
];

const monthlyTrend = [
  { name: "01 يونيو", observations: 15, alerts: 7 },
  { name: "06 يونيو", observations: 12, alerts: 4 },
  { name: "11 يونيو", observations: 17, alerts: 6 },
  { name: "16 يونيو", observations: 10, alerts: 3 },
  { name: "21 يونيو", observations: 14, alerts: 5 },
  { name: "26 يونيو", observations: 11, alerts: 4 },
  { name: "30 يونيو", observations: 16, alerts: 6 },
];

const kpis = [
  {
    title: "مؤشر الالتزام العام",
    value: "91%",
    note: "+6% مقارنة بالشهر الماضي",
    icon: ShieldCheck,
    insight: "الالتزام العام جيد، مع وجود فجوة في إغلاق ملاحظات السلامة داخل المواقع التشغيلية.",
    bullets: ["72 ملاحظة مغلقة", "36 تحت المعالجة", "6 مفتوحة عالية الأثر"],
    actions: ["تثبيت مراجعة أسبوعية للملاحظات", "تصعيد الملاحظات المتأخرة أكثر من 7 أيام"],
  },
  {
    title: "التنبيهات الحرجة",
    value: 7,
    note: "3 تحتاج تدخل فوري",
    icon: AlertTriangle,
    insight: "تتركز التنبيهات الحرجة في الكاميرات، أراك الحديد، وأراك لوجستيك.",
    bullets: ["كاميرا غير متصلة في المستودع", "انخفاض إنتاجية خط إنتاج 2", "مركبة تجاوزت المسار المعتمد"],
    actions: ["فتح بلاغ عاجل للصيانة", "إشعار مدير التشغيل", "طلب تقرير تحقق خلال 24 ساعة"],
  },
  {
    title: "جاهزية الشبكة",
    value: "96%",
    note: "24 جهاز مراقب / 0 أعطال حرجة",
    icon: Wifi,
    insight: "الشبكة مستقرة عموماً، لكن توجد مؤشرات ضغط على الربط الداخلي في أوقات الذروة.",
    bullets: ["متوسط الاستجابة 38ms", "Uptime 99.1%", "آخر نسخة احتياطية قبل 4 ساعات"],
    actions: ["مراجعة سعة الربط الداخلي", "تفعيل تنبيه عند تجاوز Latency 100ms"],
  },
  {
    title: "أداء الأصول والمرافق",
    value: "84%",
    note: "مصانع / مركبات / عتاد",
    icon: Gauge,
    insight: "الأداء متوسط بسبب أعطال متكررة في بعض الأجهزة ونقاط صيانة مجدولة للمركبات.",
    bullets: ["156 جهاز مسجل", "5 أجهزة تحتاج صيانة", "42 مركبة ضمن المتابعة"],
    actions: ["تحديث سجل الأصول", "ربط البلاغات بالصيانة الوقائية"],
  },
];

const domains = [
  {
    title: "الشبكة والخوادم",
    status: "مستقر",
    score: 96,
    icon: Server,
    details: "Latency / Uptime / Backup",
    metrics: [["الأجهزة المراقبة", "24"], ["الأعطال الحرجة", "0"], ["متوسط الاستجابة", "38ms"], ["آخر نسخة احتياطية", "قبل 4 ساعات"]],
    reports: ["تقرير الشبكة اليومي", "سجل النسخ الاحتياطي", "خريطة الأجهزة النشطة"],
    actions: ["اختبار الربط", "مراجعة النسخ الاحتياطي", "فتح سجل الأعطال"],
  },
  {
    title: "الأجهزة والعتاد",
    status: "متابعة",
    score: 82,
    icon: Cpu,
    details: "PCs / Printers / Routers",
    metrics: [["إجمالي الأجهزة", "156"], ["تحتاج صيانة", "5"], ["أجهزة خارج الخدمة", "2"], ["نسبة الجاهزية", "82%"]],
    reports: ["جرد العتاد", "تقرير الصيانة", "تقرير العمر التشغيلي"],
    actions: ["إضافة أصل", "طلب صيانة", "تصدير الجرد"],
  },
  {
    title: "الكاميرات",
    status: "تحذير",
    score: 74,
    icon: Camera,
    details: "Coverage / Offline Cameras",
    metrics: [["إجمالي الكاميرات", "84"], ["غير متصلة", "7"], ["نطاقات غير مغطاة", "3"], ["آخر فحص", "اليوم 10:15"]],
    reports: ["تقرير الكاميرات", "خريطة التغطية", "سجل الانقطاعات"],
    actions: ["فتح بلاغ CCTV", "إعادة فحص الاتصال", "تصعيد للأمن والسلامة"],
  },
  {
    title: "البصمة والحضور",
    status: "مستقر",
    score: 89,
    icon: Fingerprint,
    details: "Attendance / Late Patterns",
    metrics: [["موظفون نشطون", "612"], ["تأخر متكرر", "23"], ["غياب غير مبرر", "8"], ["نسبة الالتزام", "89%"]],
    reports: ["تقرير الحضور اليومي", "تقرير التأخر", "سجل الاستثناءات"],
    actions: ["تحليل نمط التأخر", "إحالة للموارد البشرية", "إرسال تنبيه إداري"],
  },
  {
    title: "أراك الحديد",
    status: "متابعة",
    score: 81,
    icon: Factory,
    details: "Production Lines / OEE",
    metrics: [["خطوط الإنتاج", "5"], ["OEE", "78%"], ["توقفات الأسبوع", "3"], ["ملاحظات جودة", "8"]],
    reports: ["تقرير الإنتاج اليومي", "تقرير الجودة", "تقرير التوقفات"],
    actions: ["فتح لوحة المصنع", "تحليل خط الإنتاج 2", "طلب تقرير جودة"],
  },
  {
    title: "أراك لوجستيك",
    status: "تحذير",
    score: 77,
    icon: Truck,
    details: "Fleet / Fuel / Routes",
    metrics: [["المركبات", "42"], ["تنبيهات مسار", "6"], ["صيانة قادمة", "9"], ["استهلاك وقود غير طبيعي", "4"]],
    reports: ["تقرير المركبات الأسبوعي", "تقرير الوقود", "تقرير المسارات"],
    actions: ["فتح لوحة الأسطول", "مراجعة المسارات", "إرسال تنبيه للسائقين"],
  },
];


const cameraSites = [
  {
    organization: "أراك الحديد",
    location: "المصنع الرئيسي",
    total: 32,
    online: 27,
    offline: 3,
    weakSignal: 2,
    recordingHealth: "88%",
    coverage: "91%",
    lastIncident: "انقطاع كاميرا بوابة 3 منذ 18 دقيقة",
    zones: [
      { name: "بوابة الدخول", total: 6, online: 5, offline: 1, weakSignal: 0, risk: "مرتفع", issue: "كاميرا CCTV-034 غير متصلة" },
      { name: "خط الإنتاج 1", total: 8, online: 8, offline: 0, weakSignal: 0, risk: "منخفض", issue: "لا توجد ملاحظات" },
      { name: "منطقة التحميل", total: 10, online: 8, offline: 1, weakSignal: 1, risk: "متوسط", issue: "ضعف جودة بث في كاميرا التحميل الغربية" },
      { name: "المستودع", total: 8, online: 6, offline: 1, weakSignal: 1, risk: "مرتفع", issue: "نقطة عمياء قرب ممر المواد" },
    ],
  },
  {
    organization: "أراك لوجستيك",
    location: "ساحة المركبات",
    total: 18,
    online: 15,
    offline: 2,
    weakSignal: 1,
    recordingHealth: "82%",
    coverage: "86%",
    lastIncident: "انقطاع جزئي في كاميرات بوابة الخروج",
    zones: [
      { name: "بوابة الخروج", total: 5, online: 4, offline: 1, weakSignal: 0, risk: "مرتفع", issue: "كاميرا البوابة الشرقية لا تسجل" },
      { name: "منطقة الصيانة", total: 4, online: 4, offline: 0, weakSignal: 0, risk: "منخفض", issue: "لا توجد ملاحظات" },
      { name: "مواقف الشاحنات", total: 9, online: 7, offline: 1, weakSignal: 1, risk: "متوسط", issue: "تذبذب إشارة في كاميرا الصف الثالث" },
    ],
  },
  {
    organization: "الإدارة العامة",
    location: "مكتب الرئيس التنفيذي",
    total: 12,
    online: 12,
    offline: 0,
    weakSignal: 0,
    recordingHealth: "99%",
    coverage: "98%",
    lastIncident: "لا توجد حوادث مسجلة خلال 7 أيام",
    zones: [
      { name: "الاستقبال", total: 3, online: 3, offline: 0, weakSignal: 0, risk: "منخفض", issue: "لا توجد ملاحظات" },
      { name: "ممر الإدارة", total: 4, online: 4, offline: 0, weakSignal: 0, risk: "منخفض", issue: "لا توجد ملاحظات" },
      { name: "مواقف الزوار", total: 5, online: 5, offline: 0, weakSignal: 0, risk: "منخفض", issue: "لا توجد ملاحظات" },
    ],
  },
  {
    organization: "المستودعات المركزية",
    location: "منطقة التخزين والتحميل",
    total: 22,
    online: 18,
    offline: 2,
    weakSignal: 2,
    recordingHealth: "79%",
    coverage: "83%",
    lastIncident: "ضعف تغطية في ممر التحميل الخلفي",
    zones: [
      { name: "ممرات التخزين", total: 8, online: 7, offline: 0, weakSignal: 1, risk: "متوسط", issue: "ضعف إضاءة يؤثر على جودة الصورة" },
      { name: "منطقة التحميل", total: 7, online: 5, offline: 1, weakSignal: 1, risk: "مرتفع", issue: "كاميرا غير متصلة ونقطة عمياء" },
      { name: "بوابة الاستلام", total: 4, online: 4, offline: 0, weakSignal: 0, risk: "منخفض", issue: "لا توجد ملاحظات" },
      { name: "مواقف الموردين", total: 3, online: 2, offline: 1, weakSignal: 0, risk: "متوسط", issue: "كاميرا خارج الخدمة" },
    ],
  },
];

const alerts = [
  {
    id: "a1",
    title: "كاميرا غير متصلة",
    source: "مستودع أراك الحديد - بوابة 3",
    level: "حرج",
    time: "منذ 18 دقيقة",
    owner: "الأمن والسلامة",
    reason: "فقدان اتصال بالكاميرا رقم CCTV-034 في نقطة دخول حساسة.",
    impact: "نقطة مراقبة غير مغطاة في منطقة حركة مواد.",
    actions: ["إعادة تشغيل نقطة الشبكة", "فتح بلاغ صيانة", "تفعيل دورية أمنية مؤقتة"],
  },
  {
    id: "a2",
    title: "انخفاض إنتاجية خط الإنتاج",
    source: "أراك الحديد - خط إنتاج 2",
    level: "مرتفع",
    time: "منذ ساعتين",
    owner: "مدير المصنع",
    reason: "انخفاض 18% عن متوسط الأسبوع مع زيادة زمن التوقف.",
    impact: "احتمال تأخر في أوامر التوريد ذات الأولوية.",
    actions: ["مراجعة سجل الأعطال", "فحص وردية التشغيل", "تحليل مواد الخام"],
  },
  {
    id: "a3",
    title: "تأخر متكرر في البصمة",
    source: "إدارة المشاريع",
    level: "متوسط",
    time: "اليوم",
    owner: "الموارد البشرية",
    reason: "23 موظفاً لديهم نمط تأخر متكرر خلال آخر 5 أيام.",
    impact: "تأثير متوسط على تسليمات المشاريع الميدانية.",
    actions: ["إشعار المدير المباشر", "مراجعة الجداول", "تفعيل خطة انضباط"],
  },
  {
    id: "a4",
    title: "مركبة تجاوزت المسار",
    source: "أراك لوجستيك - الشاحنة 14",
    level: "مرتفع",
    time: "أمس",
    owner: "إدارة الأسطول",
    reason: "خروج عن المسار المعتمد لمسافة 8 كم.",
    impact: "ارتفاع مخاطر الوقود والتأخير والتتبع.",
    actions: ["مراجعة GPS", "تواصل مع السائق", "تحديث مسار الرحلة"],
  },
];

const reportTypes = [
  { key: "attendance", label: "تقرير الحضور والبصمة", source: "Fingerprint / HR", icon: Fingerprint },
  { key: "fleet", label: "تقرير المركبات واللوجستيك", source: "Araak Logistics", icon: Truck },
  { key: "production", label: "تقرير الإنتاج", source: "Araak Steel / Factory", icon: Factory },
  { key: "network", label: "تقرير الشبكة والأجهزة", source: "IT / Network", icon: Server },
  { key: "cameras", label: "تقرير الكاميرات", source: "CCTV / Security", icon: Camera },
  { key: "assets", label: "تقرير الأصول والعتاد", source: "Assets / Inventory", icon: Cpu },
  { key: "general", label: "تقرير رقابي عام", source: "Manual Report", icon: FileSpreadsheet },
];

const initialReports = [
  {
    id: 1,
    name: "تقرير حضور يومي",
    type: "تقرير الحضور والبصمة",
    source: "Fingerprint / HR",
    status: "تم التحليل",
    date: "اليوم",
    alerts: 3,
    fileName: "attendance-daily.csv",
    summary: "رصد 23 حالة تأخر متكرر و8 حالات غياب غير مبرر، مع تحسن عام في الانضباط بنسبة 4%.",
    findings: ["تأخر متكرر في إدارة المشاريع", "تحسن التزام فرق المستودعات", "الحاجة لمراجعة ورديات ميدانية"],
    actions: ["إرسال ملخص للموارد البشرية", "إحالة 5 حالات للمدير المباشر"],
  },
  {
    id: 2,
    name: "تقرير مركبات أسبوعي",
    type: "تقرير المركبات واللوجستيك",
    source: "Araak Logistics",
    status: "بانتظار المراجعة",
    date: "أمس",
    alerts: 5,
    fileName: "fleet-weekly.xlsx",
    summary: "تم رصد 6 تنبيهات مسار و4 حالات استهلاك وقود غير طبيعي، مع 9 مركبات تحتاج صيانة قريبة.",
    findings: ["الشاحنة 14 تجاوزت المسار", "ارتفاع وقود في مسار جدة", "تأخر صيانة دورية"],
    actions: ["مراجعة GPS", "تحديث خطة الصيانة", "إرسال تنبيه لقائد الأسطول"],
  },
  {
    id: 3,
    name: "تقرير إنتاج أراك الحديد",
    type: "تقرير الإنتاج",
    source: "Araak Steel / Factory",
    status: "تم التحليل",
    date: "هذا الأسبوع",
    alerts: 2,
    fileName: "production-lines.xlsx",
    summary: "خط إنتاج 2 أقل من المتوسط بنسبة 18% مع 3 توقفات تشغيلية وملاحظات جودة محدودة.",
    findings: ["انخفاض OEE إلى 78%", "توقفات متكررة في الوردية الثانية", "تحسن جودة خط 4"],
    actions: ["تحليل توقف خط 2", "فحص الصيانة الوقائية", "مراجعة مواد الخام"],
  },
];

function Card({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-3xl border border-white/10 bg-white/[0.045] backdrop-blur-xl shadow-2xl shadow-black/10 ${
        onClick ? "cursor-pointer transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-white/[0.07]" : ""
      } ${className}`}
    >
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
    cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    slate: "bg-slate-500/10 text-slate-300 border-white/10",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
}

function statusTone(status) {
  if (status === "تحذير") return "rose";
  if (status === "متابعة") return "amber";
  return "emerald";
}

function levelTone(level) {
  if (level === "حرج") return "rose";
  if (level === "مرتفع") return "amber";
  return "blue";
}

function reportStatusTone(status) {
  if (status === "بانتظار المراجعة") return "amber";
  if (status === "مرفوع حديثاً") return "blue";
  if (status === "يحتاج تحقق") return "rose";
  return "emerald";
}


function CameraDetailModal({ onClose }) {
  const totals = cameraSites.reduce(
    (acc, site) => ({
      total: acc.total + site.total,
      online: acc.online + site.online,
      offline: acc.offline + site.offline,
      weakSignal: acc.weakSignal + site.weakSignal,
    }),
    { total: 0, online: 0, offline: 0, weakSignal: 0 }
  );

  const cameraChartData = cameraSites.map((site) => ({
    name: site.organization,
    online: site.online,
    offline: site.offline,
    weakSignal: site.weakSignal,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-slate-950/95 p-6 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
              <Camera className="text-cyan-300" size={28} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">CCTV Command Layer</div>
              <h2 className="mt-2 font-heading text-2xl font-black text-white">لوحة توزيع كاميرات المراقبة</h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                توزيع تجريبي احترافي للكاميرات حسب المؤسسة والموقع والمنطقة، مع مؤشرات الاتصال، جودة التسجيل، التغطية، والتنبيهات التشغيلية.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              ["إجمالي الكاميرات", totals.total, "كل المؤسسات"],
              ["متصلة", totals.online, "Online"],
              ["غير متصلة", totals.offline, "Offline"],
              ["ضعف إشارة", totals.weakSignal, "Weak Signal"],
            ].map(([label, value, note]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs text-slate-500">{label}</div>
                <div className="mt-2 text-3xl font-black text-white">{value}</div>
                <div className="mt-1 text-xs text-slate-500">{note}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">توزيع حالة الكاميرات حسب المؤسسة</h3>
                  <p className="mt-1 text-xs text-slate-500">متصلة / غير متصلة / ضعيفة الإشارة</p>
                </div>
                <Badge tone="cyan">CCTV Health</Badge>
              </div>
              <div className="h-72 min-h-[288px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cameraChartData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="online" fill="#22c55e" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="offline" fill="#fb7185" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="weakSignal" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
              <div className="mb-3 flex items-center gap-2 font-bold text-cyan-200">
                <Brain size={18} />
                قراءة AI رقابية
              </div>
              <p className="text-sm leading-7 text-cyan-50/80">
                أعلى مخاطرة حالياً في المستودعات المركزية وأراك الحديد بسبب كاميرات غير متصلة ونقاط عمياء في مناطق التحميل والبوابات. يُقترح فتح بلاغ صيانة موحد وربط الكاميرات الحرجة بخطة دوريات مؤقتة.
              </p>
              <div className="mt-4 space-y-2">
                {["فتح بلاغ CCTV موحد", "تصدير تقرير تغطية", "طلب فحص ميداني خلال 24 ساعة"].map((action) => (
                  <button key={action} className="w-full rounded-xl border border-cyan-400/20 bg-slate-950/30 px-4 py-3 text-right text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/10">
                    <ArrowUpRight className="ml-2 inline" size={15} />
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {cameraSites.map((site) => (
              <div key={site.organization} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-white">{site.organization}</h3>
                    <p className="mt-1 text-xs text-slate-500">{site.location} • آخر حدث: {site.lastIncident}</p>
                  </div>
                  <Badge tone={site.offline > 1 ? "rose" : site.weakSignal > 0 ? "amber" : "emerald"}>
                    {site.offline > 1 ? "تحتاج تدخل" : site.weakSignal > 0 ? "متابعة" : "مستقر"}
                  </Badge>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    ["الإجمالي", site.total],
                    ["متصلة", site.online],
                    ["غير متصلة", site.offline],
                    ["ضعف إشارة", site.weakSignal],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-white/[0.04] p-3">
                      <div className="text-[11px] text-slate-500">{label}</div>
                      <div className="mt-1 text-xl font-black text-white">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[11px] text-slate-500">صحة التسجيل</div>
                    <div className="mt-1 font-black text-white">{site.recordingHealth}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[11px] text-slate-500">نسبة التغطية</div>
                    <div className="mt-1 font-black text-white">{site.coverage}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {site.zones.map((zone) => (
                    <div key={zone.name} className="rounded-xl border border-white/10 bg-slate-950/30 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-white">{zone.name}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            {zone.online}/{zone.total} متصلة • {zone.offline} غير متصلة • {zone.weakSignal} ضعيفة
                          </div>
                        </div>
                        <Badge tone={zone.risk === "مرتفع" ? "rose" : zone.risk === "متوسط" ? "amber" : "emerald"}>{zone.risk}</Badge>
                      </div>
                      <div className="mt-2 text-xs leading-6 text-slate-400">{zone.issue}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ detail, onClose }) {
  if (!detail) return null;
  const Icon = detail.icon || FileText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-slate-950/95 p-6 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
              <Icon className="text-cyan-300" size={26} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">{detail.label || "تفاصيل رقابية"}</div>
              <h2 className="mt-2 font-heading text-2xl font-black text-white">{detail.title}</h2>
              {detail.subtitle && <p className="mt-2 text-sm leading-7 text-slate-400">{detail.subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-5">
            {detail.insight && (
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-cyan-200">
                  <Brain size={18} />
                  قراءة تنفيذية
                </div>
                <p className="text-sm leading-7 text-cyan-50/80">{detail.insight}</p>
              </div>
            )}

            {detail.metrics?.length > 0 && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {detail.metrics.map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-xs text-slate-500">{label}</div>
                    <div className="mt-2 text-2xl font-black text-white">{value}</div>
                  </div>
                ))}
              </div>
            )}

            {detail.chart === "trend" && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <h3 className="mb-4 font-heading font-bold text-white">اتجاه المؤشرات</h3>
                <div className="h-72 min-h-[288px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={healthData}>
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip />
                      <Area type="monotone" dataKey="compliance" stroke="#22c55e" fill="#22c55e33" />
                      <Area type="monotone" dataKey="network" stroke="#38bdf8" fill="#38bdf833" />
                      <Area type="monotone" dataKey="assets" stroke="#f59e0b" fill="#f59e0b33" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {detail.chart === "bars" && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <h3 className="mb-4 font-heading font-bold text-white">عدد الملاحظات والتنبيهات</h3>
                <div className="h-72 min-h-[288px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrend}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="observations" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="alerts" fill="#fb7185" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {detail.findings?.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <h3 className="mb-4 font-heading font-bold text-white">المخرجات التفصيلية</h3>
                <div className="space-y-3">
                  {detail.findings.map((finding) => (
                    <div key={finding} className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-3 text-sm text-slate-300">
                      <CheckCircle2 className="mt-0.5 text-emerald-300" size={16} />
                      {finding}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail.reports?.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <h3 className="mb-4 font-heading font-bold text-white">التقارير المرتبطة</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {detail.reports.map((report) => (
                    <div key={report} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <FileText className="mb-3 text-cyan-300" size={18} />
                      <div className="font-bold text-white">{report}</div>
                      <div className="mt-1 text-xs text-slate-500">ملف تجريبي قابل للربط لاحقاً</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <h3 className="mb-4 font-heading font-bold text-white">الإجراءات المقترحة</h3>
              <div className="space-y-2">
                {(detail.actions || ["فتح متابعة", "إرسال تنبيه", "طلب تقرير"]).map((action) => (
                  <button key={action} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-right text-sm font-bold text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10">
                    <ArrowUpRight className="ml-2 inline text-cyan-300" size={15} />
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {detail.bullets?.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <h3 className="mb-4 font-heading font-bold text-white">ملخص سريع</h3>
                <div className="space-y-3">
                  {detail.bullets.map((item) => (
                    <div key={item} className="text-sm text-slate-300">
                      <span className="ml-2 text-cyan-300">•</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail.impact && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
                <h3 className="mb-2 font-heading font-bold text-amber-200">الأثر المتوقع</h3>
                <p className="text-sm leading-7 text-amber-100/80">{detail.impact}</p>
              </div>
            )}

            <button className="w-full rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">
              <Download className="ml-2 inline" size={16} />
              تصدير التقرير التفصيلي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuditPage() {
  const [reports, setReports] = React.useState(initialReports);
  const [reportForm, setReportForm] = React.useState({
    type: "attendance",
    title: "",
    file: null,
  });
  const [detailPanel, setDetailPanel] = React.useState(null);
  const [cameraPanel, setCameraPanel] = React.useState(false);

  const openDetail = (detail) => setDetailPanel(detail);

  const submitReport = async () => {
    if (!reportForm.title.trim() || !reportForm.file) {
      alert("أدخل اسم التقرير وارفع الملف أولاً");
      return;
    }

    const selectedType = reportTypes.find((type) => type.key === reportForm.type);

    const newReport = {
      id: Date.now(),
      name: reportForm.title.trim(),
      type: selectedType?.label || "تقرير رقابي عام",
      source: selectedType?.source || "Manual Report",
      status: "مرفوع حديثاً",
      date: "الآن",
      alerts: 0,
      fileName: reportForm.file.name,
      size: `${Math.max(1, Math.round(reportForm.file.size / 1024))} KB`,
      summary: "تم رفع التقرير بنجاح. سيتم عرض التحليل التجريبي هنا إلى حين الربط مع محرك تحليل التقارير.",
      findings: ["تم استقبال الملف", "تم تصنيف نوع التقرير", "جاهز للتحليل اليدوي أو الآلي"],
      actions: ["تحليل التقرير", "إسناده للمراجع", "تصدير ملخص تنفيذي"],
    };

    setReports((current) => [newReport, ...current]);
    setReportForm({ type: "attendance", title: "", file: null });
    setDetailPanel({
      icon: selectedType?.icon || FileSpreadsheet,
      label: "تقرير رقابي مرفوع",
      title: newReport.name,
      subtitle: `${newReport.type} • ${newReport.fileName}`,
      insight: newReport.summary,
      findings: newReport.findings,
      actions: newReport.actions,
      metrics: [
        ["الحالة", newReport.status],
        ["عدد التنبيهات", String(newReport.alerts)],
        ["الحجم", newReport.size],
        ["المصدر", newReport.source],
      ],
    });
  };

  const selectedReportType = reportTypes.find((type) => type.key === reportForm.type) || reportTypes[0];
  const SelectedReportIcon = selectedReportType.icon;

  return (
    <div dir="rtl" className="space-y-6 pb-28">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-7 shadow-2xl">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-200">
              <Eye size={15} />
              Governance & Inspection Command Center
            </div>
            <h1 className="font-heading text-4xl font-black text-white">
              مركز الرقابة والتفتيش
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              لوحة قيادة رقابية تربط الالتزام، الشبكة، الأجهزة، الكاميرات، البصمة، الأصول، خطوط الإنتاج، المركبات، وسلوك الأداء في مركز متابعة واحد قابل للربط مستقبلاً مع Odoo وERP وأراك لوجستيك وأراك الحديد.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <button
              onClick={() =>
                openDetail({
                  icon: ClipboardCheck,
                  label: "أداة تشغيلية",
                  title: "إنشاء تقرير تفتيش",
                  subtitle: "نموذج تجريبي لإنشاء تقرير تفتيش ميداني أو مكتبي.",
                  insight: "يمكن تحويل هذا الزر لاحقاً إلى نموذج إدخال كامل لتقارير التفتيش يتضمن الموقع، المسؤول، الملاحظات، الصور، ودرجة الخطورة.",
                  metrics: [
                    ["نوع النموذج", "تفتيش"],
                    ["المخرجات", "محضر + ملاحظات"],
                    ["التكامل", "ERP / Docs"],
                    ["الحالة", "جاهز للتطوير"],
                  ],
                  actions: ["فتح نموذج تفتيش", "إسناد لمفتش", "إنشاء محضر"],
                })
              }
              className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-500/20"
            >
              <ClipboardCheck size={16} className="ml-2 inline" />
              تقرير تفتيش
            </button>
            <button
              onClick={() =>
                openDetail({
                  icon: BellRing,
                  label: "أداة تنبيه",
                  title: "إنشاء تنبيه رقابي",
                  subtitle: "تنبيه يدوي أو آلي لأي حدث رقابي.",
                  insight: "تُستخدم هذه الأداة لرفع تنبيه فوري مرتبط بكاميرا، بصمة، مركبة، أصل، أو خط إنتاج.",
                  metrics: [
                    ["مستويات الخطورة", "3"],
                    ["قنوات التنبيه", "داخلية / بريد / واتساب"],
                    ["المعالجة", "تصعيد"],
                    ["الحالة", "تجريبية"],
                  ],
                  actions: ["إرسال تنبيه", "ربط التنبيه بقسم", "إنشاء متابعة"],
                })
              }
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold text-white hover:bg-white/15"
            >
              <BellRing size={16} className="ml-2 inline" />
              تنبيه جديد
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.title}
              className="p-5"
              onClick={() =>
                openDetail({
                  icon: item.icon,
                  label: "مؤشر تنفيذي",
                  title: item.title,
                  subtitle: `${item.value} • ${item.note}`,
                  insight: item.insight,
                  bullets: item.bullets,
                  actions: item.actions,
                  chart: "trend",
                  metrics: [
                    ["القيمة الحالية", String(item.value)],
                    ["التغير", item.note],
                    ["المصدر", "بيانات تجريبية"],
                    ["الدورية", "يومي / أسبوعي"],
                  ],
                })
              }
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">{item.title}</p>
                  <div className="mt-2 text-3xl font-black text-white">{item.value}</div>
                  <p className="mt-2 text-xs text-slate-500">{item.note}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <Icon className="text-cyan-300" size={22} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card
          className="xl:col-span-2 p-6"
          onClick={() =>
            openDetail({
              icon: Activity,
              label: "تحليل زمني",
              title: "الصحة الرقابية الشاملة",
              subtitle: "الالتزام، الشبكة، والأصول خلال الأسبوع",
              insight: "توضح القراءة أن جاهزية الشبكة مستقرة بينما تتحسن الأصول تدريجياً، مع حاجة لمتابعة التذبذب في الالتزام يوم الثلاثاء.",
              chart: "trend",
              findings: ["تراجع الالتزام الثلاثاء إلى 84%", "ارتفاع الشبكة إلى 97% الأربعاء", "تحسن الأصول من 79% إلى 87%"],
              actions: ["تحليل يوم الثلاثاء", "فتح تقرير الأصول", "إرسال ملخص للإدارة"],
            })
          }
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-white">الصحة الرقابية الشاملة</h2>
              <p className="mt-1 text-xs text-slate-500">الالتزام، الشبكة، والأصول خلال الأسبوع</p>
            </div>
            <Badge tone="blue">Control Health Pulse</Badge>
          </div>

          <div className="h-72 min-h-[288px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthData}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="compliance" stroke="#22c55e" fill="#22c55e33" />
                <Area type="monotone" dataKey="network" stroke="#38bdf8" fill="#38bdf833" />
                <Area type="monotone" dataKey="assets" stroke="#f59e0b" fill="#f59e0b33" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          className="p-6"
          onClick={() =>
            openDetail({
              icon: Brain,
              label: "AI Audit Engine",
              title: "محرك كشف الشذوذ",
              subtitle: "قراءة تجريبية للأنماط غير الطبيعية في الرقابة التشغيلية",
              insight: "يرصد المحرك انخفاضاً في الإنتاج ونمط تأخر متكرر وضعفاً في تغطية الكاميرات، ويوصي بفتح متابعة مشتركة بين التشغيل والرقابة.",
              findings: ["انخفاض إنتاجية خط 2", "تأخر متكرر في إدارة المشاريع", "كاميرات غير متصلة في بوابة 3"],
              actions: ["إنشاء متابعة موحدة", "إرسال تنبيه للمديرين", "طلب تقرير تحقق"],
            })
          }
        >
          <div className="mb-5 flex items-center gap-2">
            <Brain className="text-cyan-300" size={22} />
            <h2 className="font-heading text-xl font-bold text-white">محرك كشف الشذوذ</h2>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
              <div className="flex items-center gap-2 font-bold text-rose-200">
                <AlertTriangle size={17} />
                خطر تشغيلي
              </div>
              <p className="mt-2 text-sm leading-6 text-rose-100/80">
                انخفاض مفاجئ في إنتاجية خط إنتاج 2 بنسبة 18% مقارنة بمتوسط الأسبوع.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2 font-bold text-amber-200">
                <Fingerprint size={17} />
                نمط حضور غير طبيعي
              </div>
              <p className="mt-2 text-sm leading-6 text-amber-100/80">
                تكرار تأخير في مجموعة موظفين ضمن نفس الإدارة خلال آخر 5 أيام.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 font-bold text-emerald-200">
                <CheckCircle2 size={17} />
                تحسن رقابي
              </div>
              <p className="mt-2 text-sm leading-6 text-emerald-100/80">
                تحسن جاهزية الشبكة إلى 96% بعد معالجة أعطال الربط الداخلية.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-white">نطاقات الرقابة المؤسسية</h2>
            <p className="mt-1 text-xs text-slate-500">اضغط على أي نطاق لفتح التفاصيل والمؤشرات والتقارير المرتبطة</p>
          </div>
          <Activity className="text-cyan-300" size={22} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {domains.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="p-4"
                onClick={() => {
                  if (item.title === "الكاميرات") {
                    setCameraPanel(true);
                    return;
                  }

                  openDetail({
                    icon: item.icon,
                    label: "نطاق رقابي",
                    title: item.title,
                    subtitle: `${item.details} • ${item.status}`,
                    insight: `مؤشر جاهزية ${item.title} هو ${item.score}%. هذا النطاق مصمم ليكون قابلاً للربط لاحقاً عبر API أو Webhook أو رفع تقارير دورية.`,
                    metrics: item.metrics,
                    reports: item.reports,
                    actions: item.actions,
                    chart: item.title.includes("أراك") ? "bars" : "trend",
                  });
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      <Icon className="text-cyan-300" size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-white">{item.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.details}</div>
                    </div>
                  </div>
                  <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>مؤشر الجاهزية</span>
                  <span className="font-bold text-white">{item.score}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-cyan-300 to-emerald-400"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-white">مركز استقبال التقارير الرقابية</h2>
            <p className="mt-1 text-xs text-slate-500">
              رفع تقارير دورية كمرحلة أولى قبل الربط المباشر مع الأنظمة. يقبل ملفات CSV وExcel وPDF.
            </p>
          </div>
          <UploadCloud className="text-cyan-300" size={24} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <div className="flex items-center gap-3">
                <SelectedReportIcon className="text-cyan-300" size={22} />
                <div>
                  <div className="font-bold text-white">{selectedReportType.label}</div>
                  <div className="text-xs text-cyan-100/60">{selectedReportType.source}</div>
                </div>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs text-slate-500">نوع التقرير</span>
              <select
                value={reportForm.type}
                onChange={(event) => setReportForm({ ...reportForm, type: event.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none focus:border-cyan-400/70"
              >
                {reportTypes.map((type) => (
                  <option key={type.key} value={type.key} className="bg-slate-900">
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs text-slate-500">اسم التقرير</span>
              <input
                value={reportForm.title}
                onChange={(event) => setReportForm({ ...reportForm, title: event.target.value })}
                placeholder="مثال: تقرير حضور شهر يونيو"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none focus:border-cyan-400/70"
              />
            </label>

            <label className="block cursor-pointer rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-400/5 p-5 text-center transition hover:bg-cyan-400/10">
              <FileUp className="mx-auto mb-3 text-cyan-300" size={28} />
              <div className="text-sm font-bold text-white">
                {reportForm.file ? reportForm.file.name : "اختر ملف التقرير"}
              </div>
              <div className="mt-1 text-xs text-slate-500">CSV / Excel / PDF</div>
              <input
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls,.pdf"
                onChange={(event) => setReportForm({ ...reportForm, file: event.target.files?.[0] || null })}
              />
            </label>

            <button
              onClick={submitReport}
              className="w-full rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              رفع التقرير للتحليل
            </button>
          </div>

          <div className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Database className="text-cyan-300" size={18} />
              <h3 className="font-heading font-bold text-white">التقارير المستقبلة</h3>
            </div>

            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() =>
                    openDetail({
                      icon: FileSpreadsheet,
                      label: "تقرير رقابي",
                      title: report.name,
                      subtitle: `${report.type} • ${report.source} • ${report.fileName}`,
                      insight: report.summary,
                      findings: report.findings,
                      actions: report.actions,
                      metrics: [
                        ["الحالة", report.status],
                        ["عدد التنبيهات", String(report.alerts)],
                        ["تاريخ الاستقبال", report.date],
                        ["اسم الملف", report.fileName],
                      ],
                      chart: "bars",
                    })
                  }
                  className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-400/40 hover:bg-white/[0.06] md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="font-bold text-white">{report.name}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {report.type} • {report.source} • {report.date}
                      {report.fileName ? ` • ${report.fileName}` : ""}
                      {report.size ? ` • ${report.size}` : ""}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={report.alerts > 0 ? "amber" : "emerald"}>
                      {report.alerts} تنبيه
                    </Badge>
                    <Badge tone={reportStatusTone(report.status)}>{report.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-white">التنبيهات والاستثناءات</h2>
              <p className="mt-1 text-xs text-slate-500">اضغط على أي تنبيه لعرض سبب التنبيه والأثر والإجراءات</p>
            </div>
            <AlertTriangle className="text-amber-300" size={22} />
          </div>

          <div className="space-y-3">
            {alerts.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  openDetail({
                    icon: AlertTriangle,
                    label: "تنبيه رقابي",
                    title: item.title,
                    subtitle: `${item.source} • ${item.time}`,
                    insight: item.reason,
                    impact: item.impact,
                    actions: item.actions,
                    metrics: [
                      ["درجة الخطورة", item.level],
                      ["الجهة المسؤولة", item.owner],
                      ["وقت الرصد", item.time],
                      ["المصدر", item.source],
                    ],
                    findings: [item.reason, item.impact],
                  })
                }
                className="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-amber-400/40 hover:bg-white/[0.06]"
              >
                <div>
                  <div className="font-bold text-white">{item.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.source} • {item.time}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={levelTone(item.level)}>{item.level}</Badge>
                  <ArrowUpRight className="text-slate-500 group-hover:text-white" size={18} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-white">جاهزية الربط المستقبلي</h2>
              <p className="mt-1 text-xs text-slate-500">اضغط على أي مصدر لمعرفة طريقة الربط المقترحة</p>
            </div>
            <HardDrive className="text-blue-300" size={22} />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              ["Odoo / ERP", "REST API / Scheduled Sync", "جلب أوامر العمل، الأصول، المخزون، الفواتير، وسجلات الصيانة"],
              ["كاميرات المراقبة", "CCTV Gateway / Status API", "البدء بحالة الاتصال والتغطية ثم إضافة التحليل المرئي لاحقاً"],
              ["أنظمة البصمة", "CSV / Database / API", "رفع تقرير يومي ثم الانتقال للربط المباشر"],
              ["أراك لوجستيك", "API / Webhook", "تتبع المركبات والمسارات والوقود والصيانة"],
              ["أراك الحديد", "Production Reports / OEE", "تقارير الإنتاج والجودة والتوقفات"],
              ["إدارة الأصول", "Inventory DB / Excel", "حصر الأجهزة والعتاد والصيانة"],
              ["الشبكة والخوادم", "Ping / SNMP / Agent", "جاهزية الأجهزة والخوادم والنسخ الاحتياطي"],
              ["أنظمة الحضور", "HR Connector", "تحليل الانضباط، التأخر، الغياب، والورديات"],
            ].map(([source, method, description]) => (
              <div
                key={source}
                onClick={() =>
                  openDetail({
                    icon: Network,
                    label: "مصدر تكامل",
                    title: source,
                    subtitle: method,
                    insight: description,
                    metrics: [
                      ["طريقة الربط", method],
                      ["المرحلة الأولى", "رفع تقارير"],
                      ["المرحلة الثانية", "API / Webhook"],
                      ["الحالة", "جاهز للتخطيط"],
                    ],
                    actions: ["إعداد Connector", "تحديد مالك البيانات", "إنشاء نموذج تقرير"],
                  })
                }
                className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-blue-400/40 hover:bg-white/[0.06]"
              >
                <div className="flex items-center gap-2 font-bold text-white">
                  <CheckCircle2 size={16} className="text-emerald-300" />
                  {source}
                </div>
                <div className="mt-2 text-xs text-slate-500">{method}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {cameraPanel && <CameraDetailModal onClose={() => setCameraPanel(false)} />}
      <DetailModal detail={detailPanel} onClose={() => setDetailPanel(null)} />
    </div>
  );
}
