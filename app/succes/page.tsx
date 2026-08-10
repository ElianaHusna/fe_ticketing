import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <main className="ml-64 flex-1">

        <Navbar />

        <div className="flex justify-center items-center h-[calc(100vh-80px)]">

          <div className="bg-white rounded-2xl shadow-xl p-10 w-[500px] text-center">

            <div className="text-6xl mb-5">
              ✅
            </div>

            <h1 className="text-3xl font-bold text-green-600">
              Ticket Berhasil Dibuat
            </h1>

            <p className="text-gray-500 mt-4">
              Nomor Ticket Anda
            </p>

            <h2 className="text-3xl font-bold text-blue-700 mt-2">
              TCK-2026-001
            </h2>

            <p className="mt-4 text-gray-500">
              Simpan nomor ticket ini untuk melakukan tracking status.
            </p>

            <div className="mt-8 flex justify-center gap-4">

              <Link
                href="/submit-ticket"
                className="px-6 py-3 border rounded-xl hover:bg-gray-100"
              >
                Buat Lagi
              </Link>

              <Link
                href="/tracking"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Cek Status
              </Link>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}