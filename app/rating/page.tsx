
"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import {
  Star,
  Ticket,
  Send,
  MessageSquare,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

export default function RatingPage() {
  const [ticketId, setTicketId] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // =====================================================
  // TEXT RATING
  // =====================================================

  const getRatingText = (value: number) => {
    switch (value) {
      case 1:
        return "Sangat Tidak Puas";

      case 2:
        return "Tidak Puas";

      case 3:
        return "Cukup Puas";

      case 4:
        return "Puas";

      case 5:
        return "Sangat Puas";

      default:
        return "Belum memberikan rating";
    }
  };

  const getRatingDescription = (value: number) => {
    switch (value) {
      case 1:
        return "Pelayanan yang diterima belum memenuhi harapan.";

      case 2:
        return "Masih banyak hal yang perlu diperbaiki.";

      case 3:
        return "Pelayanan cukup baik, tetapi masih bisa ditingkatkan.";

      case 4:
        return "Pelayanan sudah baik dan sesuai harapan.";

      case 5:
        return "Pelayanan sangat baik dan memuaskan.";

      default:
        return "Klik salah satu bintang untuk memberikan penilaian.";
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    setTicketId("");
    setRating(0);
    setComment("");
    setSubmitted(false);
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!ticketId.trim()) {
      return;
    }

    if (rating === 0) {
      return;
    }

    console.log({
      ticketId,
      rating,
      comment,
    });

    setSubmitted(true);
  };

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar />

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="ml-64 flex-1 min-w-0">

        <Navbar />

        <div className="p-6 lg:p-8 max-w-5xl mx-auto">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-8">

            <p className="text-sm font-semibold text-blue-600 mb-2">
              Penilaian Layanan
            </p>

            <div className="flex items-start justify-between gap-6">

              <div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Beri Rating Pelayanan
                </h1>

                <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                  Bagikan pengalaman Anda setelah mendapatkan bantuan
                  dari tim Helpdesk.
                </p>

              </div>

              <div className="hidden md:flex w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 items-center justify-center">

                <Star
                  size={24}
                  strokeWidth={2.2}
                  className="text-blue-600"
                />

              </div>

            </div>

          </div>

          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {submitted && (
            <div className="mb-6 bg-white border border-blue-200 rounded-xl shadow-sm">

              <div className="p-5 flex items-start gap-4">

                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">

                  <CheckCircle2
                    size={20}
                    className="text-blue-600"
                  />

                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Rating berhasil dikirim
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Terima kasih telah memberikan penilaian untuk tiket{" "}
                    <span className="font-semibold text-slate-700">
                      {ticketId}
                    </span>
                    .
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* =================================================
              MAIN CARD
          ================================================= */}

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

            {/* =================================================
                CARD HEADER
            ================================================= */}

            <div className="px-6 py-5 border-b border-slate-200">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">

                  <MessageSquare
                    size={19}
                    className="text-slate-600"
                  />

                </div>

                <div>

                  <h2 className="text-base font-bold text-slate-900">
                    Penilaian Tiket
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Isi penilaian berdasarkan pelayanan yang Anda terima.
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="p-6 md:p-8"
            >

              {/* =================================================
                  NOMOR TIKET
              ================================================= */}

              <div className="mb-8">

                <label
                  htmlFor="ticket"
                  className="block text-sm font-semibold text-slate-800 mb-2"
                >
                  Nomor Tiket
                </label>

                <div className="relative">

                  <Ticket
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="ticket"
                    type="text"
                    value={ticketId}
                    onChange={(e) =>
                      setTicketId(e.target.value)
                    }
                    placeholder="Contoh: TCK-20260814-001"
                    disabled={submitted}
                    required
                    className="w-full h-11 border border-slate-300 rounded-lg pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                  />

                </div>

                <p className="text-xs text-slate-400 mt-2">
                  Masukkan nomor tiket yang ingin Anda beri penilaian.
                </p>

              </div>

              {/* =================================================
                  RATING SECTION
              ================================================= */}

              <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">

                {/* RATING HEADER */}

                <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="text-sm font-bold text-slate-800">
                        Kualitas Pelayanan
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        Klik bintang sesuai dengan penilaian Anda.
                      </p>

                    </div>

                    {rating > 0 && (
                      <div className="text-right">

                        <p className="text-xl font-bold text-slate-900">
                          {rating}
                          <span className="text-sm font-medium text-slate-400">
                            /5
                          </span>
                        </p>

                      </div>
                    )}

                  </div>

                </div>

                {/* =================================================
                    STARS
                ================================================= */}

                <div className="px-5 py-9">

                  <div className="flex justify-center items-center gap-3">

                    {[1, 2, 3, 4, 5].map((star) => {

                      /*
                       * PENTING:
                       *
                       * Warna hanya berdasarkan `rating`.
                       *
                       * Tidak menggunakan hover.
                       *
                       * Jadi ketika mouse digeser,
                       * warna tidak akan berubah.
                       */

                      const isSelected = star <= rating;

                      return (
                        <button
                          key={star}
                          type="button"
                          disabled={submitted}
                          onClick={() => setRating(star)}
                          aria-label={`Beri rating ${star} dari 5`}
                          className="p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed"
                        >

                          <Star
                            size={40}
                            strokeWidth={2.5}
                            className={
                              isSelected
                                ? "fill-yellow-400 text-yellow-500"
                                : "fill-white text-slate-300"
                            }
                          />

                        </button>
                      );

                    })}

                  </div>

                  {/* =================================================
                      RATING TEXT
                  ================================================= */}

                  <div className="text-center mt-5">

                    <p
                      className={`text-base font-bold ${
                        rating > 0
                          ? "text-slate-900"
                          : "text-slate-400"
                      }`}
                    >
                      {getRatingText(rating)}
                    </p>

                    <p className="text-xs text-slate-500 mt-1.5">
                      {getRatingDescription(rating)}
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  COMMENT
              ================================================= */}

              <div className="mb-8">

                <div className="flex items-center justify-between mb-2">

                  <label
                    htmlFor="comment"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Komentar & Masukan
                  </label>

                  <span className="text-xs text-slate-400">
                    Opsional
                  </span>

                </div>

                <textarea
                  id="comment"
                  rows={5}
                  value={comment}
                  onChange={(e) =>
                    setComment(e.target.value)
                  }
                  disabled={submitted}
                  placeholder="Tulis pengalaman, kritik, atau saran Anda..."
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 outline-none resize-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                />

                <div className="flex justify-end mt-2">

                  <span className="text-xs text-slate-400">
                    {comment.length} karakter
                  </span>

                </div>

              </div>

              {/* =================================================
                  FORM FOOTER
              ================================================= */}

              <div className="border-t border-slate-100 pt-5">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                  <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                    Penilaian Anda membantu tim Helpdesk meningkatkan
                    kualitas pelayanan.
                  </p>

                  <div className="flex items-center gap-3">

                    {!submitted && (
                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                      >

                        <RotateCcw
                          size={15}
                        />

                        Reset

                      </button>
                    )}

                    {submitted ? (

                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
                      >

                        <Star
                          size={15}
                        />

                        Beri Rating Lain

                      </button>

                    ) : (

                      <button
                        type="submit"
                        disabled={
                          !ticketId.trim() ||
                          rating === 0
                        }
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >

                        <Send
                          size={15}
                        />

                        Kirim Rating

                      </button>

                    )}

                  </div>

                </div>

              </div>

            </form>

          </div>

          {/* =================================================
              BOTTOM INFO
          ================================================= */}

          <p className="text-xs text-slate-400 text-center mt-5">
            Berikan penilaian secara jujur berdasarkan pengalaman
            Anda selama menggunakan layanan Helpdesk.
          </p>

        </div>

      </main>

    </div>
  );
}
