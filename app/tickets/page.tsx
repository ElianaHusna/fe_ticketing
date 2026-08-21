"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Ticket,
  Search,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Clock3,
  CheckCircle2,
  CircleDot,
  Filter,
  X,
  Trash2,
} from "lucide-react";

import AdminSidebar from "@/components/AdminSidebar";
import { apiFetch } from "@/src/lib/api";

// =====================================================
// TYPE
// =====================================================

type TicketStatus =
  | "new"
  | "in_progress"
  | "resolved"
  | "closed";

type TicketPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

interface TicketData {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  tier: number;
  requesterName: string;
  requesterEmail: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketsResponse {
  data: TicketData[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// =====================================================
// PAGE
// =====================================================

export default function TicketsAdminPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<TicketStatus | "all">("all");

  // =====================================================
  // DELETE STATE
  // =====================================================

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // =====================================================
  // FETCH TICKETS
  // =====================================================

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response: TicketsResponse = await apiFetch(
        "/tickets?page=1&limit=100"
      );

      setTickets(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Gagal mengambil data tiket:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal memuat data tiket.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // =====================================================
  // DELETE TICKET
  // =====================================================

  const deleteTicket = async (
    ticket: TicketData
  ) => {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus tiket ${ticket.ticketNumber}?\n\nTiket yang dihapus tidak dapat dikembalikan.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(ticket.id);
      setError("");

      // Endpoint hapus:
      // DELETE /tickets/:id
      await apiFetch(`/tickets/${ticket.id}`, {
        method: "DELETE",
      });

      // Hapus langsung dari tampilan
      setTickets((currentTickets) =>
        currentTickets.filter(
          (item) => item.id !== ticket.id
        )
      );
    } catch (err) {
      console.error(
        "Gagal menghapus tiket:",
        err
      );

      if (err instanceof Error) {
        setError(
          `Gagal menghapus tiket: ${err.message}`
        );
      } else {
        setError("Gagal menghapus tiket.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // FILTER TICKETS
  // =====================================================

  const filteredTickets = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === "all" ||
        ticket.status === statusFilter;

      const matchesSearch =
        !keyword ||
        ticket.ticketNumber
          ?.toLowerCase()
          .includes(keyword) ||
        ticket.subject
          ?.toLowerCase()
          .includes(keyword) ||
        ticket.requesterName
          ?.toLowerCase()
          .includes(keyword) ||
        ticket.requesterEmail
          ?.toLowerCase()
          .includes(keyword) ||
        ticket.category
          ?.toLowerCase()
          .includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [tickets, search, statusFilter]);

  // =====================================================
  // STATISTIK
  // =====================================================

  const totalTickets = tickets.length;

  const newTickets = tickets.filter(
    (ticket) => ticket.status === "new"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) =>
      ticket.status === "in_progress"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) =>
      ticket.status === "resolved" ||
      ticket.status === "closed"
  ).length;

  // =====================================================
  // STATUS LABEL
  // =====================================================

  const getStatusLabel = (
    status: TicketStatus
  ) => {
    switch (status) {
      case "new":
        return "Baru";

      case "in_progress":
        return "Diproses";

      case "resolved":
        return "Selesai";

      case "closed":
        return "Ditutup";

      default:
        return status;
    }
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (
    status: TicketStatus
  ) => {
    switch (status) {
      case "new":
        return "bg-blue-50 text-blue-700";

      case "in_progress":
        return "bg-amber-50 text-amber-700";

      case "resolved":
        return "bg-emerald-50 text-emerald-700";

      case "closed":
        return "bg-slate-100 text-slate-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // =====================================================
  // PRIORITY CLASS
  // =====================================================

  const getPriorityClass = (
    priority: TicketPriority
  ) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700";

      case "high":
        return "bg-orange-100 text-orange-700";

      case "medium":
        return "bg-amber-100 text-amber-700";

      case "low":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // =====================================================
  // CATEGORY
  // =====================================================

  const formatCategory = (
    category: string
  ) => {
    switch (category) {
      case "technical":
        return "Teknis";

      case "billing":
        return "Billing";

      case "account":
        return "Akun";

      case "feature_request":
        return "Fitur";

      case "other":
        return "Lainnya";

      default:
        return category;
    }
  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (
    date: string
  ) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // RESET FILTER
  // =====================================================

  const resetFilter = () => {
    setSearch("");
    setStatusFilter("all");
  };

  const hasFilter =
    search.trim() !== "" ||
    statusFilter !== "all";

  // =====================================================
  // STATUS FILTER
  // =====================================================

  const statusFilters: {
    value: TicketStatus | "all";
    label: string;
  }[] = [
    {
      value: "all",
      label: "Semua",
    },
    {
      value: "new",
      label: "Baru",
    },
    {
      value: "in_progress",
      label: "Diproses",
    },
    {
      value: "resolved",
      label: "Selesai",
    },
    {
      value: "closed",
      label: "Ditutup",
    },
  ];

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f5f7fb]">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <AdminSidebar />

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="ml-64 min-h-screen">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">

          <div className="flex min-h-[82px] items-center justify-between px-8">

            <div>

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-blue-600" />

                <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                  Admin Helpdesk
                </p>

              </div>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Semua Tiket
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Kelola dan pantau seluruh tiket
                yang masuk ke sistem.
              </p>

            </div>

            <button
              type="button"
              onClick={fetchTickets}
              disabled={loading || deletingId !== null}
              className="
                flex
                h-10
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                text-sm
                font-semibold
                text-slate-600
                shadow-sm
                transition
                hover:border-slate-300
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
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

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="p-8">

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">

                <AlertTriangle
                  size={18}
                  className="text-red-600"
                />

              </div>

              <div className="flex-1">

                <p className="font-semibold text-red-700">
                  Terjadi Kesalahan
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-400 transition hover:text-red-600"
              >
                <X size={18} />
              </button>

            </div>
          )}

          {/* =================================================
              STAT CARDS
          ================================================= */}

          <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">

            {/* TOTAL */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Semua Tiket
                  </p>

                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                    {loading
                      ? "..."
                      : totalTickets}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Total tiket masuk
                  </p>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">

                  <Ticket
                    size={22}
                    className="text-blue-600"
                  />

                </div>

              </div>

            </div>

            {/* NEW */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Tiket Baru
                  </p>

                  <p className="mt-3 text-3xl font-bold tracking-tight text-blue-600">
                    {loading
                      ? "..."
                      : newTickets}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Menunggu ditangani
                  </p>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">

                  <CircleDot
                    size={22}
                    className="text-blue-600"
                  />

                </div>

              </div>

            </div>

            {/* IN PROGRESS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Sedang Diproses
                  </p>

                  <p className="mt-3 text-3xl font-bold tracking-tight text-amber-600">
                    {loading
                      ? "..."
                      : inProgressTickets}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Sedang ditangani agent
                  </p>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">

                  <Clock3
                    size={22}
                    className="text-amber-600"
                  />

                </div>

              </div>

            </div>

            {/* RESOLVED */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Tiket Selesai
                  </p>

                  <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-600">
                    {loading
                      ? "..."
                      : resolvedTickets}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Selesai atau ditutup
                  </p>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">

                  <CheckCircle2
                    size={22}
                    className="text-emerald-600"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              FILTER
          ================================================= */}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              {/* SEARCH */}

              <div className="relative w-full xl:max-w-md">

                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Cari nomor tiket, subject, nama, email..."
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    pl-11
                    pr-10
                    text-sm
                    text-slate-700
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-blue-400
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-50
                  "
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}

              </div>

              {/* STATUS FILTER */}

              <div className="flex flex-wrap items-center gap-2">

                <div className="mr-1 flex items-center gap-2 text-sm font-medium text-slate-500">

                  <Filter size={16} />

                  Status:

                </div>

                {statusFilters.map(
                  (filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() =>
                        setStatusFilter(
                          filter.value
                        )
                      }
                      className={`
                        rounded-xl
                        px-3.5
                        py-2
                        text-xs
                        font-semibold
                        transition
                        ${
                          statusFilter ===
                          filter.value
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }
                      `}
                    >
                      {filter.label}
                    </button>
                  )
                )}

              </div>

            </div>

            {hasFilter && (
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

                <p className="text-xs text-slate-500">

                  Menampilkan{" "}

                  <span className="font-bold text-slate-700">
                    {filteredTickets.length}
                  </span>{" "}

                  dari{" "}

                  <span className="font-bold text-slate-700">
                    {tickets.length}
                  </span>{" "}

                  tiket

                </p>

                <button
                  type="button"
                  onClick={resetFilter}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Reset filter
                </button>

              </div>
            )}

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">

            {/* TABLE HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="text-base font-bold text-slate-900">
                    Daftar Tiket
                  </h2>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
                    {filteredTickets.length}
                  </span>

                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Seluruh tiket yang masuk ke sistem
                </p>

              </div>

            </div>

            {/* LOADING */}

            {loading ? (
              <div className="py-24 text-center">

                <RefreshCw
                  size={28}
                  className="mx-auto animate-spin text-blue-600"
                />

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Memuat tiket...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Mengambil data dari server
                </p>

              </div>

            ) : filteredTickets.length === 0 ? (
              <div className="py-24 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                  <Ticket
                    size={30}
                    className="text-slate-300"
                  />

                </div>

                <p className="mt-5 font-semibold text-slate-600">
                  Tidak ada tiket
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {hasFilter
                    ? "Tidak ada tiket yang sesuai dengan filter."
                    : "Belum ada tiket yang masuk ke sistem."}
                </p>

                {hasFilter && (
                  <button
                    type="button"
                    onClick={resetFilter}
                    className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Reset Filter
                  </button>
                )}

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1200px]">

                  <thead>

                    <tr className="border-b border-slate-200 bg-slate-50/70">

                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Tiket
                      </th>

                      <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Pelapor
                      </th>

                      <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Kategori
                      </th>

                      <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Prioritas
                      </th>

                      <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Tanggal
                      </th>

                      <th className="px-4 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Aksi
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredTickets.map(
                      (ticket) => {

                        const isDeleting =
                          deletingId === ticket.id;

                        return (
                          <tr
                            key={ticket.id}
                            className="group border-b border-slate-100 transition last:border-b-0 hover:bg-blue-50/30"
                          >

                            {/* TICKET */}

                            <td className="px-6 py-4">

                              <Link
                                href={`/tickets/${ticket.id}`}
                                className="block"
                              >

                                <p className="text-xs font-bold text-blue-600">
                                  {ticket.ticketNumber}
                                </p>

                                <p className="mt-1 max-w-[280px] truncate text-sm font-semibold text-slate-800">
                                  {ticket.subject}
                                </p>

                              </Link>

                            </td>

                            {/* REQUESTER */}

                            <td className="px-4 py-4">

                              <p className="max-w-[180px] truncate text-sm font-semibold text-slate-700">
                                {ticket.requesterName}
                              </p>

                              <p className="mt-1 max-w-[200px] truncate text-xs text-slate-400">
                                {ticket.requesterEmail}
                              </p>

                            </td>

                            {/* CATEGORY */}

                            <td className="px-4 py-4">

                              <span className="inline-flex rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                {formatCategory(
                                  ticket.category
                                )}
                              </span>

                            </td>

                            {/* PRIORITY */}

                            <td className="px-4 py-4">

                              <span
                                className={`
                                  inline-flex
                                  rounded-full
                                  px-2.5
                                  py-1
                                  text-[11px]
                                  font-bold
                                  uppercase
                                  ${getPriorityClass(
                                    ticket.priority
                                  )}
                                `}
                              >
                                {ticket.priority}
                              </span>

                            </td>

                            {/* STATUS */}

                            <td className="px-4 py-4">

                              <span
                                className={`
                                  inline-flex
                                  rounded-full
                                  px-2.5
                                  py-1
                                  text-[11px]
                                  font-semibold
                                  ${getStatusClass(
                                    ticket.status
                                  )}
                                `}
                              >
                                {getStatusLabel(
                                  ticket.status
                                )}
                              </span>

                            </td>

                            {/* DATE */}

                            <td className="px-4 py-4">

                              <p className="text-xs font-medium text-slate-600">
                                {formatDate(
                                  ticket.createdAt
                                )}
                              </p>

                              <p className="mt-1 text-[11px] text-slate-400">
                                {ticket.source}
                              </p>

                            </td>

                            {/* ACTION */}

                            <td className="px-4 py-4">

                              <div className="flex items-center justify-end gap-2">

                                {/* DETAIL */}

                                <Link
                                  href={`/tickets/${ticket.id}`}
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1
                                    rounded-xl
                                    bg-slate-100
                                    px-3
                                    py-2
                                    text-xs
                                    font-semibold
                                    text-slate-600
                                    transition
                                    hover:bg-blue-600
                                    hover:text-white
                                  "
                                >
                                  Detail

                                  <ChevronRight
                                    size={14}
                                  />

                                </Link>

                                {/* DELETE */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteTicket(
                                      ticket
                                    )
                                  }
                                  disabled={
                                    isDeleting ||
                                    deletingId !== null
                                  }
                                  title="Hapus tiket"
                                  className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-red-50
                                    px-3
                                    py-2
                                    text-xs
                                    font-semibold
                                    text-red-600
                                    transition
                                    hover:bg-red-600
                                    hover:text-white
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                  "
                                >

                                  {isDeleting ? (
                                    <RefreshCw
                                      size={15}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2
                                      size={15}
                                    />
                                  )}

                                </button>

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      </main>

    </div>
  );
}