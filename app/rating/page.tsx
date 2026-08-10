"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Star } from "lucide-react";

export default function RatingPage() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800">
      <Sidebar />

      <main className="ml-64 flex-1">
        <Navbar />

        <div className="p-8 max-w-5xl">
          {/* Breadcrumb */}
          <div className="mb-6">
            <p className="text-xs text-blue-600 font-medium">
              Dashboard / <span className="text-slate-500">Rating & Ulasan</span>
            </p>
          </div>

          {/* Rating Card Container */}
          <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-8 mt-4">
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800">
                Rating Kepuasan
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Berikan penilaian terhadap kualitas pelayanan helpdesk kami.
              </p>
            </div>

            {/* Interactive Star Rating */}
            <div className="flex justify-center items-center gap-3 my-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="p-1 transition-transform transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      star <= (hover || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Form Inputs */}
            <form className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nomor Tiket <span className="font-normal text-slate-400">(opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: TKT-20240520-0001"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Komentar & Masukan
                </label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan pengalaman atau masukan Anda..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white resize-none placeholder:text-slate-400"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="reset"
                  onClick={() => setRating(0)}
                  className="px-5 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                >
                  Kirim Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}