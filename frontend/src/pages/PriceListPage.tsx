import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Loader2,
  ArrowRight,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";
import axiosClient from "@/api/apiClient";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface PriceListData {
  fileName: string;
  htmlContent: string;
  uploadedAt: string | null;
}

export default function PriceListPage() {
  const [data, setData] = useState<PriceListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPriceList = useCallback(async () => {
    try {
      const res = await axiosClient.get("/public/price-list");
      if (res.data.success) setData(res.data.data);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPriceList();
  }, [fetchPriceList]);

  const handleReload = () => {
    setRefreshing(true);
    setLoading(true);
    setError(false);
    setData(null);
    fetchPriceList();
  };

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 animate-spin" />
          </div>
          <p className="font-body text-zinc-500 text-sm tracking-wide">
            جاري تحميل القائمة…
          </p>
        </div>
      </div>
    );
  }

  // ── No content ───────────────────────────────────────────
  if (error || !data?.htmlContent) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-zinc-600" />
          </div>
          <h1 className="font-heading font-bold text-xl text-white mb-3">
            لا توجد قائمة أسعار متوفرة حالياً
          </h1>
          <p className="font-body text-zinc-500 text-sm mb-8 leading-relaxed">
            لم يتم رفع قائمة الأسعار بعد، يرجى المحاولة لاحقاً
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleReload}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-heading font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-40"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              إعادة المحاولة
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-body text-sm hover:text-white hover:border-zinc-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              العودة للرئيسية
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Rendered HTML ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0b0b0c]" dir="rtl">
      {/* ── Sticky Toolbar ──────────────────────────── */}
      <div className="sticky top-0 z-40 bg-[#0e0e10]/80 backdrop-blur-xl border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-amber-500" />
            </div>
            <span className="font-heading font-bold text-white truncate text-sm sm:text-base">
              {data.fileName}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleReload}
              disabled={refreshing}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all disabled:opacity-40"
              title="إعادة تحميل"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Document Content ────────────────────────── */}
      <div className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="rounded-2xl border border-zinc-800/60 bg-[#0e0e10] overflow-hidden relative shadow-2xl shadow-black/40"
          >
            {/* ── Loading overlay (scoped to card) ───── */}
            <AnimatePresence>
              {refreshing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 bg-[#0e0e10]/80 backdrop-blur-sm flex items-center justify-center rounded-2xl"
                >
                  <div className="text-center">
                    <Loader2 className="w-7 h-7 animate-spin text-amber-500 mx-auto mb-3" />
                    <p className="font-body text-zinc-500 text-xs">
                      جاري تحديث المحتوى…
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── HTML Content (mammoth output) ─────── */}
            <div
              className="
                pricelist-body
                /* ── Layout ────────────────────────── */
                max-w-none
                p-4 sm:p-8 lg:p-12
                font-body text-[15px] leading-7
                /* ── Paragraphs & text ─────────────── */
                [&_p]:text-zinc-200
                [&_p]:mb-4
                [&_strong]:text-white
                [&_strong]:font-bold
                [&_em]:text-zinc-300
                [&_em]:italic
                [&_a]:text-amber-400
                [&_a]:underline
                [&_a]:decoration-amber-500/30
                [&_a]:hover:text-amber-300
                /* ── Headings ──────────────────────── */
                [&_h1]:text-2xl
                [&_h1]:font-heading
                [&_h1]:font-bold
                [&_h1]:text-white
                [&_h1]:mt-8
                [&_h1]:mb-4
                [&_h1]:pb-3
                [&_h1]:border-b
                [&_h1]:border-zinc-800
                [&_h2]:text-xl
                [&_h2]:font-heading
                [&_h2]:font-bold
                [&_h2]:text-white
                [&_h2]:mt-7
                [&_h2]:mb-3
                [&_h3]:text-lg
                [&_h3]:font-heading
                [&_h3]:font-semibold
                [&_h3]:text-zinc-100
                [&_h3]:mt-6
                [&_h3]:mb-2
                /* ── Lists ─────────────────────────── */
                [&_ul]:text-zinc-300
                [&_ol]:text-zinc-300
                [&_ul]:mb-4
                [&_ol]:mb-4
                [&_li]:mb-1.5
                [&_li]:ps-5
                [&_li::marker]:text-amber-500
                [&_li::marker]:font-bold
                /* ── Tables ────────────────────────── */
                [&_table]:w-full
                [&_table]:mb-8
                [&_table]:rounded-xl
                [&_table]:overflow-hidden
                [&_table]:border
                [&_table]:border-zinc-800
                [&_table]:border-collapse
                /* Table header */
                [&_thead]:bg-[#121214]
                [&_th]:px-5
                [&_th]:py-3.5
                [&_th]:text-sm
                [&_th]:font-heading
                [&_th]:font-bold
                [&_th]:text-amber-500
                [&_th]:text-right
                [&_th]:border-b
                [&_th]:border-zinc-800
                [&_th]:whitespace-nowrap
                /* Table body */
                [&_tbody]:bg-[#0e0e10]
                [&_td]:px-5
                [&_td]:py-3
                [&_td]:text-sm
                [&_td]:text-zinc-200
                [&_td]:border-b
                [&_td]:border-zinc-800/60
                [&_td]:align-middle
                /* Alternating rows */
                [&_tr:nth-child(even)_td]:bg-[#141416]/50
                /* Hover */
                [&_tr:hover_td]:bg-amber-500/[0.04]
                [&_tr]:transition-colors
                [&_tr]:duration-150
                /* ── Other elements ────────────────── */
                [&_img]:max-w-full
                [&_img]:rounded-lg
                [&_img]:mx-auto
                [&_blockquote]:border-r-2
                [&_blockquote]:border-amber-500
                [&_blockquote]:pr-4
                [&_blockquote]:text-zinc-400
                [&_blockquote]:italic
                [&_hr]:border-zinc-800
                [&_hr]:my-6
                [&_pre]:bg-[#161619]
                [&_pre]:text-zinc-300
                [&_pre]:rounded-lg
                [&_pre]:p-4
                [&_pre]:overflow-x-auto
                [&_code]:text-amber-400
                [&_code]:text-xs
                [&_ul>li_ul]:mt-1.5
                [&_ol>li_ol]:mt-1.5
                [&_sup]:text-zinc-500
                [&_sub]:text-zinc-500
                [&_del]:text-zinc-600
                [&_ins]:text-emerald-400
                /* ── Bold headings override ───────── */
                [&_b]:text-white
                [&_i]:text-zinc-300
                [&_u]:text-zinc-200
              "
              dangerouslySetInnerHTML={{ __html: data.htmlContent }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
