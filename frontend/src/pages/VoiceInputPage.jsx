import React, { useEffect, useRef, useState } from "react";
import api from "../lib/api";
import { Mic, Square, Send, CheckCircle2, Wand2 } from "lucide-react";
import { toast } from "sonner";

export default function VoiceInputPage() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [directive, setDirective] = useState(null);
  const [selected, setSelected] = useState({});
  const [users, setUsers] = useState([]);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => { api.get("/users").then(r => setUsers(r.data)); }, []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          setProcessing(true);
          try {
            const res = await api.post("/voice/transcribe", { audio_base64: reader.result, mime: "audio/webm" });
            setDirective(res.data);
            const sel = {};
            (res.data.suggested_tasks || []).forEach((_, i) => sel[i] = true);
            setSelected(sel);
            toast.success("تم تحليل المذكرة الصوتية");
          } catch (e) { toast.error("تعذر التحليل: " + (e?.response?.data?.detail || "")); }
          finally { setProcessing(false); }
        };
        reader.readAsDataURL(blob);
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
    } catch { toast.error("تعذر الوصول للميكروفون"); }
  };

  const stop = () => { mediaRef.current?.stop(); setRecording(false); };

  const apply = async () => {
    const tasks = (directive.suggested_tasks || []).filter((_, i) => selected[i]);
    if (tasks.length === 0) return toast.error("اختر مهمة واحدة على الأقل");
    try { const r = await api.post("/voice/apply", { directive_id: directive.id, selected_tasks: tasks }); toast.success(`تم إنشاء ${r.data.created} مهمة`); setDirective(null); }
    catch { toast.error("تعذر التطبيق"); }
  };

  return (
    <div data-testid="voice-page" className="max-w-4xl mx-auto">
      <div className="mb-7">
        <div className="text-xs uppercase tracking-[0.3em] text-yellow-500/80">الإدخال الذكي</div>
        <h1 className="font-heading text-4xl font-black mt-2 flex items-center gap-3"><Wand2 className="text-yellow-500"/> الوكيل الصوتي</h1>
        <p className="text-slate-500 text-sm mt-1">سجّل توجيهاتك صوتياً ودع الذكاء الاصطناعي يحوّلها لمهام موزعة على فريقك</p>
      </div>

      <div className="glass-card p-8 text-center">
        <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all ${recording ? "bg-rose-500/20 border-2 border-rose-500 animate-pulse" : "bg-yellow-500/10 border-2 border-yellow-500/30 hover:bg-yellow-500/15"}`}>
          <button onClick={recording ? stop : start} disabled={processing} className="w-full h-full flex items-center justify-center">
            {recording ? <Square size={48} className="text-rose-400"/> : <Mic size={48} className="text-yellow-400"/>}
          </button>
        </div>
        <div className="mt-5 text-lg font-heading font-bold">
          {processing ? "جاري التحليل بالذكاء الاصطناعي..." : recording ? "جاري التسجيل... اضغط للإيقاف" : "اضغط لبدء المحادثة"}
        </div>
        <div className="text-xs text-slate-500 mt-2">يستخدم Whisper للنسخ + Claude لاستخراج المهام وتوزيعها</div>
      </div>

      {directive && (
        <div className="mt-6 glass-card p-6" data-testid="directive-result">
          <h3 className="font-heading text-xl font-bold mb-3">نتيجة التحليل</h3>
          <div className="bg-white/[0.02] rounded-lg p-4 mb-4">
            <div className="text-xs text-slate-500 mb-1">النص المنطوق:</div>
            <p className="text-sm text-slate-200 leading-relaxed">{directive.transcript}</p>
          </div>
          {directive.summary && <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 mb-4">
            <div className="text-xs text-yellow-500 mb-1">الملخص:</div>
            <p className="text-sm text-slate-200">{directive.summary}</p>
          </div>}

          {directive.suggested_tasks?.length > 0 ? (
            <>
              <h4 className="font-heading font-bold mb-3">المهام المقترحة ({directive.suggested_tasks.length}):</h4>
              <div className="space-y-2 mb-4">
                {directive.suggested_tasks.map((t, i) => {
                  const user = users.find(u => u.id === t.assignee_id);
                  return (
                    <label key={i} className="flex items-start gap-3 p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-yellow-500/30 cursor-pointer">
                      <input type="checkbox" checked={!!selected[i]} onChange={e => setSelected({...selected, [i]: e.target.checked})} className="mt-1"/>
                      <div className="flex-1">
                        <div className="font-medium text-slate-100">{t.title}</div>
                        <div className="text-xs text-slate-400 mt-1">{t.description}</div>
                        <div className="text-xs text-slate-500 mt-2 flex flex-wrap gap-3">
                          <span>المسؤول: {user?.name || "غير محدد"}</span>
                          <span>الأولوية: {t.priority}</span>
                          <span>القطاع: {t.sector}</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              <button onClick={apply} className="w-full py-3 rounded-lg bg-yellow-500 text-black font-bold flex items-center justify-center gap-2"><CheckCircle2 size={16}/> تطبيق المهام المختارة</button>
            </>
          ) : <div className="text-center text-slate-500 py-4">لم يتم استخراج مهام من هذا التسجيل</div>}
        </div>
      )}
    </div>
  );
}
