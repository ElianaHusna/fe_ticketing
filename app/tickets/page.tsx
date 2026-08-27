"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Ticket,
  Search,
  RefreshCw,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  CircleDot,
  X,
  Trash2,
  LayoutGrid,
  List,
  Eye,
  Server,
  Check,
  FileSpreadsheet,
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
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");
  // ✅ DIUBAH: default dari "kanban" menjadi "table"
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
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
      console.error("Gagal mengambil data tiket:", err);
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

  const deleteTicket = async (ticket: TicketData) => {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus tiket ${ticket.ticketNumber}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(ticket.id);
      setError("");

      await apiFetch(`/tickets/${ticket.id}`, {
        method: "DELETE",
      });

      setTickets((currentTickets) =>
        currentTickets.filter((item) => item.id !== ticket.id)
      );
    } catch (err) {
      console.error("Gagal menghapus tiket:", err);
      if (err instanceof Error) {
        setError(`Gagal menghapus tiket: ${err.message}`);
      } else {
        setError("Gagal menghapus tiket.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // EXPORT CSV
  // =====================================================

  const exportToCSV = () => {
    try {
      const dataToExport = filteredTickets.length > 0 ? filteredTickets : tickets;

      if (dataToExport.length === 0) {
        alert("Tidak ada data tiket untuk diekspor.");
        return;
      }

      const headers = [
        "No. Tiket",
        "Judul",
        "Pelapor",
        "Email",
        "Kategori",
        "Prioritas",
        "Status",
        "Tanggal Dibuat",
        "Sumber",
      ];

      const rows = dataToExport.map((ticket) => [
        ticket.ticketNumber,
        `"${ticket.subject.replace(/"/g, '""')}"`,
        `"${ticket.requesterName.replace(/"/g, '""')}"`,
        ticket.requesterEmail,
        formatCategory(ticket.category),
        getPriorityLabel(ticket.priority),
        getStatusLabel(ticket.status),
        new Date(ticket.createdAt).toLocaleString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        ticket.source || "Web",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `tickets_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`Berhasil mengekspor ${dataToExport.length} tiket ke CSV!`);
    } catch (err) {
      console.error("Gagal ekspor CSV:", err);
      alert("Gagal mengekspor data. Silakan coba lagi.");
    }
  };

  // =====================================================
  // FILTER TICKETS
  // =====================================================

  const filteredTickets = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === "all" ||
        ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        ticket.priority === priorityFilter;

      const matchesSearch =
        !keyword ||
        ticket.ticketNumber?.toLowerCase().includes(keyword) ||
        ticket.subject?.toLowerCase().includes(keyword) ||
        ticket.requesterName?.toLowerCase().includes(keyword) ||
        ticket.requesterEmail?.toLowerCase().includes(keyword) ||
        ticket.category?.toLowerCase().includes(keyword);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  // =====================================================
  // HELPERS
  // =====================================================

  const getStatusLabel = (status: TicketStatus) => {
    const map = {
      new: "Belum Dilihat",
      in_progress: "Diproses",
      resolved: "Selesai",
      closed: "Ditutup",
    };
    return map[status] || status;
  };

  const getStatusColor = (status: TicketStatus) => {
    const map = {
      new: "bg-blue-500",
      in_progress: "bg-amber-500",
      resolved: "bg-emerald-500",
      closed: "bg-gray-400",
    };
    return map[status] || "bg-gray-400";
  };

  const getStatusBg = (status: TicketStatus) => {
    const map = {
      new: "bg-blue-50 border-blue-200 text-blue-700",
      in_progress: "bg-amber-50 border-amber-200 text-amber-700",
      resolved: "bg-emerald-50 border-emerald-200 text-emerald-700",
      closed: "bg-gray-50 border-gray-200 text-gray-600",
    };
    return map[status] || "bg-gray-50 border-gray-200 text-gray-600";
  };

  const getPriorityLabel = (priority: TicketPriority) => {
    const map = {
      urgent: "Sangat Tinggi",
      high: "Tinggi",
      medium: "Sedang",
      low: "Rendah",
    };
    return map[priority] || priority;
  };

  const getPriorityColor = (priority: TicketPriority) => {
    const map = {
      urgent: "text-red-600 bg-red-50",
      high: "text-orange-600 bg-orange-50",
      medium: "text-amber-600 bg-amber-50",
      low: "text-gray-500 bg-gray-50",
    };
    return map[priority] || "text-gray-500 bg-gray-50";
  };

  const formatCategory = (category: string) => {
    const map: Record<string, string> = {
      technical: "Teknis",
      billing: "Billing",
      account: "Akun",
      feature_request: "Fitur",
      other: "Lainnya",
    };
    return map[category] || category;
  };

  const formatDate = (date: string) => {
    if (!date) return "-";
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    
    if (diff < 1) return "Baru saja";
    if (diff < 24) return `${diff} jam lalu`;
    if (diff < 48) return "Kemarin";
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const resetFilter = () => {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  const hasFilter = search.trim() !== "" || statusFilter !== "all" || priorityFilter !== "all";

  const kanbanColumns = [
    { id: "new", label: "Belum Dilihat", icon: CircleDot, color: "blue", desc: "Menunggu untuk dilihat" },
    { id: "in_progress", label: "Diproses", icon: Clock3, color: "amber", desc: "Dalam troubleshooting" },
    { id: "resolved", label: "Selesai", icon: CheckCircle2, color: "emerald", desc: "Telah diselesaikan" },
    { id: "closed", label: "Ditutup", icon: Check, color: "gray", desc: "Dokumentasi" },
  ];

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      <AdminSidebar />

      <main className="ml-64 min-h-screen">

        {/* =================================================
            HEADER - CLEAN & MINIMALIS
        ================================================= */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-30">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/25">
                  <Server size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    Manajemen Tiket
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Kelola semua tiket layanan IT
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={fetchTickets}
                  disabled={loading}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all duration-200 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>
                <div className="w-px h-6 bg-slate-200" />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/60">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-600/20">
                    AD
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Admin</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}
        <div className="p-6">

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200/80 bg-red-50/80 backdrop-blur-sm px-5 py-3.5 shadow-sm">
              <AlertTriangle size={17} className="text-red-500" />
              <p className="text-sm text-red-600 flex-1 font-medium">{error}</p>
              <button
                type="button"
                onClick={() => setError("")}
                className="p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-100 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* =================================================
              TOOLBAR - MINIMALIS & ELEGAN
          ================================================= */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-4 mb-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 flex-1 bg-slate-50/80 rounded-xl px-4 py-2 border border-slate-200/60 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20 transition-all">
                <Search size="17" className="text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari tiket..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
                  >
                    <X size="14" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TicketStatus | "all")}
                  className="px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-white text-slate-600 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="new">Belum Dilihat</option>
                  <option value="in_progress">Diproses</option>
                  <option value="resolved">Selesai</option>
                  <option value="closed">Ditutup</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | "all")}
                  className="px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-white text-slate-600 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all cursor-pointer"
                >
                  <option value="all">Semua Prioritas</option>
                  <option value="urgent">Sangat Tinggi</option>
                  <option value="high">Tinggi</option>
                  <option value="medium">Sedang</option>
                  <option value="low">Rendah</option>
                </select>

                <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setViewMode("kanban")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "kanban"
                        ? "bg-white shadow-sm text-blue-600 ring-1 ring-blue-200"
                        : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                    }`}
                  >
                    <LayoutGrid size="15" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "table"
                        ? "bg-white shadow-sm text-blue-600 ring-1 ring-blue-200"
                        : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                    }`}
                  >
                    <List size="15" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={exportToCSV}
                  disabled={tickets.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-600/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileSpreadsheet size="15" />
                  CSV
                </button>
              </div>
            </div>

            {hasFilter && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/60">
                <p className="text-xs text-slate-500">
                  Menampilkan <span className="font-bold text-slate-700">{filteredTickets.length}</span> dari <span className="font-bold text-slate-700">{tickets.length}</span> tiket
                </p>
                <button
                  type="button"
                  onClick={resetFilter}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>

          {/* =================================================
              KANBAN VIEW
          ================================================= */}
          {viewMode === "kanban" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {kanbanColumns.map((column) => {
                const Icon = column.icon;
                const columnTickets = filteredTickets.filter(
                  (t) => t.status === column.id
                );

                return (
                  <div
                    key={column.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className={`px-4 py-3.5 border-b border-slate-200/60 bg-${column.color}-50/40`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Icon size="16" className={`text-${column.color}-600`} />
                          <h3 className="font-bold text-slate-800 text-sm">
                            {column.label}
                          </h3>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-${column.color}-100 text-${column.color}-700 shadow-sm`}>
                          {columnTickets.length}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">{column.desc}</p>
                    </div>

                    <div className="p-3 space-y-3 max-h-[550px] overflow-y-auto custom-scrollbar">
                      {loading ? (
                        <div className="py-8 text-center">
                          <RefreshCw size="18" className="mx-auto animate-spin text-blue-500" />
                        </div>
                      ) : columnTickets.length === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-xs text-slate-400 font-medium">Tidak ada tiket</p>
                        </div>
                      ) : (
                        columnTickets.map((ticket) => {
                          const priorityColor = getPriorityColor(ticket.priority);
                          const isDeleting = deletingId === ticket.id;

                          return (
                            <div
                              key={ticket.id}
                              className="group bg-white rounded-xl border border-slate-200/80 p-4 hover:shadow-lg hover:border-blue-300/50 transition-all duration-300"
                            >
                              <Link href={`/tickets/${ticket.id}`} className="block">
                                <p className="text-[10px] font-bold text-blue-600 tracking-wide">
                                  {ticket.ticketNumber}
                                </p>
                                <p className="mt-1.5 text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
                                  {ticket.subject}
                                </p>
                                <p className="mt-1 text-[10px] text-slate-400 font-medium truncate">
                                  {ticket.requesterName}
                                </p>
                              </Link>

                              <div className="mt-3 flex items-center justify-between">
                                <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full ${priorityColor} shadow-sm`}>
                                  {getPriorityLabel(ticket.priority)}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {formatDate(ticket.createdAt)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => deleteTicket(ticket)}
                                    disabled={isDeleting}
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                  >
                                    {isDeleting ? (
                                      <RefreshCw size="11" className="animate-spin" />
                                    ) : (
                                      <Trash2 size="11" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* =================================================
              TABLE VIEW
          ================================================= */}
          {viewMode === "table" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200/60 bg-slate-50/80">
                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Tiket
                      </th>
                      <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Pelapor
                      </th>
                      <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Prioritas
                      </th>
                      <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Tanggal
                      </th>
                      <th className="px-4 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center">
                          <RefreshCw size="24" className="mx-auto animate-spin text-blue-600" />
                          <p className="mt-3 text-sm text-slate-500 font-medium">Memuat data...</p>
                        </td>
                      </tr>
                    ) : filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center">
                          <Ticket size="28" className="mx-auto text-slate-300" />
                          <p className="mt-3 text-sm text-slate-500 font-medium">Tidak ada tiket ditemukan</p>
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map((ticket) => {
                        const isDeleting = deletingId === ticket.id;
                        const statusBg = getStatusBg(ticket.status);
                        const priorityColor = getPriorityColor(ticket.priority);

                        return (
                          <tr
                            key={ticket.id}
                            className="border-b border-slate-100/80 hover:bg-blue-50/40 transition-all duration-200 group"
                          >
                            <td className="px-5 py-4">
                              <Link href={`/tickets/${ticket.id}`} className="block">
                                <p className="text-[10px] font-bold text-blue-600 tracking-wide">
                                  {ticket.ticketNumber}
                                </p>
                                <p className="mt-0.5 text-sm font-semibold text-slate-800 max-w-[220px] truncate">
                                  {ticket.subject}
                                </p>
                              </Link>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm font-semibold text-slate-700">
                                {ticket.requesterName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {ticket.requesterEmail}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${priorityColor} shadow-sm`}>
                                {getPriorityLabel(ticket.priority)}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border ${statusBg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(ticket.status)}`} />
                                {getStatusLabel(ticket.status)}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm text-slate-500 font-medium">
                                {formatDate(ticket.createdAt)}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <Link
                                  href={`/tickets/${ticket.id}`}
                                  className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                >
                                  <Eye size="15" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => deleteTicket(ticket)}
                                  disabled={isDeleting}
                                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                                >
                                  {isDeleting ? (
                                    <RefreshCw size="15" className="animate-spin" />
                                  ) : (
                                    <Trash2 size="15" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {!loading && filteredTickets.length > 0 && (
                <div className="border-t border-slate-200/60 px-5 py-3 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium">
                    Menampilkan {filteredTickets.length} dari {tickets.length} tiket
                  </span>
                  <button
                    type="button"
                    onClick={exportToCSV}
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-all duration-200"
                  >
                    <FileSpreadsheet size="15" />
                    Ekspor CSV
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}