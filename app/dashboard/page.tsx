"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Ticket,
  Clock3,
  CheckCircle2,
  ArrowRight,
  Plus,
  Search,
  Star,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/src/lib/api";

type TicketData = {
  id: string | number;

  ticketNumber?: string;
  ticket_number?: string;

  subject?: string;
  title?: string;

  requesterName?: string;
  requester_name?: string;

  requesterEmail?: string;
  requester_email?: string;

  status?: string;

  createdAt?: string;
  created_at?: string;
};

type DashboardStats = {
  total: number;
  processing: number;
  completed: number;
};

type UserData = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
};

export default function DashboardPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);

  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    processing: 0,
    completed: 0,
  });

  const [user, setUser] = useState<UserData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      // =====================================================
      // 1. AMBIL USER YANG SEDANG LOGIN
      // =====================================================

      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        throw new Error(
          "Data user tidak ditemukan. Silakan login kembali."
        );
      }

      const currentUser: UserData = JSON.parse(savedUser);

      setUser(currentUser);

      const currentEmail = currentUser?.email
        ?.toLowerCase()
        .trim();

      if (!currentEmail) {
        throw new Error(
          "Email user tidak ditemukan."
        );
      }

      console.log(
        "USER LOGIN:",
        currentUser
      );

      console.log(
        "EMAIL LOGIN:",
        currentEmail
      );

      // =====================================================
      // 2. AMBIL DATA TIKET DARI BACKEND
      // =====================================================

      const response = await apiFetch(
        "/tickets?page=1&limit=100"
      );

      console.log(
        "SEMUA TIKET DARI BACKEND:",
        response
      );

      // =====================================================
      // 3. NORMALISASI RESPONSE BACKEND
      // =====================================================

      const allTickets: TicketData[] =
        Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];

      // =====================================================
      // 4. FILTER BERDASARKAN EMAIL USER LOGIN
      // =====================================================

      const userTickets = allTickets.filter(
        (ticket) => {
          const ticketEmail =
            ticket.requesterEmail ||
            ticket.requester_email ||
            "";

          return (
            ticketEmail
              .toLowerCase()
              .trim() === currentEmail
          );
        }
      );

      console.log(
        "TIKET USER INI:",
        userTickets
      );

      // =====================================================
      // 5. SIMPAN TIKET USER
      // =====================================================

      setTickets(userTickets);

      // =====================================================
      // 6. HITUNG STATISTIK
      // =====================================================

      const total = userTickets.length;

      const processing =
        userTickets.filter(
          (ticket) =>
            ticket.status?.toLowerCase() ===
            "in_progress"
        ).length;

      const completed =
        userTickets.filter(
          (ticket) => {
            const status =
              ticket.status?.toLowerCase();

            return (
              status === "resolved" ||
              status === "closed"
            );
          }
        ).length;

      setStats({
        total,
        processing,
        completed,
      });
    } catch (err) {
      console.error(
        "DASHBOARD ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // NOMOR TIKET
  // =====================================================

  function getTicketNumber(
    ticket: TicketData
  ) {
    return (
      ticket.ticketNumber ||
      ticket.ticket_number ||
      `#${ticket.id}`
    );
  }

  // =====================================================
  // JUDUL TIKET
  // =====================================================

  function getTicketTitle(
    ticket: TicketData
  ) {
    return (
      ticket.subject ||
      ticket.title ||
      "Tanpa judul"
    );
  }

  // =====================================================
  // TANGGAL
  // =====================================================

  function formatDate(
    date?: string
  ) {
    if (!date) {
      return "-";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  // =====================================================
  // STATUS LABEL
  // =====================================================

  function getStatusLabel(
    status?: string
  ) {
    if (!status) {
      return "Tidak diketahui";
    }

    const normalized =
      status.toLowerCase();

    switch (normalized) {
      case "new":
        return "Baru";

      case "in_progress":
        return "Diproses";

      case "waiting_reply":
        return "Menunggu Balasan";

      case "escalated":
        return "Diteruskan";

      case "resolved":
        return "Selesai";

      case "closed":
        return "Ditutup";

      default:
        return status;
    }
  }

  // =====================================================
  // STATUS STYLE
  // =====================================================

  function getStatusStyle(
    status?: string
  ) {
    const normalized =
      status?.toLowerCase();

    if (
      normalized ===
      "in_progress"
    ) {
      return {
        container:
          "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
      };
    }

    if (
      normalized ===
      "waiting_reply"
    ) {
      return {
        container:
          "bg-orange-50 text-orange-700 border-orange-200",
        dot: "bg-orange-500",
      };
    }

    if (
      normalized ===
      "escalated"
    ) {
      return {
        container:
          "bg-red-50 text-red-700 border-red-200",
        dot: "bg-red-500",
      };
    }

    if (
      normalized ===
        "resolved" ||
      normalized ===
        "closed"
    ) {
      return {
        container:
          "bg-slate-100 text-slate-700 border-slate-200",
        dot: "bg-slate-500",
      };
    }

    return {
      container:
        "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
    };
  }

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">

          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="text-sm text-slate-500 mt-4">
            Memuat dashboard...
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">

      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN */}

      <main className="ml-64 flex-1 min-w-0">

        {/* NAVBAR */}

        <Navbar />

        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="mb-8">

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

              <div>

                <p className="text-sm font-semibold text-blue-600 mb-2">
                  Dashboard
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Selamat Datang
                  {user?.name
                    ? `, ${user.name}`
                    : ""}
                </h1>

                <p className="text-sm text-slate-500 mt-2">
                  Pantau laporan dan perkembangan tiket Anda.
                </p>

                {/* EMAIL USER */}

                {user?.email && (
                  <p className="text-xs text-slate-400 mt-1">
                    {user.email}
                  </p>
                )}

              </div>

              <div className="flex items-center gap-3">

                {/* REFRESH */}

                <button
                  type="button"
                  onClick={loadDashboard}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-50"
                >

                  <RefreshCw
                    size={16}
                    className={
                      loading
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh

                </button>

                {/* BUAT TIKET */}

                <Link
                  href="/submit-ticket"
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition"
                >

                  <Plus size={18} />

                  Buat Tiket

                </Link>

              </div>

            </div>

          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3.5">

              <AlertCircle
                size={18}
                className="text-red-500 mt-0.5 flex-shrink-0"
              />

              <div className="flex-1">

                <p className="text-sm font-semibold text-red-700">
                  Gagal memuat data
                </p>

                <p className="text-sm text-red-600 mt-0.5">
                  {error}
                </p>

              </div>

              <button
                type="button"
                onClick={loadDashboard}
                className="text-sm font-semibold text-red-700 hover:text-red-800"
              >
                Coba lagi
              </button>

            </div>
          )}

          {/* =================================================
              STATISTICS
          ================================================= */}

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

            {/* TOTAL */}

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Total Tiket
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {loading
                      ? "..."
                      : stats.total}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Tiket milik Anda
                  </p>

                </div>

                <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">

                  <Ticket
                    size={21}
                    className="text-blue-600"
                  />

                </div>

              </div>

            </div>

            {/* PROCESSING */}

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Sedang Diproses
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {loading
                      ? "..."
                      : stats.processing}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Sedang ditangani
                  </p>

                </div>

                <div className="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center">

                  <Clock3
                    size={21}
                    className="text-amber-600"
                  />

                </div>

              </div>

            </div>

            {/* COMPLETED */}

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Tiket Selesai
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {loading
                      ? "..."
                      : stats.completed}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Telah diselesaikan
                  </p>

                </div>

                <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center">

                  <CheckCircle2
                    size={21}
                    className="text-slate-600"
                  />

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              AKSES CEPAT
          ================================================= */}

          <section className="mb-8">

            <div className="mb-4">

              <h2 className="text-lg font-bold text-slate-900">
                Akses Cepat
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Gunakan menu berikut untuk mengelola tiket Anda.
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* BUAT TIKET */}

              <Link
                href="/submit-ticket"
                className="group bg-blue-600 hover:bg-blue-700 rounded-xl p-5 text-white transition shadow-sm hover:shadow-md"
              >

                <div className="flex items-start justify-between">

                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">

                    <Plus size={21} />

                  </div>

                  <ArrowRight
                    size={18}
                    className="opacity-70 group-hover:translate-x-1 transition"
                  />

                </div>

                <h3 className="text-base font-bold mt-5">
                  Buat Tiket
                </h3>

                <p className="text-sm text-blue-100 mt-1.5">
                  Laporkan masalah atau kendala baru.
                </p>

                <div className="text-xs font-semibold text-white/90 mt-4">
                  Buat laporan baru
                </div>

              </Link>

              {/* TRACKING */}

              <Link
                href="/tracking"
                className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition"
              >

                <div className="flex items-start justify-between">

                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">

                    <Search
                      size={21}
                      className="text-blue-600"
                    />

                  </div>

                  <ArrowRight
                    size={18}
                    className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition"
                  />

                </div>

                <h3 className="text-base font-bold text-slate-900 mt-5">
                  Tracking Tiket
                </h3>

                <p className="text-sm text-slate-500 mt-1.5">
                  Lihat perkembangan dan status tiket.
                </p>

                <div className="text-xs font-semibold text-blue-600 mt-4">
                  Lihat perkembangan
                </div>

              </Link>

              {/* RATING */}

              <Link
                href="/rating"
                className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-md transition"
              >

                <div className="flex items-start justify-between">

                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">

                    <Star
                      size={21}
                      className="text-slate-600"
                    />

                  </div>

                  <ArrowRight
                    size={18}
                    className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition"
                  />

                </div>

                <h3 className="text-base font-bold text-slate-900 mt-5">
                  Beri Rating
                </h3>

                <p className="text-sm text-slate-500 mt-1.5">
                  Berikan penilaian terhadap pelayanan.
                </p>

                <div className="text-xs font-semibold text-slate-600 mt-4">
                  Berikan penilaian
                </div>

              </Link>

            </div>

          </section>

          {/* =================================================
              RIWAYAT TIKET
          ================================================= */}

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

            {/* HEADER */}

            <div className="px-5 py-5 border-b border-slate-200">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Riwayat Tiket Saya
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Tiket yang dibuat menggunakan email:
                  </p>

                  <p className="text-xs font-semibold text-blue-600 mt-1">
                    {user?.email || "-"}
                  </p>

                </div>

                <Link
                  href="/tracking"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Lihat semua
                  <ArrowRight size={15} />
                </Link>

              </div>

            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="bg-slate-50 border-b border-slate-200">

                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      No. Tiket
                    </th>

                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Judul
                    </th>

                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Tanggal
                    </th>

                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {/* LOADING */}

                  {loading ? (

                    <tr>

                      <td
                        colSpan={4}
                        className="px-5 py-12 text-center"
                      >

                        <div className="flex flex-col items-center">

                          <RefreshCw
                            size={22}
                            className="text-blue-500 animate-spin"
                          />

                          <p className="text-sm text-slate-500 mt-3">
                            Memuat data tiket...
                          </p>

                        </div>

                      </td>

                    </tr>

                  ) : tickets.length === 0 ? (

                    /* EMPTY */

                    <tr>

                      <td
                        colSpan={4}
                        className="px-5 py-12 text-center"
                      >

                        <div className="flex flex-col items-center">

                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">

                            <Ticket
                              size={21}
                              className="text-slate-400"
                            />

                          </div>

                          <h3 className="text-sm font-semibold text-slate-700 mt-4">
                            Belum ada tiket
                          </h3>

                          <p className="text-sm text-slate-500 mt-1">
                            Belum ada tiket untuk email ini.
                          </p>

                          <Link
                            href="/submit-ticket"
                            className="inline-flex items-center gap-2 mt-4 h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
                          >

                            <Plus size={16} />

                            Buat Tiket

                          </Link>

                        </div>

                      </td>

                    </tr>

                  ) : (

                    /* DATA */

                    tickets
                      .slice(0, 5)
                      .map((ticket) => {

                        const statusStyle =
                          getStatusStyle(
                            ticket.status
                          );

                        return (

                          <tr
                            key={ticket.id}
                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                          >

                            {/* NOMOR */}

                            <td className="px-5 py-4">

                              <span className="text-sm font-semibold text-blue-600">
                                {getTicketNumber(
                                  ticket
                                )}
                              </span>

                            </td>

                            {/* JUDUL */}

                            <td className="px-5 py-4">

                              <p className="text-sm font-medium text-slate-700 max-w-[320px] truncate">
                                {getTicketTitle(
                                  ticket
                                )}
                              </p>

                            </td>

                            {/* TANGGAL */}

                            <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">

                              {formatDate(
                                ticket.createdAt ||
                                  ticket.created_at
                              )}

                            </td>

                            {/* STATUS */}

                            <td className="px-5 py-4">

                              <span
                                className={`inline-flex items-center gap-2 border px-2.5 py-1 rounded-md text-xs font-semibold ${statusStyle.container}`}
                              >

                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                                />

                                {getStatusLabel(
                                  ticket.status
                                )}

                              </span>

                            </td>

                          </tr>

                        );
                      })

                  )}

                </tbody>

              </table>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}
