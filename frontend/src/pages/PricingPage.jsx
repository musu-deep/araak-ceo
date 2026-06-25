import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import {
  Calculator,
  TrendingUp,
  Target,
  AlertTriangle,
  Coins,
  BrainCircuit,
  Database,
  FileText,
  Send,
} from "lucide-react";

const TABS = [
  ["cost", Calculator, "تحليل التكلفة"],
  ["price", TrendingUp, "تقدير السعر"],
  ["win", Target, "احتمالية الفوز"],
  ["risk", AlertTriangle, "تحليل المخاطر"],
  ["profit", Coins, "سيناريوهات الربحية"],
  ["ai", BrainCircuit, "توصيات الذكاء الاصطناعي"],
  ["memory", Database, "ذاكرة التسعير"],
  ["proposal", FileText, "إصدار عرض السعر"],
];

const TAB_CONTENT = {
  cost: {
    title: "تحليل التكلفة",
    prompt:
      "حلّل التكلفة التفصيلية للمشروع: العمالة، المواد، التشغيل، النقل، الإدارة، والاحتياطيات.",
  },
  price: {
    title: "تقدير السعر",
    prompt:
      "اقترح السعر المناسب بناءً على التكلفة، السوق، هامش الربح، وطبيعة العميل.",
  },
  win: {
    title: "احتمالية الفوز بالمنافسة",
    prompt:
      "قدّر احتمالية الفوز بالمشروع بناءً على السعر، المنافسين، قوة العرض، وسجل المؤسسة.",
  },
  risk: {
    title: "تحليل المخاطر",
    prompt:
      "استخرج مخاطر التسعير والتنفيذ والتوريد والتأخير والتغيرات المحتملة في السوق.",
  },
  profit: {
    title: "سيناريوهات الربحية",
    prompt:
      "أنشئ سيناريوهات ربحية متعددة: تحفظي، متوسط، هجومي، واستراتيجي.",
  },
  ai: {
    title: "توصيات الذكاء الاصطناعي",
    prompt:
      "قدّم توصية تنفيذية واضحة للرئيس التنفيذي: السعر الأنسب، سبب الاختيار، والقرار المقترح.",
  },
  memory: {
    title: "ذاكرة التسعير",
    prompt:
      "قارن المشروع بالمشاريع السابقة، واستخرج أنماط الفوز والخسارة والربحية المتوقعة.",
  },
  proposal: {
    title: "إصدار عرض السعر",
    prompt:
      "حوّل نتائج التسعير إلى عرض سعر تنفيذي مختصر ومنظم قابل للمراجعة والاعتماد.",
  },
};

export default function PricingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("cost");
  const [projectText, setProjectText] = useState("");
  const [agentAnswer, setAgentAnswer] = useState("");
  const [loadingAgent, setLoadingAgent] = useState(false);

  if (!user || !["ceo", "admin"].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const active = TAB_CONTENT[activeTab];

  const runLocalAgent = async () => {
    setLoadingAgent(true);
    setAgentAnswer("");

    try {
      const res = await api.post("/pricing/agent", {
        axis: active.title,
        project_text: projectText || "لم يتم إدخال وصف تفصيلي للمشروع.",
        instruction: active.prompt,
      });

      setAgentAnswer(res.data.answer || "لم يتم توليد نتيجة من الوكيل.");
    } catch (error) {
      setAgentAnswer(
        "تعذر الاتصال بوكيل التسعير المحلي. تأكد من تشغيل الباكند وربط مسار /api/pricing/agent."
      );
    } finally {
      setLoadingAgent(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen text-white">
      <div className="mb-8">
        <p className="text-yellow-500 text-sm mb-2">منهجية المشاريع</p>
        <h1 className="text-4xl font-bold">مركز ذكاء التسعير</h1>
        <p className="text-slate-400 mt-2">
          وكيل محلي لتحليل التسعير عبر ثمانية محاور تنفيذية: التكلفة، السعر،
          الفوز، المخاطر، الربحية، التوصيات، الذاكرة، وإصدار العرض.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          ["التكلفة المقدرة", "2,430,000"],
          ["السعر المقترح", "2,980,000"],
          ["هامش الربح", "18%"],
          ["احتمال الفوز", "84%"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-800 bg-[#101622] p-5"
          >
            <p className="text-slate-400 text-sm">{label}</p>
            <h2 className="text-2xl font-bold mt-3 text-yellow-400">
              {value}
            </h2>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-[#101622] p-4">
          <h2 className="font-bold mb-4">محاور منهجية التسعير</h2>

          <div className="space-y-2">
            {TABS.map(([key, Icon, label]) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  setAgentAnswer("");
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  activeTab === key
                    ? "bg-yellow-500/10 text-yellow-300 border border-yellow-500/30"
                    : "bg-[#070B12] text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-[#101622] p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-bold">{active.title}</h2>
            <p className="text-slate-400 mt-2 text-sm">{active.prompt}</p>
          </div>

          <textarea
            value={projectText}
            onChange={(e) => setProjectText(e.target.value)}
            className="w-full h-36 rounded-xl bg-[#070B12] border border-slate-700 p-4 outline-none focus:border-yellow-500 text-sm"
            placeholder="اكتب وصف المشروع هنا... مثال: تسعير مشروع إنشاء مركز صحي في جدة بمساحة 5000 متر"
          />

          <button
            onClick={runLocalAgent}
            disabled={loadingAgent}
            className="mt-4 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2"
          >
            <Send size={18} />
            {loadingAgent ? "الوكيل يعمل..." : "اسأل وكيل التسعير المحلي"}
          </button>

          {loadingAgent && (
            <div className="mt-6 rounded-xl bg-[#070B12] border border-yellow-500/20 p-5 text-yellow-400">
              الوكيل المحلي يعمل الآن على تحليل محور: {active.title}
            </div>
          )}

          {agentAnswer && (
            <div className="mt-6 rounded-xl bg-[#070B12] border border-yellow-500/20 p-5">
              <p className="text-yellow-400 font-bold mb-3">
                نتيجة وكيل التسعير المحلي:
              </p>
              <pre className="whitespace-pre-wrap text-sm text-slate-300 leading-7">
                {agentAnswer}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}