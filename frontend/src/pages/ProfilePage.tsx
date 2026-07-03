import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  User as UserIcon,
  ShoppingBag,
  Lock,
  Edit3,
  Loader2,
  Calendar,
  Phone,
  FileText,
  Upload,
  CheckCircle2,
  X,
  FileType2,
} from "lucide-react";
import axiosClient from "@/api/apiClient";
import { toast } from "sonner";

// ── Client-side .docx → HTML (mammoth is installed in the frontend) ─
import mammoth from "mammoth";

interface Order {
  _id: string;
  status: string;
  subtotal: number;
  items: Array<{ name: string; qty: number; price: number }>;
  createdAt: string;
}

const DEFAULT_ADMIN_EMAIL = "admin@eltanany.com";

// ── Status badge ──────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    processing: "bg-purple-500/15 text-purple-400 border-purple-500/20",
    shipped: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
    delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
        colors[status] || "bg-zinc-500/15 text-zinc-400 border-zinc-500/20"
      }`}
    >
      {status}
    </span>
  );
}

/** Convert .docx → HTML in the browser, then POST the HTML string. */
async function uploadPriceList(
  file: File
): Promise<{ fileName: string; htmlContent: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;
  const res = await axiosClient.post("/admin/settings/price-list", {
    fileName: file.name,
    htmlContent: html,
  });
  return res.data.data;
}

// ── Admin Upload Card ──────────────────────────────────────
function AdminPriceListUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0); // prevent spurious mouseleave events

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedFile(e.target.files?.[0] ?? null);
    },
    []
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items?.length) setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      dragCounter.current = 0;
      const file = e.dataTransfer.files?.[0];
      if (file) setSelectedFile(file);
    },
    []
  );

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Guard: docx is a ZIP — fast header check
    const header = new Uint8Array(
      await selectedFile.slice(0, 4).arrayBuffer()
    );
    if (header[0] !== 0x50 || header[1] !== 0x4b) {
      toast.error("صيغة الملف غير مدعومة — يرجى اختيار ملف .docx");
      return;
    }

    setIsUploading(true);
    try {
      const data = await uploadPriceList(selectedFile);
      setFileName(data.fileName);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("تم تحويل الملف وحفظ قائمة الأسعار بنجاح");
    } catch (err: any) {
      toast.error(err?.message || "فشل حفظ قائمة الأسعار");
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <FileType2 className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-white text-base">
            رفع قائمة الأسعار
          </h3>
          <p className="text-zinc-500 text-xs mt-0.5">
            ارفع ملف Word (.docx) — يتحول تلقائياً في المتصفح
          </p>
        </div>
      </div>

      {/* ── Dropzone / File Input ─────────────────── */}
      <label
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`
          relative block mt-4 rounded-xl border-2 border-dashed
          transition-all duration-200 ease-out cursor-pointer
          ${
            isDragOver
              ? "border-amber-500/60 bg-[#1c1c21] scale-[1.01]"
              : "border-zinc-700 bg-[#161619] hover:border-amber-500/40 hover:bg-[#1c1c21]"
          }
          ${selectedFile || isUploading ? "opacity-60 pointer-events-none" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
          {/* Upload icon */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 ${
              isDragOver ? "bg-amber-500/15" : "bg-zinc-800"
            }`}
          >
            {isDragOver ? (
              <FileText className="w-6 h-6 text-amber-500" />
            ) : (
              <Upload className="w-6 h-6 text-zinc-500" />
            )}
          </div>

          {/* Text */}
          <div>
            <p className="font-body font-semibold text-zinc-300 text-sm">
              {isDragOver
                ? "أفلت الملف هنا…"
                : "اضغط لاختيار ملف أو اسحبه هنا"}
            </p>
            <p className="font-body text-zinc-600 text-xs mt-1">
              صيغة .docx فقط — حد أقصى 16 ميجابايت
            </p>
          </div>
        </div>
      </label>

      {/* ── Action Bar (shown when file is selected) ── */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-zinc-800/60">
              <div className="flex items-center justify-between gap-3">
                {/* File info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                    <FileType2 className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={clearSelection}
                    disabled={isUploading}
                    className="w-9 h-9 rounded-lg border border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors flex items-center justify-center disabled:opacity-40"
                    title="إزالة"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="h-9 px-5 rounded-lg bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-amber-500/10"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري التحويل…</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>رفع وتحويل</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper note */}
      <p className="mt-3 text-[11px] text-zinc-600 leading-relaxed">
        يتم تحويل المستند في المتصفح — لا يتم إرسال الملف الأصلي إلى الخادم
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// Profile Page
// ══════════════════════════════════════════════════════════
export default function ProfilePage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const isDefaultAdmin = user?.email === DEFAULT_ADMIN_EMAIL;

  // ── Orders ──────────────────────────────────────────────
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosClient.get("/users/orders/my");
        setOrders(res.data.data.orders || []);
      } catch {
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  // ── Profile edits ───────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosClient.patch("/users/profile/me", {
        name: editName,
        phone: editPhone,
      });
      setEditing(false);
      toast.success("تم حفظ التعديلات");
    } catch {
      toast.error("فشل حفظ التعديلات");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0b0b0c] py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold font-heading text-white mb-8">
          حسابي
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ── Identity Card ────────────────────────── */}
          <div className="md:col-span-1">
            <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-sm">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-zinc-950 font-bold text-2xl shadow-lg shadow-amber-500/20">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold font-heading text-white truncate">
                    {user.name}
                  </h2>
                  <p className="text-zinc-500 text-xs truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Meta */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2.5 text-zinc-400">
                  <UserIcon className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2.5 text-zinc-400">
                    <Phone className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                    <span dir="ltr">{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-zinc-400">
                  <Calendar className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                  <span>
                    عضو منذ:{" "}
                    {new Date(user.createdAt).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              </div>

              {/* Edit button */}
              <button
                onClick={() => {
                  setEditing(!editing);
                  setEditName(user.name);
                  setEditPhone(user.phone || "");
                }}
                className="mt-6 w-full h-10 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Edit3 className="w-4 h-4" />
                تعديل الملف الشخصي
              </button>
            </div>
          </div>

          {/* ── Right Column ─────────────────────────── */}
          <div className="md:col-span-2 space-y-6">

            {/* ── Edit Form ─────────────────────────── */}
            {editing && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-sm"
              >
                <h3 className="font-heading font-bold text-white text-base mb-5">
                  تعديل الملف الشخصي
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">
                      الاسم
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-[#161619] border border-zinc-800 text-white text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder:text-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-[#161619] border border-zinc-800 text-white text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder:text-zinc-700"
                      dir="ltr"
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 h-11 rounded-xl bg-amber-500 text-zinc-950 font-bold text-sm hover:bg-amber-400 transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                    >
                      {saving && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      حفظ التعديلات
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex-1 h-11 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all text-sm"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Admin Upload Card ─────────────────── */}
            {isDefaultAdmin && <AdminPriceListUpload />}

            {/* ── Change Password ──────────────────── */}
            <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-zinc-500" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-base">
                    تغيير كلمة المرور
                  </h3>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    سيتم تسجيل خروجك من جميع الأجهزة
                  </p>
                </div>
              </div>
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-zinc-800/60 border border-zinc-800 text-amber-500 text-sm font-medium hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
              >
                إعادة تعيين كلمة المرور
              </Link>
            </div>

            {/* ── Recent Orders ────────────────────── */}
            <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-zinc-400" />
                  </div>
                  <h3 className="font-heading font-bold text-white text-base">
                    طلباتي الأخيرة
                  </h3>
                </div>
                <Link
                  to="/orders"
                  className="text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors"
                >
                  عرض جميع الطلبات
                </Link>
              </div>

              {loadingOrders ? (
                <div className="py-10 flex justify-center">
                  <div className="w-7 h-7 border-2 border-zinc-800 border-t-amber-500 rounded-full animate-spin" />
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-2">
                  {recentOrders.map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-4 rounded-xl bg-[#161619]/60 border border-zinc-800/40 hover:border-zinc-700 transition-colors"
                    >
                      <div>
                        <p className="text-white font-medium text-sm">
                          #{order._id.slice(-6)}
                        </p>
                        <p className="text-zinc-500 text-xs mt-0.5">
                          {order.items.length} منتج
                        </p>
                      </div>
                      <div className="text-left">
                        <StatusBadge status={order.status} />
                        <p className="text-white font-medium text-sm mt-1">
                          {order.subtotal} EGP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="w-11 h-11 text-zinc-800 mx-auto mb-3" />
                  <p className="text-zinc-600 text-sm">
                    لم تقم بأي طلبات بعد
                  </p>
                  <Link
                    to="/products"
                    className="inline-flex mt-4 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10"
                  >
                    تصفح المنتجات
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
