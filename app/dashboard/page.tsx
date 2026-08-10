import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  Ticket,
  Clock3,
  CheckCircle2,
  Star,
  ArrowRight,
  Plus,
  Search,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="ml-64 flex-1 min-w-0">

        {/* Navbar */}
        <Navbar />

        <div className="p-6 lg:p-8">

          {/* ================= HEADER ================= */}
          <div className="mb-8">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div>
                <p className="text-sm font-medium text-blue-600 mb-2">
                  Dashboard
                </p>

                <h1 className="text-3xl font-bold text-slate-800">
                  Selamat Datang
                </h1>

                <p className="text-slate-500 mt-2">
                  Pantau dan kelola tiket bantuan Anda dengan mudah.
                </p>
              </div>

              <Link
                href="/submit-ticket"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <Plus size={19} />
                Buat Tiket Baru
              </Link>

            </div>

          </div>


          {/* ================= STATISTIK ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

            {/* Total */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Tiket
                  </p>

                  <h2 className="text-3xl font-bold text-slate-800 mt-3">
                    12
                  </h2>

                  <p className="text-xs text-slate-400 mt-2">
                    Semua tiket Anda
                  </p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Ticket
                    size={24}
                    className="text-blue-600"
                  />
                </div>

              </div>

            </div>


            {/* Diproses */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Sedang Diproses
                  </p>

                  <h2 className="text-3xl font-bold text-slate-800 mt-3">
                    3
                  </h2>

                  <p className="text-xs text-amber-600 mt-2">
                    Sedang ditangani
                  </p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock3
                    size={24}
                    className="text-amber-500"
                  />
                </div>

              </div>

            </div>


            {/* Selesai */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Tiket Selesai
                  </p>

                  <h2 className="text-3xl font-bold text-slate-800 mt-3">
                    8
                  </h2>

                  <p className="text-xs text-emerald-600 mt-2">
                    Berhasil diselesaikan
                  </p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2
                    size={24}
                    className="text-emerald-500"
                  />
                </div>

              </div>

            </div>


            {/* Rating */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Rating Saya
                  </p>

                  <h2 className="text-3xl font-bold text-slate-800 mt-3">
                    4.9
                  </h2>

                  <p className="text-xs text-orange-500 mt-2">
                    ★ Sangat Baik
                  </p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Star
                    size={24}
                    className="text-orange-500"
                  />
                </div>

              </div>

            </div>

          </div>


          {/* ================= QUICK ACTION ================= */}
          <div className="mb-8">

            <div className="flex items-center justify-between mb-4">

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Akses Cepat
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Pilih menu yang ingin Anda gunakan.
                </p>
              </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Buat Tiket */}
              <Link
                href="/submit-ticket"
                className="group bg-blue-600 hover:bg-blue-700 rounded-2xl p-6 text-white shadow-sm hover:shadow-lg transition-all duration-300"
              >

                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                  <Plus size={23} />
                </div>

                <h3 className="text-lg font-bold mt-5">
                  Buat Tiket
                </h3>

                <p className="text-sm text-blue-100 mt-2 leading-relaxed">
                  Laporkan masalah atau kendala baru kepada tim Helpdesk.
                </p>

                <div className="flex items-center gap-2 mt-5 text-sm font-semibold">
                  Buat sekarang
                  <ArrowRight
                    size={17}
                    className="group-hover:translate-x-1 transition"
                  />
                </div>

              </Link>


              {/* Tracking */}
              <Link
                href="/tracking"
                className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300"
              >

                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Search
                    size={23}
                    className="text-blue-600"
                  />
                </div>

                <h3 className="text-lg font-bold text-slate-800 mt-5">
                  Tracking Tiket
                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Cek perkembangan dan status tiket yang telah Anda kirim.
                </p>

                <div className="flex items-center gap-2 mt-5 text-sm font-semibold text-blue-600">
                  Cek tiket
                  <ArrowRight
                    size={17}
                    className="group-hover:translate-x-1 transition"
                  />
                </div>

              </Link>


              {/* Rating */}
              <Link
                href="/rating"
                className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
              >

                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Star
                    size={23}
                    className="text-emerald-600"
                  />
                </div>

                <h3 className="text-lg font-bold text-slate-800 mt-5">
                  Beri Rating
                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Berikan penilaian terhadap pelayanan Helpdesk.
                </p>

                <div className="flex items-center gap-2 mt-5 text-sm font-semibold text-emerald-600">
                  Beri rating
                  <ArrowRight
                    size={17}
                    className="group-hover:translate-x-1 transition"
                  />
                </div>

              </Link>

            </div>

          </div>


          {/* ================= RIWAYAT TIKET ================= */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Riwayat Tiket Saya
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Aktivitas tiket terbaru Anda.
                  </p>
                </div>

                <Link
                  href="/tracking"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Lihat Semua →
                </Link>

              </div>

            </div>


            {/* Table */}
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      No. Tiket
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Judul
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Tanggal
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Status
                    </th>

                  </tr>
                </thead>


                <tbody>

                  {/* Ticket 1 */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50 transition">

                    <td className="px-6 py-4">
                      <span className="font-semibold text-blue-600">
                        TKT-001
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      Tidak Bisa Login
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      08/08/2026
                    </td>

                    <td className="px-6 py-4">

                      <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1.5 rounded-full text-xs font-semibold">

                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>

                        Diproses

                      </span>

                    </td>

                  </tr>


                  {/* Ticket 2 */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50 transition">

                    <td className="px-6 py-4">
                      <span className="font-semibold text-blue-600">
                        TKT-002
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      Printer Rusak
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      05/08/2026
                    </td>

                    <td className="px-6 py-4">

                      <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-full text-xs font-semibold">

                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>

                        Selesai

                      </span>

                    </td>

                  </tr>


                  {/* Ticket 3 */}
                  <tr className="hover:bg-slate-50 transition">

                    <td className="px-6 py-4">
                      <span className="font-semibold text-blue-600">
                        TKT-003
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      Email Tidak Masuk
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      01/08/2026
                    </td>

                    <td className="px-6 py-4">

                      <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full text-xs font-semibold">

                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>

                        Baru

                      </span>

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}