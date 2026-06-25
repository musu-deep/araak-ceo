import axios from "axios";
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.REACT_APP_BACKEND_URL ||
  "http://127.0.0.1:8000";

export const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  withCredentials: false,
});

// Also attach Authorization header if token exists in localStorage (fallback when cookies blocked)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("arak_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export function formatApiError(detail) {
  if (detail == null) return "حدث خطأ غير متوقع";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" • ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export const SECTOR_LABELS = {
  development: "التنمية العامة",
  investment: "الاستثمار",
  arak_development: "أراك التنمية (مصر)",
  academy: "الأكاديمي",
  digital: "التحول الرقمي",
  corporate: "الدعم المؤسسي",
};

export const ROLE_LABELS = {
  admin: "مدير النظام",
  ceo: "الرئيس التنفيذي",
  vp_development: "نائب الرئيس - قطاع التنمية",
  vp_investment: "نائب الرئيس - قطاع الاستثمار",
  dev_manager: "مدير أراك التنمية (مصر)",
  tracker: "مسؤول المتابعة التنفيذية",
};

export const STATUS_LABELS = {
  planning: "تخطيط",
  active: "نشط",
  on_hold: "متوقف",
  completed: "مكتمل",
  cancelled: "ملغى",
  pending: "قيد الانتظار",
  in_progress: "قيد التنفيذ",
  awaiting_approval: "بانتظار الاعتماد",
  delayed: "متأخر",
};

export const PRIORITY_LABELS = {
  low: "منخفض",
  medium: "متوسط",
  high: "مرتفع",
  critical: "حرج",
};
