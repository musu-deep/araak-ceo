import React from "react";
import {
  BrainCircuit,
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  Scale,
  Landmark,
  BriefcaseBusiness,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Clock3,
  Database,
  Mic,
  Search,
  MessageSquareText,
  Network,
  Lock,
  Activity,
  Zap,
  ClipboardCheck,
  UserRoundCog,
  BarChart3,
  Gauge,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const attentionItems = [
  {
    title: "مشروع أراك الحديد يحتاج مراجعة تشغيلية",
    type: "تشغيلي",
    level: "مرتفع",
    source: "الرقابة والتفتيش",
    summary: "انخفاض إنتاجية خط 2 بنسبة 18% مع 3 توقفات هذا الأسبوع.",
    recommendation: "تشكيل متابعة مشتركة بين التشغيل والصيانة والرقابة خلال 24 ساعة.",
  },
  {
    title: "عقد خدمات لوجستية يحتوي بند مخاطر",
    type: "قانوني",
    level: "حرج",
    source: "الشؤون القانونية",
    summary: "بند مسؤولية مفتوح دون سقف تعويض واضح.",
    recommendation: "إحالته للمراجعة القانونية قبل الاعتماد النهائي.",
  },
  {
    title: "طلبات لقاء متراكمة مع الرئيس التنفيذي",
    type: "سكرتارية",
    level: "متوسط",
    source: "السكرتارية التنفيذية",
    summary: "9 طلبات لقاء، 5 منها عاجلة، واثنان يمكن دمجهما.",
    recommendation: "إعادة ترتيب جدول الأسبوع حسب الأولوية التنفيذية.",
  },
];

const agents = [
  {
    key: "executive",
    name: "المستشار التنفيذي",
    role: "Chief of Staff AI",
    icon: BriefcaseBusiness,
    tone: "cyan",
    description: "يربط المشاريع والمهام والاجتماعات والمخاطر ويقترح أولويات الرئيس التنفيذي.",
    prompts: ["ما الذي يحتاج انتباهي هذا الأسبوع؟", "رتب لي أهم 5 أولويات تنفيذية", "ما القرارات المتأخرة؟"],
  },
  {
    key: "legal",
    name: "المستشار القانوني",
    role: "Legal AI",
    icon: Scale,
    tone: "violet",
    description: "يراجع العقود والقضايا والمذكرات ويستخرج البنود عالية المخاطر.",
    prompts: ["افحص مخاطر العقود المفتوحة", "ما القضايا عالية الخطورة؟", "لخص لي الالتزامات القانونية"],
  },
  {
    key: "finance",
    name: "المستشار المالي",
    role: "Finance AI",
    icon: Landmark,
    tone: "emerald",
    description: "يقرأ الميزانيات والتدفقات والالتزامات ومؤشرات الإنفاق.",
    prompts: ["ما المشاريع الأعلى إنفاقاً؟", "أين توجد فجوة مالية؟", "اقترح تخفيضات دون أثر تشغيلي"],
  },
  {
    key: "audit",
    name: "مستشار الرقابة",
    role: "Audit AI",
    icon: ShieldCheck,
    tone: "amber",
    description: "يتابع الالتزام، الكاميرات، البصمة، الشبكة، الأصول، والإنتاج.",
    prompts: ["ما أخطر تنبيه رقابي؟", "حلل جاهزية الكاميرات", "ما الأصول التي تحتاج صيانة؟"],
  },
  {
    key: "strategy",
    name: "مستشار الاستراتيجية",
    role: "Strategy AI",
    icon: BarChart3,
    tone: "blue",
    description: "يربط الأداء بالمبادرات والخطة الاستراتيجية ومؤشرات التقدم.",
    prompts: ["ما الانحراف عن الخطة؟", "ما المبادرات الأعلى أثراً؟", "اقترح مسار تصحيح"],
  },
];

const intelligenceScore = [
  { subject: "المشاريع", value: 82 },
  { subject: "الرقابة", value: 91 },
  { subject: "القانونية", value: 74 },
  { subject: "المالية", value: 78 },
  { subject: "السكرتارية", value: 86 },
  { subject: "الاستراتيجية", value: 80 },
];

const pulseData = [
  { day: "الأحد", risk: 42, decisions: 8, actions: 19 },
  { day: "الاثنين", risk: 36, decisions: 11, actions: 23 },
  { day: "الثلاثاء", risk: 51, decisions: 7, actions: 18 },
  { day: "الأربعاء", risk: 39, decisions: 13, actions: 26 },
  { day: "الخميس", risk: 31, decisions: 16, actions: 29 },
];

const knowledgeSources = [
  { name: "المشاريع والمهام", status: "متصل تجريبياً", items: 148, icon: BriefcaseBusiness },
  { name: "الرقابة والتفتيش", status: "بيانات تشغيلية", items: 64, icon: ShieldCheck },
  { name: "الشؤون القانونية", status: "عقود وقضايا", items: 37, icon: Scale },
  { name: "السكرتارية التنفيذية", status: "اجتماعات وتكليفات", items: 52, icon: ClipboardCheck },
  { name: "الأرشيف والوثائق", status: "جاهز للفهرسة", items: 230, icon: FileText },
  { name: "التكاملات المستقبلية", status: "Odoo / ERP / Logistics", items: 8, icon: Network },
];

const starterMessages = [
  {
    sender: "assistant",
    text: "مرحباً، أنا المستشار الذكي المحلي لمكتب الرئيس التنفيذي. أستطيع قراءة المؤشرات، ربط المخاطر، واقتراح قرارات تنفيذية قابلة للإجراء.",
    meta: "Local Executive AI",
  },
  {
    sender: "assistant",
    text: "أهم ما يحتاج الانتباه الآن: تنبيه رقابي في أراك الحديد، عقد لوجستي عالي المخاطر، وطلبات لقاء تحتاج إعادة ترتيب.",
    meta: "Executive Brief",
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
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    slate: "bg-slate-500/10 text-slate-300 border-white/10",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
}

function levelTone(level) {
  if (level === "حرج") return "rose";
  if (level === "مرتفع") return "amber";
  return "blue";
}

function AgentOrb({ activeAgent }) {
  const Icon = activeAgent.icon;
  return (
    <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-slate-950 via-cyan-950/60 to-violet-950/60">
      <div className="absolute h-52 w-52 animate-pulse rounded-full bg-cyan-400/10 blur-2xl" />
      <div className="absolute h-72 w-72 rounded-full border border-cyan-400/10" />
      <div className="absolute h-52 w-52 rounded-full border border-violet-400/10" />
      <div className="absolute h-32 w-32 rounded-full border border-amber-400/10" />

      <div className="relative z-10 text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-cyan-400/30 bg-cyan-400/10 shadow-2xl shadow-cyan-500/20">
          <Icon className="text-cyan-200" size={42} />
        </div>
        <div className="font-heading text-xl font-black text-white">{activeAgent.name}</div>
        <div className="mt-1 text-xs uppercase tracking-[0.25em] text-cyan-200/70">{activeAgent.role}</div>
      </div>
    </div>
  );
}

function DetailModal({ detail, onClose }) {
  if (!detail) return null;
  const Icon = detail.icon || BrainCircuit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-slate-950/95 p-6 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
              <Icon className="text-cyan-300" size={26} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">{detail.label || "AI Insight"}</div>
              <h2 className="mt-2 font-heading text-2xl font-black text-white">{detail.title}</h2>
              {detail.subtitle && <p className="mt-2 text-sm leading-7 text-slate-400">{detail.subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {detail.summary && (
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
              <div className="mb-2 flex items-center gap-2 font-bold text-cyan-200">
                <Sparkles size={18} />
                خلاصة المستشار
              </div>
              <p className="text-sm leading-7 text-cyan-50/80">{detail.summary}</p>
            </div>
          )}

          {detail.items?.length > 0 && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {detail.items.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
                  <CheckCircle2 className="mb-3 text-emerald-300" size={18} />
                  {item}
                </div>
              ))}
            </div>
          )}

          {detail.actions?.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <h3 className="mb-4 font-heading font-bold text-white">إجراءات مقترحة</h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {detail.actions.map((action) => (
                  <button key={action} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-right text-sm font-bold text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10">
                    <ArrowUpRight className="ml-2 inline text-cyan-300" size={15} />
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdvisorPage() {
  const [activeAgentKey, setActiveAgentKey] = React.useState("executive");
  const [messages, setMessages] = React.useState(starterMessages);
  const [prompt, setPrompt] = React.useState("");
  const [detailPanel, setDetailPanel] = React.useState(null);

  const activeAgent = agents.find((agent) => agent.key === activeAgentKey) || agents[0];

  const simulateAnswer = (text) => {
    const lower = text.toLowerCase();

    if (lower.includes("قانون") || lower.includes("عقد")) {
      return "قراءة قانونية أولية: توجد أولوية لمراجعة عقد الخدمات اللوجستية بسبب بند مسؤولية مفتوح. أوصي بإحالته للشؤون القانونية قبل أي اعتماد.";
    }

    if (lower.includes("رقابة") || lower.includes("كاميرا") || lower.includes("تفتيش")) {
      return "قراءة رقابية: أعلى مخاطر حالية في الكاميرات وأراك الحديد. توجد كاميرا غير متصلة وانخفاض في إنتاجية خط 2. أوصي بفتح متابعة تشغيلية خلال 24 ساعة.";
    }

    if (lower.includes("مالي") || lower.includes("ميزانية") || lower.includes("تكلفة")) {
      return "قراءة مالية: لا توجد أزمة فورية، لكن هناك مؤشرات ضغط في بنود التشغيل والصيانة. أوصي بمراجعة تكلفة التوقفات في أراك الحديد واللوجستيك.";
    }

    return "الخلاصة التنفيذية: أهم ثلاث أولويات الآن هي معالجة تنبيه أراك الحديد، مراجعة العقد اللوجستي عالي المخاطر، وإعادة ترتيب طلبات اللقاء العاجلة للرئيس التنفيذي.";
  };

  const sendMessage = () => {
    if (!prompt.trim()) return;
    const userMessage = { sender: "user", text: prompt.trim(), meta: "أنت" };
    const assistantMessage = {
      sender: "assistant",
      text: simulateAnswer(prompt),
      meta: activeAgent.name,
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setPrompt("");
  };

  const useSuggestedPrompt = (text) => {
    setPrompt(text);
  };

  return (
    <div dir="rtl" className="space-y-6 pb-28">
      <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-cyan-950 to-violet-950 p-7 shadow-2xl">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-1/3 top-0 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-200">
              <BrainCircuit size={15} />
              Local Executive Intelligence Agent
            </div>
            <h1 className="font-heading text-4xl font-black text-white">
              مركز الذكاء التنفيذي
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
              مستشار رقمي محلي لمكتب الرئيس التنفيذي: يقرأ المؤشرات، يربط المخاطر، يحلل القرارات، ويقترح إجراءات تنفيذية قابلة للتحويل إلى متابعة أو اعتماد أو تقرير.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <button className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-500/20">
              <Mic size={16} className="ml-2 inline" />
              أمر صوتي
            </button>
            <button className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold text-white hover:bg-white/15">
              <Search size={16} className="ml-2 inline" />
              بحث معرفي
            </button>
            <button className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold text-white hover:bg-white/15">
              <FileText size={16} className="ml-2 inline" />
              تقرير ذكي
            </button>
            <button className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold text-white hover:bg-white/15">
              <Lock size={16} className="ml-2 inline" />
              محلي وآمن
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        <div className="xl:col-span-1 space-y-4">
          <AgentOrb activeAgent={activeAgent} />

          <Card className="p-4">
            <div className="mb-4 flex items-center gap-2">
              <Bot className="text-cyan-300" size={20} />
              <h2 className="font-heading font-bold text-white">الوكلاء المتخصصون</h2>
            </div>

            <div className="space-y-2">
              {agents.map((agent) => {
                const Icon = agent.icon;
                const active = agent.key === activeAgentKey;
                return (
                  <button
                    key={agent.key}
                    onClick={() => setActiveAgentKey(agent.key)}
                    className={`w-full rounded-2xl border p-4 text-right transition ${
                      active
                        ? "border-cyan-400/40 bg-cyan-400/10"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={active ? "text-cyan-300" : "text-slate-500"} size={19} />
                      <div>
                        <div className="font-bold text-white">{agent.name}</div>
                        <div className="mt-1 text-xs text-slate-500">{agent.role}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="xl:col-span-2">
          <Card className="flex h-[760px] flex-col overflow-hidden">
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-xl font-black text-white">جلسة المستشار الذكي</h2>
                  <p className="mt-1 text-xs text-slate-500">المستشار النشط: {activeAgent.name}</p>
                </div>
                <Badge tone="cyan">Local Mode</Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {activeAgent.prompts.map((item) => (
                  <button
                    key={item}
                    onClick={() => useSuggestedPrompt(item)}
                    className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.sender === "user" ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[82%] rounded-3xl border p-4 ${
                      message.sender === "user"
                        ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-50"
                        : "border-white/10 bg-white/[0.045] text-slate-100"
                    }`}
                  >
                    <div className="mb-2 text-xs font-bold text-slate-400">{message.meta}</div>
                    <div className="text-sm leading-7">{message.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="flex gap-3">
                <input
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && sendMessage()}
                  placeholder="اسأل المستشار: ما الذي يحتاج انتباهي هذا الأسبوع؟"
                  className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none focus:border-cyan-400/60"
                />
                <button
                  onClick={sendMessage}
                  className="rounded-2xl bg-cyan-400 px-5 py-4 font-bold text-slate-950 transition hover:bg-cyan-300"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </Card>
        </div>

        <div className="xl:col-span-1 space-y-5">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Zap className="text-amber-300" size={20} />
              <h2 className="font-heading font-bold text-white">ما الذي يحتاج انتباهي؟</h2>
            </div>

            <div className="space-y-3">
              {attentionItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() =>
                    setDetailPanel({
                      icon: AlertTriangle,
                      label: item.type,
                      title: item.title,
                      subtitle: `${item.source} • ${item.level}`,
                      summary: item.summary,
                      items: [item.recommendation, "يمكن تحويل التوصية إلى متابعة تنفيذية أو طلب تقرير."],
                      actions: ["اعتماد التوصية", "إحالة للقطاع المختص", "طلب تقرير تفصيلي", "إنشاء متابعة"],
                    })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-right transition hover:border-amber-400/40 hover:bg-white/[0.06]"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Badge tone={levelTone(item.level)}>{item.level}</Badge>
                    <ArrowUpRight className="text-slate-500" size={17} />
                  </div>
                  <div className="font-bold text-white">{item.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.source}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Database className="text-blue-300" size={20} />
              <h2 className="font-heading font-bold text-white">مصادر المعرفة</h2>
            </div>

            <div className="space-y-3">
              {knowledgeSources.map((source) => {
                const Icon = source.icon;
                return (
                  <div key={source.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-3">
                      <Icon className="text-cyan-300" size={18} />
                      <div className="flex-1">
                        <div className="font-bold text-white">{source.name}</div>
                        <div className="mt-1 text-xs text-slate-500">{source.status}</div>
                      </div>
                      <div className="text-sm font-black text-white">{source.items}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-white">نبض القرار التنفيذي</h2>
              <p className="mt-1 text-xs text-slate-500">المخاطر، القرارات، والإجراءات خلال الأسبوع</p>
            </div>
            <Badge tone="cyan">Decision Pulse</Badge>
          </div>
          <div className="h-72 min-h-[288px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pulseData}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="risk" stroke="#fb7185" fill="#fb718533" />
                <Area type="monotone" dataKey="decisions" stroke="#38bdf8" fill="#38bdf833" />
                <Area type="monotone" dataKey="actions" stroke="#22c55e" fill="#22c55e33" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-white">توازن المعرفة</h2>
              <p className="mt-1 text-xs text-slate-500">مدى تغطية المستشار لمجالات المكتب</p>
            </div>
            <Gauge className="text-cyan-300" size={22} />
          </div>
          <div className="h-72 min-h-[288px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={intelligenceScore}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
                <Radar name="coverage" dataKey="value" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { title: "اعتماد توصية", icon: CheckCircle2 },
          { title: "إحالة لقطاع", icon: UserRoundCog },
          { title: "طلب تقرير", icon: FileText },
          { title: "إنشاء متابعة", icon: Activity },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.title}
              onClick={() =>
                setDetailPanel({
                  icon: action.icon,
                  label: "إجراء تنفيذي",
                  title: action.title,
                  summary: "هذا إجراء تجريبي يمكن ربطه لاحقاً بنظام المهام والاعتمادات وسجل القرارات.",
                  actions: ["تنفيذ الآن", "حفظ كمسودة", "إرساله للمتابعة"],
                })
              }
              className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 text-right font-bold text-white transition hover:border-cyan-400/40 hover:bg-white/[0.08]"
            >
              <Icon className="mb-4 text-cyan-300" size={24} />
              {action.title}
            </button>
          );
        })}
      </div>

      <DetailModal detail={detailPanel} onClose={() => setDetailPanel(null)} />
    </div>
  );
}
