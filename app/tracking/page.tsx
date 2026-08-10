import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import {
  Search,
  Clock,
  CheckCircle,
  User,
} from "lucide-react";

export default function TrackingPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <main className="ml-64 flex-1">

        <Navbar />

        <div className="p-8">

          {/* Header */}
          <div className="mb-8">

            <p className="text-sm text-gray-500 mb-2">
              Dashboard / Tracking
            </p>

            <h1 className="text-3xl font-bold text-slate-800">
              Cek Status Tiket
            </h1>

            <p className="text-gray-500 mt-2">
              Masukkan nomor tiket untuk melihat perkembangan laporan Anda.
            </p>

          </div>

          {/* Search Ticket */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Masukkan Nomor Tiket
            </h2>

            <div className="flex gap-4">

              <div className="relative flex-1">

                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Contoh: TKT-20240820-0001"
                  className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <button
                type="button"
                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Cek
              </button>

            </div>

          </div>

          {/* Detail Ticket */}
          <div className="bg-white rounded-2xl shadow-md p-8">

            {/* Ticket Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

              <div>

                <p className="text-sm text-gray-500">
                  Nomor Tiket
                </p>

                <h2 className="text-2xl font-bold text-slate-800 mt-1">
                  TKT-20240820-0001
                </h2>

              </div>

              <span className="w-fit px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                Diproses
              </span>

            </div>

            {/* Ticket Information */}
            <div className="grid md:grid-cols-2 gap-8 mb-10">

              <div>

                <p className="text-sm text-gray-500 mb-2">
                  Judul Tiket
                </p>

                <p className="font-semibold text-slate-800">
                  Tidak bisa login ke akun
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500 mb-2">
                  Prioritas
                </p>

                <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-600 font-medium">
                  Tinggi
                </span>

              </div>

              <div>

                <p className="text-sm text-gray-500 mb-2">
                  Tanggal Dibuat
                </p>

                <p className="font-semibold text-slate-800">
                  20 Mei 2024 10:15
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500 mb-2">
                  Ditangani Oleh
                </p>

                <div className="flex items-center gap-2">

                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                    <User
                      size={18}
                      className="text-blue-600"
                    />
                  </div>

                  <div>

                    <p className="font-semibold text-slate-800">
                      Helpdesk
                    </p>

                    <p className="text-xs text-gray-500">
                      Tier 1
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* Description */}
            <div className="border-t pt-6 mb-8">

              <h3 className="font-semibold text-slate-800 mb-3">
                Deskripsi Masalah
              </h3>

              <div className="bg-gray-50 rounded-xl p-4 text-gray-600 leading-relaxed">
                Saya mencoba login, namun muncul pesan error
                "Email atau password salah" padahal saya sudah yakin
                sudah memasukkan data dengan benar.
              </div>

            </div>

            {/* Progress */}
            <div className="border-t pt-8">

              <h3 className="text-xl font-bold text-slate-800 mb-8">
                Status Tiket
              </h3>

              <div className="space-y-8">

                {/* Step 1 */}
                <div className="flex gap-4">

                  <div className="flex flex-col items-center">

                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle
                        size={20}
                        className="text-white"
                      />
                    </div>

                    <div className="w-0.5 h-16 bg-green-300 mt-2"></div>

                  </div>

                  <div>

                    <h4 className="font-semibold text-slate-800">
                      Tiket Dibuat
                    </h4>

                    <p className="text-sm text-gray-500 mt-1">
                      20 Mei 2024 • 10:15
                    </p>

                    <p className="text-gray-600 mt-2">
                      Tiket berhasil dibuat oleh Anda.
                    </p>

                  </div>

                </div>

                {/* Step 2 */}
                <div className="flex gap-4">

                  <div className="flex flex-col items-center">

                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <Clock
                        size={20}
                        className="text-white"
                      />
                    </div>

                    <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>

                  </div>

                  <div>

                    <h4 className="font-semibold text-blue-600">
                      Sedang Diproses
                    </h4>

                    <p className="text-sm text-gray-500 mt-1">
                      20 Mei 2024 • 10:20
                    </p>

                    <p className="text-gray-600 mt-2">
                      Tiket sedang ditangani oleh Helpdesk Tier 1.
                    </p>

                  </div>

                </div>

                {/* Step 3 */}
                <div className="flex gap-4">

                  <div className="flex flex-col items-center">

                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <CheckCircle
                        size={20}
                        className="text-gray-400"
                      />
                    </div>

                  </div>

                  <div>

                    <h4 className="font-semibold text-gray-400">
                      Selesai
                    </h4>

                    <p className="text-sm text-gray-400 mt-1">
                      Menunggu penyelesaian tiket.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}