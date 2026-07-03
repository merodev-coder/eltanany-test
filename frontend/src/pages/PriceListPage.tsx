import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import axiosClient from "@/api/apiClient";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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

  // ── Fetch ─────────────────────────────────────────────────
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-ignition-start mx-auto mb-4" />
          <p className="font-body text-zinc-400 text-lg">جاري تحميل القائمة…</p>
        </div>
      </div>
    );
  }

  // ── No content ───────────────────────────────────────────
  if (error || !data?.htmlContent) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-zinc-500" />
          </div>
          <h1 className="font-heading font-bold text-xl text-white mb-2">
            لا توجد قائمة أسعار متوفرة حالياً
          </h1>
          <p className="font-body text-zinc-400 mb-6">
            لم يتم رفع قائمة الأسعار بعد، يرجى المحاولة لاحقاً
          </p>
          <button
            onClick={handleReload}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ignition-start text-white font-heading font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            إعادة المحاولة
          </button>
          <div className="mt-4">
            <Link
              to="/"
              className="text-sm text-ignition-start hover:underline font-body"
            >
              <ArrowRight className="w-4 h-4 inline-block ml-1" />
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Rendered HTML ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950" dir="rtl">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-50 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-5 h-5 text-ignition-start flex-shrink-0" />
            <span className="font-heading font-bold text-white truncate text-sm sm:text-base">
              {data.fileName}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleReload}
              disabled={refreshing}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors disabled:opacity-40"
              title="إعادة تحميل"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-zinc-950 py-6 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg overflow-hidden relative"
          >
            {/* Render the converted HTML — tables, paragraphs, lists, etc. */}
            <div
              className="pricelist-html prose prose-lg prose-zinc dark:prose-invert
                max-w-none
                prose-headings:text-white prose-headings:font-heading
                prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4
                prose-h2:text-xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-3
                prose-h3:text-lg prose-h3:font-bold prose-h3:mt-4 prose-h3:mb-2
                prose-p:text-zinc-300 prose-leading-7
                prose-table:divide-x prose-table:divide-zinc-700
                prose-thead:bg-zinc-800
                prose-th:text-white prose-th:font-bold prose-th:px-4 prose-th:py-3
                prose-td:text-zinc-300 prose-td:px-4 prose-td:py-3
                prose-tr:border-b prose-tr:border-zinc-800
                prose-ul:text-zinc-300 prose-ol:text-zinc-300
                prose-li:marker:text-ignition-start
                [&_table]:w-full [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:border [&_table]:border-zinc-800
                [&_table]:my-6
                [&_*]:font-body
                rtl:[&_th]:text-right
                ltr:[&_th]:text-left
              "
              dangerouslySetInnerHTML={{ __html: data.htmlContent }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
