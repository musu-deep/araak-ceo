import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Send,
  Plus,
  X,
  Inbox,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  FileText,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

export default function MessagesPage() {
  const { user } = useAuth();

  const [msgs, setMsgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState("all");

  const [form, setForm] = useState({
    recipient_id: "",
    subject: "",
    body: "",
    type: "task",
    priority: "normal",
  });

  const currentUserId = Number(user?.id);

  const load = async () => {
    try {
      const [m, u] = await Promise.all([api.get("/messages"), api.get("/users")]);

      setMsgs(m.data || []);
      setUsers((u.data || []).filter((x) => Number(x.id) !== currentUserId));
    } catch {
      toast.error("تعذر تحميل التكليفات");
    }
  };

  useEffect(() => {
    if (user?.id) load();
  }, [user?.id]);

  const submit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        recipient_id: form.recipient_id,
        subject: `[${getTypeLabel(form.type)}] ${form.subject}`,
        body: `الأولوية: ${getPriorityLabel(form.priority)}\n\n${form.body}`,
      };

      await api.post("/messages", payload);

      toast.success("تم إنشاء التكليف");
      setShow(false);
      setForm({
        recipient_id: "",
        subject: "",
        body: "",
        type: "task",
        priority: "normal",
      });
      load();
    } catch {
      toast.error("تعذر إنشاء التكليف");
    }
  };

  const stats = useMemo(() => {
    const incoming = msgs.filter((m) => Number(m.recipient_id) === currentUserId);
    const unread = incoming.filter((m) => !m.read);
    const sent = msgs.filter((m) => Number(m.sender_id) === currentUserId);

    return {
      total: msgs.length,
      incoming: incoming.length,
      unread: unread.length,
      sent: sent.length,
    };
  }, [msgs, currentUserId]);

  const filteredMsgs = useMemo(() => {
    if (filter === "incoming") {
      return msgs.filter((m) => Number(m.recipient_id) === currentUserId);
    }

    if (filter === "sent") {
      return msgs.filter((m) => Number(m.sender_id) === currentUserId);
    }

    if (filter === "unread") {
      return msgs.filter(
        (m) => Number(m.recipient_id) === currentUserId && !m.read
      );
    }

    return msgs;
  }, [msgs, filter, currentUserId]);

  return (
    <div data-testid="messages-page" className="space-y-7">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-yellow-500/80">
            Executive Workflow Center
          </div>
          <h1 className="font-heading text-4xl font-black mt-2">
            مركز التكليفات والمتابعة
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            إدارة الطلبات، التكليفات، الاعتمادات، والمتابعات التنفيذية
          </p>
        </div>

        <button
          onClick={() => setShow(true)}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold flex items-center gap-2"
        >
          <Plus size={18} />
          تكليف جديد
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={<Inbox size={20} />} label="إجمالي العناصر" value={stats.total} />
        <StatCard icon={<UserCheck size={20} />} label="الوارد التنفيذي" value={stats.incoming} />
        <StatCard icon={<AlertTriangle size={20} />} label="غير مقروء" value={stats.unread} />
        <StatCard icon={<CheckCircle2 size={20} />} label="الصادر" value={stats.sent} />
      </div>

      <div className="glass-card p-2 flex flex-wrap gap-2">
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>الكل</FilterButton>
        <FilterButton active={filter === "incoming"} onClick={() => setFilter("incoming")}>الوارد</FilterButton>
        <FilterButton active={filter === "sent"} onClick={() => setFilter("sent")}>الصادر</FilterButton>
        <FilterButton active={filter === "unread"} onClick={() => setFilter("unread")}>غير مقروء</FilterButton>
      </div>

      <div className="space-y-3">
        {filteredMsgs.length === 0 ? (
          <div className="glass-card p-10 text-center text-slate-500">
            لا توجد تكليفات أو متابعات حالياً
          </div>
        ) : (
          filteredMsgs.map((m) => {
            const incoming = Number(m.recipient_id) === currentUserId;
            const recipientName =
              users.find((u) => Number(u.id) === Number(m.recipient_id))?.name || "—";

            return (
              <div
                key={m.id}
                className={`glass-card p-5 transition hover:border-yellow-500/30 ${
                  incoming && !m.read ? "border-yellow-500/40 bg-yellow-500/[0.03]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                      {getMessageIcon(m.subject)}
                    </div>

                    <div>
                      <div className="font-bold text-slate-100">
                        {cleanSubject(m.subject) || "تكليف بدون عنوان"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {incoming ? `من: ${m.sender_name}` : `إلى: ${recipientName}`}
                      </div>
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="text-xs text-slate-500">
                      {new Date(m.created_at).toLocaleString("ar-EG")}
                    </div>
                    <div className="mt-2">
                      <StatusBadge incoming={incoming} read={m.read} />
                    </div>
                  </div>
                </div>

                <div className="text-sm text-slate-300 leading-7 whitespace-pre-wrap border-t border-white/10 pt-3">
                  {m.body}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <ActionChip>تحويل إلى مهمة</ActionChip>
                  <ActionChip>طلب متابعة</ActionChip>
                  <ActionChip>إضافة لاجتماع</ActionChip>
                  <ActionChip>أرشفة</ActionChip>
                </div>
              </div>
            );
          })
        )}
      </div>

      {show && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShow(false)}
        >
          <div
            className="glass-card p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-heading text-xl font-bold">تكليف تنفيذي جديد</h2>
                <p className="text-xs text-slate-500 mt-1">
                  أنشئ طلباً أو متابعة أو اعتماداً موجهاً لأحد أعضاء الفريق
                </p>
              </div>
              <button onClick={() => setShow(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <select
                required
                value={form.recipient_id}
                onChange={(e) => setForm({ ...form, recipient_id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm"
              >
                <option value="">— اختر المسؤول —</option>
                {users.map((u) => (
                  <option key={u.id} value={String(u.id)}>
                    {u.name}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm"
                >
                  <option value="task">تكليف</option>
                  <option value="approval">طلب اعتماد</option>
                  <option value="followup">متابعة</option>
                  <option value="decision">طلب قرار</option>
                  <option value="document">مراجعة وثيقة</option>
                </select>

                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm"
                >
                  <option value="normal">عادي</option>
                  <option value="high">مهم</option>
                  <option value="urgent">عاجل</option>
                </select>
              </div>

              <input
                required
                placeholder="عنوان التكليف"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm"
              />

              <textarea
                required
                placeholder="تفاصيل التكليف أو الطلب"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d14]/80 border border-white/10 text-sm min-h-[140px]"
              />

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-yellow-500 text-black font-bold flex items-center justify-center gap-2"
              >
                <Send size={14} />
                إرسال التكليف
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-yellow-400">{icon}</div>
        <div className="text-2xl font-black text-slate-100">{value}</div>
      </div>
      <div className="text-xs text-slate-500 mt-3">{label}</div>
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm transition ${
        active
          ? "bg-yellow-500 text-black font-bold"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ incoming, read }) {
  if (!incoming) {
    return (
      <span className="text-[11px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-300">
        صادر
      </span>
    );
  }

  if (!read) {
    return (
      <span className="text-[11px] px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-300">
        جديد
      </span>
    );
  }

  return (
    <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300">
      تمت المراجعة
    </span>
  );
}

function ActionChip({ children }) {
  return (
    <button className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-slate-400 hover:bg-yellow-500/10 hover:text-yellow-300 transition">
      {children}
    </button>
  );
}

function getTypeLabel(type) {
  const map = {
    task: "تكليف",
    approval: "طلب اعتماد",
    followup: "متابعة",
    decision: "طلب قرار",
    document: "مراجعة وثيقة",
  };

  return map[type] || "تكليف";
}

function getPriorityLabel(priority) {
  const map = {
    normal: "عادي",
    high: "مهم",
    urgent: "عاجل",
  };

  return map[priority] || "عادي";
}

function cleanSubject(subject = "") {
  return subject.replace(/^\[[^\]]+\]\s*/, "");
}

function getMessageIcon(subject = "") {
  if (subject.includes("اعتماد")) return <CheckCircle2 size={18} />;
  if (subject.includes("متابعة")) return <Clock size={18} />;
  if (subject.includes("قرار")) return <AlertTriangle size={18} />;
  if (subject.includes("وثيقة")) return <FileText size={18} />;
  return <MessageSquare size={18} />;
}