import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatApiError } from "../lib/api";
import { toast } from "sonner";
import { Shield, ChevronLeft, Building2 } from "lucide-react";
import ARAK_LOGO from "../assets/Araak_logo1.png";


const ROLE_QUICK = [
  { email: "ceo@arak.com", label: "الرئيس التنفيذي", role: "ceo" },
  { email: "vp.dev@arak.com", label: "نائب الرئيس - التنمية", role: "vp_development" },
  { email: "vp.invest@arak.com", label: "نائب الرئيس - الاستثمار", role: "vp_investment" },
  { email: "dev.manager@arak.com", label: "مدير أراك التنمية - مصر", role: "dev_manager" },
  { email: "tracker@arak.com", label: "مسؤول المتابعة التنفيذية", role: "tracker" },
  { email: "admin@arak.com", label: "مدير النظام", role: "admin" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Arak@2026");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("مرحباً بك في منصة المتابعة التنفيذية");
      navigate("/dashboard");
    } catch (e) {
      const msg = formatApiError(e?.response?.data?.detail) || "تعذر تسجيل الدخول";
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1710438399422-2fca27686bcd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGVsZWdhbnQlMjBkYXJrJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3ODEwMDA2NDh8MA&ixlib=rb-4.1.0&q=85')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-[#0a0d14]/85 to-black/70" />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(circle at 80% 20%, rgba(212,175,55,0.08), transparent 50%)"
      }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Brand */}
        <div className="hidden lg:block text-right space-y-7">
          <img src={ARAK_LOGO} alt="مجموعة أراك للتنمية" className="h-44 w-auto object-contain mb-2" />
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-xs uppercase tracking-[0.25em]">
            <Building2 size={14} />
            <span>منصة المتابعة التنفيذية</span>
          </div>
          <div>
            <h1 className="font-heading font-black text-5xl text-slate-50 leading-tight">
              مكتب الرئيس <span className="gold-text">التنفيذي</span>
            </h1>
            <p className="mt-4 text-lg text-slate-400 leading-relaxed max-w-md mr-auto">
              منظومة متكاملة لإدارة المشاريع والمهام ومتابعة مؤشرات الأداء عبر قطاعات المجموعة.
            </p>
          </div>
          <div className="gold-divider"></div>
          <div className="grid grid-cols-3 gap-4 text-right">
            {[
              { v: "RAG", l: "مؤشر الحالة" },
              { v: "KPIs", l: "قياس الأداء" },
              { v: "RTL", l: "واجهة عربية" },
            ].map((s) => (
              <div key={s.v} className="glass-card p-4 text-center">
                <div className="font-heading text-yellow-400 font-bold text-xl">{s.v}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 md:p-10 max-w-md w-full mx-auto" data-testid="login-card">
          <div className="text-center mb-8">
            <img src={ARAK_LOGO} alt="مجموعة أراك" className="h-20 w-auto object-contain mx-auto mb-4 lg:hidden" />
            <h2 className="font-heading text-2xl font-bold text-slate-50">تسجيل الدخول</h2>
            <p className="text-sm text-slate-500 mt-2">الوصول الآمن لمنصة المتابعة التنفيذية</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">البريد الإلكتروني</label>
              <input
                data-testid="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@arak.com"
                className="w-full px-4 py-3 rounded-lg bg-[#0a0d14]/80 border border-white/10 focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 text-slate-100 placeholder-slate-600 transition-colors"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">كلمة المرور</label>
              <input
                data-testid="login-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#0a0d14]/80 border border-white/10 focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 text-slate-100 placeholder-slate-600 transition-colors"
              />
            </div>

            {err && (
              <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3">
                {err}
              </div>
            )}

            <button
              data-testid="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg shadow-yellow-900/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "جاري التحقق..." : (
                <>
                  دخول المنصة
                  <ChevronLeft size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick role selection */}
          <div className="mt-7 pt-6 border-t border-white/5">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
              <Shield size={12} />
              حسابات الدخول السريع
            </div>
            <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
              {ROLE_QUICK.map((r) => (
                <button
                  key={r.email}
                  type="button"
                  data-testid={`quick-login-${r.role}`}
                  onClick={() => { setEmail(r.email); setPassword("Arak@2026"); }}
                  className="text-right px-3 py-2 rounded-md text-xs bg-white/[0.02] hover:bg-yellow-500/5 hover:border-yellow-500/20 border border-white/5 text-slate-300 transition-colors flex items-center justify-between gap-2"
                >
                  <span className="font-medium">{r.label}</span>
                  <span className="text-slate-500 text-[10px] tabular-nums" dir="ltr">{r.email}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 text-[10px] text-slate-600 text-center">
              كلمة المرور الموحدة للتجربة: <span className="text-yellow-500 font-bold tabular-nums" dir="ltr">Arak@2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
