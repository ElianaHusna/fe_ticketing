"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/src/lib/api";

import {
  ArrowLeft,
  Ticket,
  Clock3,
  CheckCircle2,
  CalendarDays,
  UserRound,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  MessageSquareText,
  ClipboardCheck,
  Paperclip,
} from "lucide-react";

// =====================================================
// TYPE
// =====================================================

type TicketActivity = {
  id?: string | number;
  type?: string;
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
  title?: string;
  ticketSubject?: string;
  ticket_subject?: string;
  description?: string;
  priority?: string;
  status?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  assignedTo?: string;
  assigned_to?: string;
  feedback?: string;
  adminFeedback?: string;
  admin_feedback?: string;

  attachments?: {
    id?: string | number;
    fileName?: string;
    file_name?: string;
    url?: string;
    fileUrl?: string;
    file_url?: string;
  }[];

  history?: TicketActivity[];
  activities?: TicketActivity[];
  timeline?: TicketActivity[];
};

// =====================================================
// STATUS CONFIG
// =====================================================

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    badge: string;
    dot: string;
  }
> = {
  new: {
    label: "Tiket Baru",
    badge: "bg-blue-50 border-blue-200 text-blue-700",
    dot: "bg-blue-500",
  },
  in_progress: {
    label: "Sedang Diproses",
    badge: "bg-amber-50 border-amber-200 text-amber-700",
    dot: "bg-amber-500",
  },
  waiting_reply: {
    label: "Menunggu Balasan",
    badge: "bg-purple-50 border-purple-200 text-purple-700",
    dot: "bg-purple-500",
  },
  escalated: {
    label: "Diteruskan",
    badge: "bg-red-50 border-red-200 text-red-700",
    dot: "bg-red-500",
  },
  resolved: {
    label: "Selesai",
    badge: "bg-emerald-50 border-emerald-200 text-emerald-700",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "Ditutup",
    badge: "bg-slate-100 border-slate-200 text-slate-700",
    dot: "bg-slate-500",
  },
};

// =====================================================
// STATUS HELPER
// =====================================================

const getStatusConfig = (status?: string) => {
  const normalized = status?.toLowerCase() || "";

  return (
    STATUS_CONFIG[normalized] || {
      label: status || "Tidak Diketahui",
      badge: "bg-slate-50 border-slate-200 text-slate-600",
      dot: "bg-slate-400",
    }
  );
};

// =====================================================
// PRIORITY
// =====================================================

const getPriorityLabel = (priority?: string) => {
  const labels: Record<string, string> = {
    low: "Rendah",
    medium: "Sedang",
    high: "Tinggi",
    urgent: "Urgent",
  };

  return labels[priority?.toLowerCase() || ""] || priority || "-";
};

const getPriorityClass = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case "urgent":
      return "bg-red-50 border-red-200 text-red-700";
    case "high":
      return "bg-orange-50 border-orange-200 text-orange-700";
    case "medium":
      return "bg-amber-50 border-amber-200 text-amber-700";
    case "low":
      return "bg-slate-50 border-slate-200 text-slate-600";
    default:
      return "bg-slate-50 border-slate-200 text-slate-600";
  }
};

// =====================================================
// DATE
// =====================================================

const formatDate = (date?: string) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// =====================================================
// MAIN
// =====================================================

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();

  const ticketNumber = params?.id as string;

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH TICKET
  // =====================================================

  const fetchTicketDetail = async () => {
    try {
      setLoading(true);
      setError("");

      let userEmail = "";

      try {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          userEmail = parsedUser?.email || "";
        }
      } catch (err) {
        console.error("Gagal membaca user:", err);
      }

      if (!userEmail) {
        throw new Error(
          "Email pengguna tidak ditemukan. Silakan login kembali."
        );
      }

      const result = await apiFetch(
        `/tickets/track?ticketNumber=${encodeURIComponent(
          ticketNumber
        )}&requesterEmail=${encodeURIComponent(userEmail)}`
      );

      console.log("DETAIL TIKET USER:", result);

      const rawTicket = result?.data || result?.ticket || result;

      if (!rawTicket) {
        throw new Error("Tiket tidak ditemukan.");
      }

      const normalizedTicket: TicketData = {
        ...rawTicket,

        history:
          rawTicket.history ||
          rawTicket.activities ||
          rawTicket.timeline ||
          [],

        subject:
          rawTicket.subject ||
          rawTicket.title ||
          rawTicket.ticketSubject ||
          rawTicket.ticket_subject ||
          "",

        requesterName:
          rawTicket.requesterName || rawTicket.requester_name || "",

        requesterEmail:
          rawTicket.requesterEmail || rawTicket.requester_email || "",

        createdAt: rawTicket.createdAt || rawTicket.created_at || "",

        updatedAt: rawTicket.updatedAt || rawTicket.updated_at || "",

        assignedTo: rawTicket.assignedTo || rawTicket.assigned_to || "",

        feedback:
          rawTicket.feedback ||
          rawTicket.adminFeedback ||
          rawTicket.admin_feedback ||
          "",

        attachments: rawTicket.attachments || [],
      };

      console.log("TIKET NORMALIZED:", normalizedTicket);
      console.log("HISTORY DATA:", normalizedTicket.history);

      setTicket(normalizedTicket);
    } catch (err) {
      console.error("Gagal mengambil detail tiket:", err);

      setError(
        err instanceof Error ? err.message : "Gagal mengambil detail tiket."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (ticketNumber) {
      fetchTicketDetail();
    }
  }, [ticketNumber]);

  // =====================================================
  // DISPLAY VALUES
  // =====================================================

  const displaySubject =
    ticket?.subject?.trim() ||
    ticket?.title?.trim() ||
    ticket?.ticketSubject?.trim() ||
    ticket?.ticket_subject?.trim() ||
    "Judul tiket tidak tersedia";

  const displayTicketNumber =
    ticket?.ticketNumber || ticket?.ticket_number || ticketNumber;

  const displayRequester =
    ticket?.requesterName || ticket?.requester_name || "Pelapor";

  const displayEmail = ticket?.requesterEmail || ticket?.requester_email || "-";

  const displayPriority = getPriorityLabel(ticket?.priority);

  const displayFeedback =
    ticket?.feedback ||
    ticket?.adminFeedback ||
    ticket?.admin_feedback ||
    "";

  const statusConfig = getStatusConfig(ticket?.status);

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const renderStatusBadge = () => {
    return (
      <span
        className={`
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          px-3
          py-1.5
          text-xs
          font-bold
          ${statusConfig.badge}
        `}
      >
        <span
          className={`
            h-1.5
            w-1.5
            rounded-full
            ${statusConfig.dot}
          `}
        />

        {statusConfig.label}
      </span>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <main className="ml-64 min-h-screen">
          <Navbar />

          <div className="p-6 lg:p-8">
            <div className="mx-auto max-w-6xl">
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <RefreshCw
                  size={30}
                  className="mx-auto animate-spin text-blue-600"
                />

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Memuat detail tiket...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Mohon tunggu sebentar.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <main className="ml-64 min-h-screen">
          <Navbar />

          <div className="p-6 lg:p-8">
            <div className="mx-auto max-w-6xl">
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                  <AlertCircle size={32} className="text-red-500" />
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-800">
                  Gagal Memuat Tiket
                </h2>

                <p className="mt-2 text-sm text-red-600">{error}</p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={fetchTicketDetail}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <RefreshCw size={16} />
                    Coba Lagi
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/tracking")}
                    className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Kembali ke Tracking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <main className="ml-64 min-h-screen">
          <Navbar />

          <div className="p-6 lg:p-8">
            <div className="mx-auto max-w-6xl">
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <Ticket size={30} className="text-slate-400" />
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-800">
                  Tiket Tidak Ditemukan
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Tiket yang Anda cari tidak tersedia.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/tracking")}
                  className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Kembali ke Tracking
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        <Navbar />

        <div className="mx-auto max-w-6xl p-6 lg:p-8">
          {/* =================================================
              BACK
          ================================================= */}

          <button
            type="button"
            onClick={() => router.back()}
            className="group mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft
              size={17}
              className="transition-transform group-hover:-translate-x-1"
            />

            Kembali
          </button>

          {/* =================================================
              HERO
          ================================================= */}

          <section className="relative mb-6 overflow-hidden rounded-3xl bg-slate-900 shadow-xl">
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />

            <div className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative p-6 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white ring-1 ring-white/10">
                      <Ticket size={15} />

                      {displayTicketNumber}
                    </span>

                    {renderStatusBadge()}
                  </div>

                  <h1 className="mt-5 max-w-4xl text-2xl font-bold tracking-tight text-white lg:text-3xl">
                    {displaySubject}
                  </h1>

                  <p className="mt-3 text-sm text-slate-400">
                    Tiket dibuat pada{" "}
                    <span className="font-medium text-slate-300">
                      {formatDate(ticket.createdAt || ticket.created_at)}
                    </span>
                  </p>
                </div>

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <Ticket size={30} className="text-blue-400" />
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              INFORMASI TIKET
          ================================================= */}

          <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5 lg:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <Ticket size={19} className="text-blue-600" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Informasi Tiket
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Detail laporan yang Anda buat.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-2 text-xs font-medium text-slate-400">
                    Judul Tiket
                  </p>

                  <p className="text-sm font-bold leading-6 text-slate-800">
                    {displaySubject}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-2 text-xs font-medium text-slate-400">
                    Prioritas
                  </p>

                  <span
                    className={`
                      inline-flex
                      rounded-full
                      border
                      px-2.5
                      py-1
                      text-xs
                      font-bold
                      ${getPriorityClass(ticket.priority)}
                    `}
                  >
                    {displayPriority}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-2 text-xs font-medium text-slate-400">
                    Status
                  </p>

                  {renderStatusBadge()}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-2 text-xs font-medium text-slate-400">
                    Dibuat
                  </p>

                  <p className="text-sm font-bold leading-6 text-slate-800">
                    {formatDate(ticket.createdAt || ticket.created_at)}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Deskripsi Masalah
                </p>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                    {ticket.description || "Tidak ada deskripsi masalah."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              LAMPIRAN - VERSION WITH BUTTON (NO IMAGE)
          ================================================= */}

          {ticket.attachments && ticket.attachments.length > 0 && (
            <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <Paperclip size={18} className="text-blue-600" />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Lampiran Foto
                  </h2>

                  <p className="text-sm text-slate-500">
                    Bukti gambar yang dikirim oleh pelapor
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {ticket.attachments.map((file, index) => {
                  const fileUrl =
  file.url ||
  file.fileUrl ||
  file.file_url
    ? `http://192.168.200.193:3000${
        file.url ||
        file.fileUrl ||
        file.file_url
      }`
    : "#";
                  const fileName =
                    file.fileName || file.file_name || `Lampiran ${index + 1}`;

                  return (
                    <div
                      key={file.id ?? index}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <Paperclip size={16} className="text-slate-400" />

                      <span className="text-sm font-medium text-slate-700">
                        {fileName}
                      </span>

                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >
                        Lihat Lampiran
                      </a>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* =================================================
              FEEDBACK ADMIN
          ================================================= */}

          <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5 lg:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                  <MessageSquareText size={20} className="text-emerald-600" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Feedback 
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Informasi dari tim helpdesk mengenai tiket Anda.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 lg:p-8">
              {displayFeedback.trim() ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                      <ClipboardCheck size={19} className="text-emerald-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                        Pesan dari Helpdesk
                      </p>

                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
                        {displayFeedback}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <MessageSquareText size={28} className="mx-auto text-slate-300" />

                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    Belum ada feedback dari admin
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Feedback akan muncul di halaman ini setelah admin memberikan
                    informasi mengenai tiket Anda.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              PETUGAS
          ================================================= */}

          <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Penanganan
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Petugas Helpdesk
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Petugas yang menangani laporan Anda.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
                  <UserRound size={21} className="text-blue-600" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {ticket.assignedTo || ticket.assigned_to || "Helpdesk"}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Petugas Helpdesk
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="flex items-center justify-center gap-2 py-6">
            <ShieldCheck size={15} className="text-emerald-500" />

            <p className="text-xs text-slate-400">
              Informasi tiket berasal dari data terbaru sistem.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}