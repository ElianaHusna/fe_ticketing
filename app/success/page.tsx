import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { CheckCircle2, Search, Plus } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar />

      <main className="flex-1 min-w-0">

        <Navbar />

        <div className="min-h-[calc(100vh-96px)] flex items-center justify-center p-6">

          <div className="w-full max-w-lg">

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-10 text-center">

              {/* Icon */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2
                  size={38}
                  className="text-emerald-500"
                />
              </div>

              {/* Title */}
              <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-slate-800">
                Tiket Berhasil Dibuat
              </h1>

              <p className="mt-3 text-sm text-slate-500">
                Tiket Anda telah berhasil dikirim. Simpan nomor tiket
                berikut untuk melakukan tracking.
              </p>

              {/* Ticket Number */}
              <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50 px-6 py-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nomor Tiket
                </p>

                <p className="mt-2 text-2xl sm:text-3xl font-bold text-blue-600 tracking-wide">
                  TCK-2026-001
                </p>

              </div>

              {/* Info */}
              <p className="mt-5 text-sm text-slate-500">
                Gunakan nomor tiket tersebut untuk melihat perkembangan
                laporan Anda.
              </p>

              {/* Buttons */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">

                <Link
                  href="/submit-ticket"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Plus size={18} />
                  Buat Tiket Lagi
                </Link>

                <Link
                  href="/tracking"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  <Search size={18} />
                  Cek Status
                </Link>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}