"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/src/lib/api";
import {
  Search,
  Clock3,
  CheckCircle2,
  CalendarDays,
  UserRound,
  Ticket,
  Mail,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  List,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

type TicketActivity = {
  id?: string | number;
  status?: string;
  message?: string;
  description?: string;
  createdAt?: string;
  created_at?: string;
};

type TicketData = {
  id?: string | number;
  ticket_number?: string;
  ticketNumber?: string;

  requesterName?: string;
  requester_name?: string;

  requesterEmail?: string;
  requester_email?: string;

  subject?: string;
  description?: string;

  category?: string;
  priority?: string;
  status?: string;

  createdAt?: string;
  created_at?: string;

  assignedTo?: string;
  assigned_to?: string;

  history?: TicketActivity[];
};

type UserData = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
};

type ActiveTab = "search" | "mine";

export default function TrackingPage() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>("mine");
  const [ticketNumber, setTicketNumber] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [myTickets, setMyTickets] = useState<TicketData[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMyTickets, setLoadingMyTickets] = useState(false);
  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");

  // ==========================================
  // AMBIL USER LOGIN
  // ==========================================

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        return;
      }

      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      if (parsedUser?.email) {
        setRequesterEmail(parsedUser.email);
      }
    } catch (err) {
      console.error("Gagal mengambil user:", err);
    }
  }, []);

  // ==========================================
  // LOAD TIKET SAYA
  // ==========================================

  useEffect(() => {
    if (activeTab === "mine") {
      loadMyTickets();
    }
  }, [activeTab]);

  const loadMyTickets = async () => {
    try {
      setLoadingMyTickets(true);
      setError("");

      const result = await apiFetch("/tickets?page=1&limit=100");

      console.log("Semua tiket dari backend:", result);

      const tickets: TicketData[] = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : [];

      let loggedInEmail = user?.email || "";

      if (!loggedInEmail) {
        try {
          const savedUser = localStorage.getItem("user");

          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            loggedInEmail = parsedUser?.email || "";
          }
        } catch (err) {
          console.error("Gagal membaca user:", err);
        }
      }

      if (loggedInEmail) {
        const filteredTickets = tickets.filter((item) => {
          const email = item.requesterEmail || item.requester_email || "";
          return email.toLowerCase().trim() === loggedInEmail.toLowerCase().trim();
        });

        setMyTickets(filteredTickets);
      } else {
        setMyTickets([]);
      }
    } catch (err) {
      console.error("Gagal mengambil tiket:", err);
      setError(err instanceof Error ? err.message : "Gagal mengambil daftar tiket.");
    } finally {
      setLoadingMyTickets(false);
    }
  };

  // ==========================================
  // CARI TIKET - LANGSUNG KE HALAMAN DETAIL
  // ==========================================

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSearchError("");

    if (!ticketNumber.trim()) {
      setSearchError("Nomor tiket wajib diisi.");
      return;
    }

    if (!requesterEmail.trim()) {
      setSearchError("Email wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      const result = await apiFetch(
        `/tickets/track?ticketNumber=${encodeURIComponent(
          ticketNumber.trim()
        )}&requesterEmail=${encodeURIComponent(requesterEmail.trim())}`
      );

      console.log("Tracking response:", result);

      if (!result) {
        throw new Error("Data tiket tidak ditemukan.");
      }

      // LANGSUNG PINDAH KE HALAMAN DETAIL
      router.push(`/tracking/${ticketNumber.trim()}`);
      
    } catch (err) {
      console.error("Tracking error:", err);
      setSearchError(err instanceof Error ? err.message : "Tiket tidak ditemukan.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PINDAH KE HALAMAN DETAIL TIKET
  // ==========================================

  const goToTicketDetail = (ticketNumber: string) => {
    router.push(`/tracking/${ticketNumber}`);
  };

  // ==========================================
  // STATUS LABEL
  // ==========================================

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "new":
        return "Tiket Baru";
      case "in_progress":
        return "Sedang Diproses";
      case "waiting_reply":
        return "Menunggu Balasan";
      case "escalated":
        return "Diteruskan";
      case "resolved":
        return "Selesai";
      case "closed":
        return "Ditutup";
      default:
        return status || "Tidak Diketahui";
    }
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case "new":
        return {
          badge: "bg-blue-50 border-blue-200 text-blue-700",
          dot: "bg-blue-500",
        };
      case "in_progress":
        return {
          badge: "bg-amber-50 border-amber-200 text-amber-700",
          dot: "bg-amber-500",
        };
      case "waiting_reply":
        return {
          badge: "bg-purple-50 border-purple-200 text-purple-700",
          dot: "bg-purple-500",
        };
      case "escalated":
        return {
          badge: "bg-red-50 border-red-200 text-red-700",
          dot: "bg-red-500",
        };
      case "resolved":
      case "closed":
        return {
          badge: "bg-emerald-50 border-emerald-200 text-emerald-700",
          dot: "bg-emerald-500",
        };
      default:
        return {
          badge: "bg-slate-50 border-slate-200 text-slate-600",
          dot: "bg-slate-400",
        };
    }
  };

  // ==========================================
  // PRIORITY
  // ==========================================

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case "low":
        return "Rendah";
      case "medium":
        return "Sedang";
      case "high":
        return "Tinggi";
      case "urgent":
        return "Urgent";
      default:
        return priority || "-";
    }
  };

  // ==========================================
  // CATEGORY
  // ==========================================

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case "technical":
        return "Teknis";
      case "billing":
        return "Billing";
      case "account":
        return "Akun";
      case "feature_request":
        return "Permintaan Fitur";
      case "other":
        return "Lainnya";
      default:
        return category || "-";
    }
  };

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date?: string) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        <Navbar />

        <div className="p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* ==============================
                HEADER
            ============================== */}

            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                <span>Dashboard</span>
                <ArrowRight size={14} />
                <span className="text-blue-600 font-medium">Tracking</span>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                      <Search size={22} className="text-white" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-blue-600">Tracking Tiket</p>
                      <h1 className="text-3xl font-bold text-slate-900">Tiket Anda</h1>
                    </div>
                  </div>

                  <p className="text-slate-500">Cari tiket atau lihat seluruh tiket yang pernah Anda buat.</p>
                </div>

                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                  <ShieldCheck size={18} className="text-emerald-500" />

                  <div>
                    <p className="text-xs text-slate-400">Akun</p>
                    <p className="text-sm font-semibold text-slate-700">{user?.email || "Pengguna"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ==============================
                TAB
            ============================== */}

            <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm mb-6">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("mine");
                    setError("");
                    setSearchError("");
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    activeTab === "mine"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <List size={18} />
                  Tiket Saya
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("search");
                    setError("");
                    setSearchError("");
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    activeTab === "search"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Search size={18} />
                  Cari Tiket
                </button>
              </div>
            </div>

            {/* ==============================
                TIKET SAYA
            ============================== */}

            {activeTab === "mine" && (
              <div className="space-y-6">
                {/* Header */}

                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Daftar Tiket</p>
                      <h2 className="text-xl font-bold text-slate-800 mt-1">Semua Tiket Saya</h2>
                      <p className="text-sm text-slate-500 mt-1">Daftar tiket yang dibuat menggunakan akun Anda.</p>
                    </div>

                    <button
                      type="button"
                      onClick={loadMyTickets}
                      disabled={loadingMyTickets}
                      className="w-fit flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
                    >
                      <RefreshCw size={16} className={loadingMyTickets ? "animate-spin" : ""} />
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Error */}

                {error && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                    <AlertCircle size={19} className="text-red-500 mt-0.5 shrink-0" />

                    <div>
                      <p className="text-sm font-semibold text-red-700">Gagal mengambil tiket</p>
                      <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* Loading */}

                {loadingMyTickets && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                    <RefreshCw size={28} className="mx-auto text-blue-600 animate-spin" />
                    <p className="text-sm font-semibold text-slate-700 mt-4">Mengambil tiket Anda...</p>
                    <p className="text-xs text-slate-400 mt-1">Mohon tunggu sebentar.</p>
                  </div>
                )}

                {/* Empty */}

                {!loadingMyTickets && !error && myTickets.length === 0 && (
                  <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-12 text-center">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
                      <Ticket size={32} className="text-blue-600" />
                    </div>

                    <h3 className="text-xl font-bold text-slate-800">Belum ada tiket</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
                      Anda belum memiliki tiket yang terdaftar menggunakan email akun ini.
                    </p>
                  </div>
                )}

                {/* List Tiket */}

                {!loadingMyTickets && myTickets.length > 0 && (
                  <div className="space-y-4">
                    {myTickets.map((item, index) => {
                      const number = item.ticket_number || item.ticketNumber || `Tiket #${index + 1}`;
                      const statusStyle = getStatusStyle(item.status);
                      const title = item.subject || "Tanpa Judul";
                      const email = item.requesterEmail || item.requester_email || "";
                      const created = item.createdAt || item.created_at;

                      return (
                        <button
                          type="button"
                          key={item.id ?? `${number}-${index}`}
                          onClick={() => goToTicketDetail(number)}
                          className="w-full text-left bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                        >
                          <div className="p-5 lg:p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                              {/* Left */}

                              <div className="flex gap-4 min-w-0">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                                  <Ticket size={21} className="text-blue-600 group-hover:text-white transition-colors" />
                                </div>

                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-bold text-blue-600">{number}</p>

                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${statusStyle.badge}`}
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                                      {getStatusLabel(item.status)}
                                    </span>
                                  </div>

                                  <h3 className="text-base font-bold text-slate-800 mt-2 truncate">{title}</h3>

                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                    <span className="text-xs text-slate-400">{getCategoryLabel(item.category)}</span>
                                    <span className="text-xs text-slate-300">•</span>
                                    <span className="text-xs text-slate-400">Prioritas {getPriorityLabel(item.priority)}</span>

                                    {created && (
                                      <>
                                        <span className="text-xs text-slate-300">•</span>
                                        <span className="text-xs text-slate-400">{formatDate(created)}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right */}

                              <div className="flex items-center justify-between lg:justify-end gap-4 pl-16 lg:pl-0">
                                <div className="hidden sm:block text-right">
                                  <p className="text-xs text-slate-400">Pelapor</p>
                                  <p className="text-xs font-medium text-slate-600 mt-1">{email}</p>
                                </div>

                                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                  <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ==============================
                CARI TIKET
            ============================== */}

            {activeTab === "search" && (
              <div className="space-y-6">
                <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-sm">
                  <div className="absolute -right-20 -top-20 w-52 h-52 rounded-full bg-blue-50" />

                  <div className="relative p-6 lg:p-7">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Search size={21} className="text-blue-600" />
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Cari Tiket</h2>
                        <p className="text-sm text-slate-500 mt-1">Masukkan nomor tiket dan email untuk melihat detail tiket.</p>
                      </div>
                    </div>

                    <form onSubmit={handleSearch}>
                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-4">
                        {/* Nomor */}

                        <div>
                          <label htmlFor="ticketNumber" className="block text-sm font-semibold text-slate-700 mb-2">
                            Nomor Tiket
                          </label>

                          <div className="relative">
                            <Ticket size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                            <input
                              id="ticketNumber"
                              type="text"
                              value={ticketNumber}
                              onChange={(e) => setTicketNumber(e.target.value)}
                              placeholder="Contoh: TCK-20260813-001"
                              disabled={loading}
                              className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                            />
                          </div>
                        </div>

                        {/* Email */}

                        <div>
                          <label htmlFor="requesterEmail" className="block text-sm font-semibold text-slate-700 mb-2">
                            Email Pelapor
                          </label>

                          <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                            <input
                              id="requesterEmail"
                              type="email"
                              value={requesterEmail}
                              onChange={(e) => setRequesterEmail(e.target.value)}
                              placeholder="nama@email.com"
                              disabled={loading}
                              className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                            />
                          </div>
                        </div>

                        {/* Button */}

                        <div className="flex items-end">
                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full lg:w-auto h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                          >
                            {loading ? (
                              <>
                                <RefreshCw size={18} className="animate-spin" />
                                Mencari...
                              </>
                            ) : (
                              <>
                                <Search size={18} />
                                Cari
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Error */}

                      {searchError && (
                        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                          <AlertCircle size={19} className="text-red-500 shrink-0" />

                          <div>
                            <p className="text-sm font-semibold text-red-700">Pencarian gagal</p>
                            <p className="text-sm text-red-600 mt-1">{searchError}</p>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </div>

                {/* Search Empty */}

                {!searchError && (
                  <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-12 text-center">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
                      <Search size={32} className="text-blue-600" />
                    </div>

                    <h2 className="text-xl font-bold text-slate-800">Cari tiket Anda</h2>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
                      Gunakan nomor tiket yang Anda terima setelah membuat laporan.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}