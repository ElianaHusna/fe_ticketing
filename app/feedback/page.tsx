"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Star,
  RefreshCw,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { apiFetch } from "@/src/lib/api";

type Feedback = {
  id: string;
  userName: string;
  ticketNumber: string;
  rating: number;
  feedback: string | null;
  status?: string;
  createdAt: string;
};
export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD FEEDBACK - DIPERBAIKI
  // =====================================================

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("GET /tickets/feedback");

      const result = await apiFetch("/tickets/feedback", {
        method: "GET",
      });

      console.log("FEEDBACK RESPONSE:", result);

      const data = result?.data ?? result;

      if (Array.isArray(data)) {
        setFeedback(data);
        return;
      }

      if (Array.isArray(data?.items)) {
        setFeedback(data.items);
        return;
      }

      setFeedback([]);
    } catch (error) {
      console.error("Feedback gagal:", error);

      setFeedback([]);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil feedback."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // USE EFFECT
  // =====================================================

  useEffect(() => {
    loadFeedback();
  }, []);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="ml-64">
        <header className="bg-white border-b px-8 py-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Masukan & Rating
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lihat penilaian dan komentar pengguna.
          </p>
        </header>

        <div className="p-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm">
            
            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-5 border-b">
              <h2 className="font-bold text-slate-900">
                Daftar Feedback
                {!loading && feedback.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-slate-400">
                    ({feedback.length} feedback)
                  </span>
                )}
              </h2>

              <button
                onClick={loadFeedback}
                disabled={loading}
                className="flex items-center gap-2 border rounded-xl px-4 py-2 text-sm hover:bg-slate-50 transition disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle size={16} />
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* CONTENT */}
            {loading ? (
              <div className="py-20 text-center">
                <RefreshCw className="animate-spin mx-auto text-blue-500" size={32} />
                <p className="mt-3 text-sm text-slate-500">Memuat feedback...</p>
              </div>
            ) : feedback.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                  <MessageSquare size={24} className="text-slate-400" />
                </div>
                <p className="mt-3 text-sm text-slate-500">Belum ada masukan</p>
                <p className="text-xs text-slate-400">Feedback akan muncul setelah pengguna memberikan rating</p>
              </div>
            ) : (
              <div className="divide-y">
                {feedback.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-slate-50/50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800">
                          {item.userName || "Pengguna"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.ticketNumber || "No Ticket"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={18}
                            className={
                              star <= item.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300"
                            }
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium text-slate-600">
                          {item.rating}/5
                        </span>
                      </div>
                    </div>

                   {item.feedback && (
  <div className="mt-4 flex gap-3 bg-slate-50 rounded-xl p-4">
    <MessageSquare
      size={18}
      className="text-blue-600 flex-shrink-0 mt-0.5"
    />

    <p className="text-sm text-slate-600 whitespace-pre-wrap">
      {item.feedback}
    </p>
  </div>
)}

                    <p className="text-xs text-slate-400 mt-3">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}