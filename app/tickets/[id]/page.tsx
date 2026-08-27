"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Ticket,
  User,
  Mail,
  CalendarDays,
  Clock3,
  Tag,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  RefreshCw,
  Send,
  ShieldCheck,
  CircleDot,
  Check,
  Image as ImageIcon,
  FileText,
  ExternalLink,
} from "lucide-react";

import AdminSidebar from "@/components/AdminSidebar";
import { apiFetch } from "@/src/lib/api";

// =====================================================
// TYPES
// =====================================================

type TicketStatus =
  | "new"
  | "in_progress"
  | "waiting_reply"
  | "escalated"
  | "resolved"
  | "closed";

type TicketPriority = "low" | "medium" | "high" | "urgent";

interface TicketAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType?: string;
}

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
  attachments?: TicketAttachment[];
}

interface FeedbackData {
  id: string;
  message: string;
  senderName?: string;
  senderRole?: string;
  createdAt: string;
}

interface ApiMessage {
  id?: string | number;
  message?: string;
  senderName?: string;
  sender_name?: string;
  senderRole?: string;
  sender_role?: string;
  createdAt?: string;
  created_at?: string;
}

interface ApiAttachment {
  id?: string | number;
  fileName?: string;
  file_name?: string;
  fileUrl?: string;
  file_url?: string;
  mimeType?: string;
  mime_type?: string;
}

interface ImageState {
  [key: string]: boolean;
}

// =====================================================
// CONSTANTS
// =====================================================

const STATUS_OPTIONS: {
  status: TicketStatus;
  label: string;
}[] = [
  { status: "in_progress", label: "Sedang Diproses" },
  { status: "escalated", label: "Eskalasi" },
  { status: "resolved", label: "Selesai" },
  { status: "closed", label: "Ditutup" },
];

// Status yang dianggap berada pada tahap progres ke-2
const PROGRESS_STATUS_INDEX: Record<TicketStatus, number> = {
  new: 0,
  in_progress: 1,
  waiting_reply: 1,
  escalated: 1,
  resolved: 2,
  closed: 2,
};

// =====================================================
// HELPERS
// =====================================================

function normalizeTicket(raw: any): TicketData {
  const attachmentsRaw: ApiAttachment[] =
    raw?.attachments ??
    raw?.attachment ??
    raw?.files ??
    raw?.images ??
    [];

  const attachments: TicketAttachment[] = Array.isArray(attachmentsRaw)
    ? attachmentsRaw
        .map((file, index) => {
          const fileUrl = file?.fileUrl ?? file?.file_url ?? "";

          return {
            id: String(file?.id ?? `attachment-${index}`),
            fileName:
              file?.fileName ??
              file?.file_name ??
              `Lampiran ${index + 1}`,
            fileUrl,
            mimeType: file?.mimeType ?? file?.mime_type ?? "",
          };
        })
        .filter((file) => Boolean(file.fileUrl))
    : [];

  return {
    id: String(raw?.id ?? ""),
    ticketNumber: raw?.ticketNumber ?? raw?.ticket_number ?? "-",
    subject: raw?.subject ?? "Tanpa Subjek",
    description: raw?.description ?? "",
    category: raw?.category ?? "",
    priority: raw?.priority ?? "medium",
    status: raw?.status ?? "new",
    tier: Number(raw?.tier ?? 1),
    requesterName:
      raw?.requesterName ??
      raw?.requester_name ??
      raw?.user?.name ??
      raw?.requester?.name ??
      "-",
    requesterEmail:
      raw?.requesterEmail ??
      raw?.requester_email ??
      raw?.user?.email ??
      raw?.requester?.email ??
      "-",
    source: raw?.source ?? "-",
    createdAt: raw?.createdAt ?? raw?.created_at ?? "",
    updatedAt: raw?.updatedAt ?? raw?.updated_at ?? "",
    attachments,
  };
}

function normalizeFeedbackMessages(messages: ApiMessage[]): FeedbackData[] {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((item) => {
      const role = item?.senderRole ?? item?.sender_role;

      return role === "admin" || role === "agent";
    })
    .map((item, index) => ({
      id: String(item?.id ?? `feedback-${index}`),
      message: item?.message ?? "",
      senderName:
        item?.senderName ??
        item?.sender_name ??
        "Admin",
      senderRole:
        item?.senderRole ??
        item?.sender_role ??
        "admin",
      createdAt:
        item?.createdAt ??
        item?.created_at ??
        "",
    }))
    .filter((item) => item.message.trim() !== "");
}

// =====================================================
// PAGE
// =====================================================

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();

  const ticketId = useMemo(() => {
    const rawId = params?.id;

    if (Array.isArray(rawId)) {
      return rawId[0] ?? "";
    }

    return rawId ?? "";
  }, [params]);

  // =====================================================
  // STATE
  // =====================================================

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [feedback, setFeedback] = useState("");

  const [error, setError] = useState("");
  const [feedbackError, setFeedbackError] = useState("");

  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // Menyimpan gambar attachment yang gagal di-load.
  // Tidak lagi diarahkan ke /placeholder-image.png.
  const [brokenImages, setBrokenImages] = useState<ImageState>({});

  // =====================================================
  // FETCH TICKET
  // =====================================================

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;

    try {
      setError("");

      const response = await apiFetch(`/tickets/${ticketId}`);

      console.log("DETAIL TICKET:", response);

      const ticketData =
        response?.data ??
        response?.ticket ??
        response;

      if (!ticketData) {
        throw new Error("Data tiket tidak ditemukan.");
      }

      setTicket(normalizeTicket(ticketData));
    } catch (err) {
      console.error("Gagal mengambil detail tiket:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil detail tiket."
      );
    }
  }, [ticketId]);

  // =====================================================
  // FETCH FEEDBACK
  // =====================================================

  const fetchFeedbacks = useCallback(async () => {
    if (!ticketId) return;

    try {
      setFeedbackError("");

      const response = await apiFetch(
        `/tickets/${ticketId}/conversation`
      );

      console.log("FEEDBACK DATA:", response);

      const conversationData =
        response?.data ??
        response?.conversation ??
        response;

      const messages = Array.isArray(conversationData?.messages)
        ? conversationData.messages
        : Array.isArray(conversationData)
          ? conversationData
          : [];

      setFeedbacks(
        normalizeFeedbackMessages(messages)
      );
    } catch (err) {
      console.error("Gagal mengambil feedback:", err);

      setFeedbackError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil feedback."
      );
    }
  }, [ticketId]);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (!ticketId) {
      setLoading(false);
      setLoadingFeedback(false);
      return;
    }

    let cancelled = false;

    const loadInitialData = async () => {
      setLoading(true);
      setLoadingFeedback(true);

      try {
        await Promise.all([
          fetchTicket(),
          fetchFeedbacks(),
        ]);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingFeedback(false);
        }
      }
    };

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [ticketId, fetchTicket, fetchFeedbacks]);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);

      await Promise.all([
        fetchTicket(),
        fetchFeedbacks(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // =====================================================
  // SEND FEEDBACK
  // =====================================================

  const handleSendFeedback = async () => {
    const trimmedFeedback = feedback.trim();

    if (
      !trimmedFeedback ||
      !ticketId ||
      sendingFeedback ||
      !ticket
    ) {
      return;
    }

    if (
      ticket.status === "resolved" ||
      ticket.status === "closed"
    ) {
      return;
    }

    try {
      setSendingFeedback(true);

      await apiFetch(`/tickets/${ticketId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          ticketId,
          message: trimmedFeedback,
        }),
      });

      setFeedback("");

      await Promise.all([
        fetchFeedbacks(),
        fetchTicket(),
      ]);

      alert("Feedback berhasil dikirim ke pelapor.");
    } catch (err) {
      console.error("Gagal mengirim feedback:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Gagal mengirim feedback."
      );
    } finally {
      setSendingFeedback(false);
    }
  };

  // =====================================================
  // ENTER TO SEND
  // =====================================================

  const handleFeedbackKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSendFeedback();
    }
  };

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const handleStatusChange = async (
    newStatus: TicketStatus
  ) => {
    if (
      !ticket ||
      updatingStatus ||
      ticket.status === newStatus
    ) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setShowStatusMenu(false);

      await apiFetch(`/tickets/${ticket.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      await Promise.all([
        fetchTicket(),
        fetchFeedbacks(),
      ]);
    } catch (err) {
      console.error("Gagal mengubah status:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Gagal mengubah status tiket."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // =====================================================
  // STATUS LABEL
  // =====================================================

  const getStatusLabel = (
    status?: string
  ) => {
    switch (status) {
      case "new":
        return "Baru";

      case "in_progress":
        return "Sedang Diproses";

      case "waiting_reply":
        return "Menunggu Balasan";

      case "escalated":
        return "Eskalasi";

      case "resolved":
        return "Selesai";

      case "closed":
        return "Ditutup";

      default:
        return status || "-";
    }
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (
    status?: string
  ) => {
    switch (status) {
      case "new":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "in_progress":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "waiting_reply":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "escalated":
        return "bg-red-50 text-red-700 border-red-200";

      case "resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "closed":
        return "bg-slate-100 text-slate-700 border-slate-200";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  // =====================================================
  // STATUS DOT
  // =====================================================

  const getStatusDot = (
    status?: string
  ) => {
    switch (status) {
      case "new":
        return "bg-blue-500";

      case "in_progress":
        return "bg-amber-500";

      case "waiting_reply":
        return "bg-purple-500";

      case "escalated":
        return "bg-red-500";

      case "resolved":
        return "bg-emerald-500";

      case "closed":
        return "bg-slate-500";

      default:
        return "bg-slate-400";
    }
  };

  // =====================================================
  // PRIORITY
  // =====================================================

  const getPriorityClass = (
    priority?: string
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
    category?: string
  ) => {
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

  // =====================================================
  // PRIORITY LABEL
  // =====================================================

  const formatPriority = (
    priority?: string
  ) => {
    switch (priority) {
      case "urgent":
        return "Urgent";

      case "high":
        return "High";

      case "medium":
        return "Medium";

      case "low":
        return "Low";

      default:
        return priority || "-";
    }
  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDateTime = (
    date?: string
  ) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // ATTACHMENT
  // =====================================================

  const handleImageError = (
    attachmentId: string
  ) => {
    setBrokenImages((previous) => ({
      ...previous,
      [attachmentId]: true,
    }));
  };

  const isImageAttachment = (
    file: TicketAttachment
  ) => {
    if (
      file.mimeType?.toLowerCase().startsWith("image/")
    ) {
      return true;
    }

    const extension = file.fileName
      ?.split(".")
      .pop()
      ?.toLowerCase();

    return [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "svg",
      "bmp",
      "avif",
    ].includes(extension || "");
  };

  // =====================================================
  // STATUS PROGRESS
  // =====================================================

  const currentStatusIndex = ticket
    ? PROGRESS_STATUS_INDEX[ticket.status]
    : 0;

  const progressPercentage =
    (currentStatusIndex / 2) * 100;

  // =====================================================
  // FINISHED
  // =====================================================

  const isFinished =
    ticket?.status === "resolved" ||
    ticket?.status === "closed";

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fb]">
        <AdminSidebar />

        <main className="ml-64 min-h-screen">
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <RefreshCw
                size={30}
                className="mx-auto animate-spin text-blue-600"
              />

              <p className="mt-4 text-sm font-semibold text-slate-600">
                Memuat detail tiket...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Mengambil data dari server
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#f5f7fb]">
        <AdminSidebar />

        <main className="ml-64 min-h-screen">
          <div className="p-8">
            <button
              type="button"
              onClick={() => router.push("/tickets")}
              className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Kembali ke Semua Tiket
            </button>

            <div className="rounded-2xl border border-red-200 bg-white p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                <AlertTriangle
                  size={30}
                  className="text-red-500"
                />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-800">
                Tiket tidak ditemukan
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {error || "Data tiket tidak tersedia."}
              </p>

              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/tickets")}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Kembali ke Tiket
                </button>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <RefreshCw size={16} />
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AdminSidebar />

      <main className="ml-64 min-h-screen">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="border-b border-slate-200 bg-white">
          <div className="px-8 py-6">
            <button
              type="button"
              onClick={() => router.push("/tickets")}
              className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Kembali ke Semua Tiket
            </button>

            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                    <Ticket size={14} />
                    {ticket.ticketNumber}
                  </span>

                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClass(
                      ticket.status
                    )}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                        ticket.status
                      )}`}
                    />

                    {getStatusLabel(ticket.status)}
                  </span>
                </div>

                <h1 className="mt-3 max-w-4xl break-words text-2xl font-bold tracking-tight text-slate-900">
                  {ticket.subject}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Dibuat pada{" "}
                  {formatDateTime(ticket.createdAt)}
                </p>
              </div>

              {/* ACTIONS */}

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setShowStatusMenu((value) => !value)
                    }
                    disabled={updatingStatus}
                    className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-bold shadow-sm transition ${getStatusClass(
                      ticket.status
                    )}`}
                  >
                    {updatingStatus ? (
                      <RefreshCw
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <CircleDot size={15} />
                    )}

                    {getStatusLabel(ticket.status)}

                    <span className="text-xs opacity-60">
                      ▼
                    </span>
                  </button>

                  {showStatusMenu && (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() =>
                          setShowStatusMenu(false)
                        }
                        aria-label="Tutup menu status"
                      />

                      <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                        {STATUS_OPTIONS.map((item) => (
                          <button
                            key={item.status}
                            type="button"
                            onClick={() =>
                              handleStatusChange(item.status)
                            }
                            disabled={updatingStatus}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                              ticket.status === item.status
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${getStatusDot(
                                item.status
                              )}`}
                            />

                            <span className="flex-1 font-semibold">
                              {item.label}
                            </span>

                            {ticket.status === item.status && (
                              <Check size={15} />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={16}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div className="p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            {/* =================================================
                LEFT
            ================================================= */}

            <div className="min-w-0 space-y-6">
              {/* =================================================
                  STATUS PROGRESS
              ================================================= */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                <div className="mb-7 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Progress Tiket
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Pantau proses penanganan tiket
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClass(
                      ticket.status
                    )}`}
                  >
                    {getStatusLabel(ticket.status)}
                  </span>
                </div>

                <div className="relative px-1">
                  <div className="absolute left-[calc(16.666%)] right-[calc(16.666%)] top-5 h-0.5 bg-slate-200" />

                  <div
                    className="absolute left-[calc(16.666%)] top-5 h-0.5 bg-blue-500 transition-all duration-500"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, progressPercentage)
                      ) * 0.6667}%`,
                    }}
                  />

                  <div className="relative grid grid-cols-3">
                    {[
                      {
                        status: "new" as TicketStatus,
                        label: "Tiket Dibuat",
                      },
                      {
                        status: "in_progress" as TicketStatus,
                        label: "Diproses",
                      },
                      {
                        status: "resolved" as TicketStatus,
                        label: "Selesai",
                      },
                    ].map((item, index) => {
                      const active =
                        index <= currentStatusIndex;

                      const current =
                        ticket.status === item.status;

                      return (
                        <div
                          key={item.status}
                          className="flex flex-col items-center"
                        >
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-sm transition ${
                              active
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-400"
                            } ${
                              current
                                ? "ring-4 ring-blue-100"
                                : ""
                            }`}
                          >
                            {active ? (
                              <Check size={16} />
                            ) : (
                              <CircleDot size={16} />
                            )}
                          </div>

                          <p
                            className={`mt-3 text-center text-[11px] font-bold ${
                              active
                                ? "text-slate-700"
                                : "text-slate-400"
                            }`}
                          >
                            {item.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* =================================================
                  DETAIL LAPORAN
              ================================================= */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <MessageSquare
                        size={19}
                        className="text-blue-600"
                      />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Detail Laporan
                      </h2>

                      <p className="text-xs text-slate-400">
                        Isi laporan dari pelapor
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-6">
                  <div className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                    {ticket.description ||
                      "Tidak ada deskripsi."}
                  </div>
                </div>
              </section>

              {/* =================================================
                  ATTACHMENTS - VERSION WITH THUMBNAIL + LINK
              ================================================= */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                      <ImageIcon
                        size={19}
                        className="text-indigo-600"
                      />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Lampiran Foto
                      </h2>

                      <p className="text-xs text-slate-400">
                        Bukti gambar yang dikirim oleh pelapor
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {ticket.attachments && ticket.attachments.length > 0 ? (
                    <div className="space-y-3">
                      {ticket.attachments.map((file) => {
                        // Pastikan URL lengkap dengan base URL backend
                        const BACKEND_URL = "http://192.168.200.193:3000";

const imageUrl = file.fileUrl.startsWith("http")
  ? file.fileUrl
  : `${BACKEND_URL}${file.fileUrl}`;

                        const isImage = isImageAttachment(file);
                        const imageBroken = brokenImages[file.id];

                        return (
                          <a
                            key={file.id}
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-blue-300 hover:bg-blue-50"
                          >
                            {/* Thumbnail kecil */}
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                              {isImage && !imageBroken ? (
                                <img
                                  src={imageUrl}
                                  alt={file.fileName}
                                  className="h-full w-full object-cover"
                                  onError={() => handleImageError(file.id)}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-slate-100">
                                  {isImage ? (
                                    <ImageIcon size={24} className="text-slate-400" />
                                  ) : (
                                    <FileText size={24} className="text-slate-400" />
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Nama file */}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-700">
                                {file.fileName}
                              </p>
                              <p className="mt-1 text-xs text-blue-600">
                                {imageBroken ? "Preview tidak tersedia - " : ""}
                                Klik untuk melihat foto
                              </p>
                            </div>

                            {/* Icon external link */}
                            <ExternalLink size={16} className="shrink-0 text-slate-400" />
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                      <ImageIcon
                        size={30}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-500">
                        Tidak ada lampiran
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Pelapor belum mengirim foto atau file.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================
                  FEEDBACK
              ================================================= */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                        <MessageSquare
                          size={19}
                          className="text-emerald-600"
                      />
                      </div>

                      <div>
                        <h2 className="font-bold text-slate-900">
                          Feedback untuk Pelapor
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Informasi perkembangan dan hasil penanganan tiket
                        </p>
                      </div>
                    </div>

                    {feedbacks.length > 0 && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {feedbacks.length} feedback
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50/70 p-6">
                  {loadingFeedback ? (
                    <div className="py-10 text-center">
                      <RefreshCw
                        size={24}
                        className="mx-auto animate-spin text-blue-600"
                      />

                      <p className="mt-3 text-sm text-slate-500">
                        Memuat feedback...
                      </p>
                    </div>
                  ) : feedbackError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
                      <AlertTriangle
                        size={24}
                        className="mx-auto text-red-500"
                      />

                      <p className="mt-3 text-sm font-semibold text-red-700">
                        Gagal memuat feedback
                      </p>

                      <p className="mt-1 break-words text-xs text-red-500">
                        {feedbackError}
                      </p>

                      <button
                        type="button"
                        onClick={fetchFeedbacks}
                        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                      >
                        Coba Lagi
                      </button>
                    </div>
                  ) : feedbacks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <MessageSquare
                          size={22}
                          className="text-slate-300"
                        />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-500">
                        Belum ada feedback
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Admin dapat memberikan informasi kepada
                        pelapor melalui form di bawah.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {feedbacks.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600">
                              <ShieldCheck
                                size={16}
                                className="text-white"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <p className="text-xs font-bold text-slate-800">
                                    {item.senderName ||
                                      "Admin"}
                                  </p>

                                  <p className="text-[10px] text-slate-400">
                                    Admin Helpdesk
                                  </p>
                                </div>

                                <p className="text-[10px] text-slate-400">
                                  {formatDateTime(
                                    item.createdAt
                                  )}
                                </p>
                              </div>

                              <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3">
                                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                                  {item.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SEND FEEDBACK */}

                <div className="border-t border-slate-200 bg-white p-5">
                  {isFinished ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                          <CheckCircle2
                            size={18}
                            className="text-emerald-600"
                          />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-emerald-800">
                            Tiket sudah{" "}
                            {ticket.status === "closed"
                              ? "ditutup"
                              : "diselesaikan"}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-emerald-700">
                            Penanganan tiket telah selesai.
                            Feedback baru tidak dapat dikirim
                            pada tiket ini.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                          <ShieldCheck
                            size={17}
                            className="text-blue-600"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-700">
                            Kirim Feedback Admin
                          </p>

                          <p className="text-[10px] text-slate-400">
                            Feedback akan terlihat oleh pelapor pada halaman Tracking.
                          </p>
                        </div>
                      </div>

                      <textarea
                        value={feedback}
                        onChange={(event) =>
                          setFeedback(event.target.value)
                        }
                        onKeyDown={handleFeedbackKeyDown}
                        placeholder="Tulis perkembangan, solusi, atau informasi untuk pelapor..."
                        rows={4}
                        disabled={sendingFeedback}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[11px] text-slate-400">
                          Enter untuk mengirim • Shift + Enter untuk baris baru
                        </p>

                        <button
                          type="button"
                          onClick={handleSendFeedback}
                          disabled={
                            sendingFeedback ||
                            !feedback.trim()
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {sendingFeedback ? (
                            <>
                              <RefreshCw
                                size={16}
                                className="animate-spin"
                              />
                              Mengirim...
                            </>
                          ) : (
                            <>
                              <Send size={16} />
                              Kirim Feedback
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </section>
            </div>

            {/* =================================================
                RIGHT SIDEBAR
            ================================================= */}

            <div className="space-y-6">
              {/* ACTION CARD */}

              <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-blue-100">
                      TINDAKAN ADMIN
                    </p>

                    <h2 className="mt-1 text-lg font-bold">
                      Proses Tiket
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <ShieldCheck size={20} />
                  </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-blue-100">
                  Kelola perkembangan tiket dan berikan feedback kepada pelapor.
                </p>

                <div className="mt-5 space-y-2">
                  {!isFinished &&
                    ticket.status !== "in_progress" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(
                            "in_progress"
                          )
                        }
                        disabled={updatingStatus}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-700 transition hover:bg-blue-50 disabled:opacity-60"
                      >
                        {updatingStatus ? (
                          <RefreshCw
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <CircleDot size={15} />
                        )}

                        Proses Tiket
                      </button>
                    )}

                  {!isFinished && (
                    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-100">
                        Status saat ini
                      </p>

                      <p className="mt-1 text-sm font-bold">
                        {getStatusLabel(ticket.status)}
                      </p>
                    </div>
                  )}

                  {!isFinished && (
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange("resolved")
                      }
                      disabled={updatingStatus}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                    >
                      {updatingStatus ? (
                        <RefreshCw
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}

                      Tandai Selesai
                    </button>
                  )}

                  {isFinished && (
                    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} />

                        <span className="text-xs font-bold">
                          Penanganan selesai
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* REQUESTER */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="font-bold text-slate-900">
                    Informasi Pelapor
                  </h2>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <User
                        size={19}
                        className="text-blue-600"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {ticket.requesterName}
                      </p>

                      <p className="truncate text-xs text-slate-400">
                        Pelapor
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-start gap-3">
                      <Mail
                        size={17}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />

                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Email
                        </p>

                        <p className="mt-1 break-all text-sm text-slate-600">
                          {ticket.requesterEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* TICKET INFO */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="font-bold text-slate-900">
                    Informasi Tiket
                  </h2>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* CATEGORY */}

                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Tag
                        size={17}
                        className="shrink-0 text-slate-400"
                      />

                      <span className="text-sm text-slate-500">
                        Kategori
                      </span>
                    </div>

                    <span className="shrink-0 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                      {formatCategory(ticket.category)}
                    </span>
                  </div>

                  {/* PRIORITY */}

                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <AlertTriangle
                        size={17}
                        className="shrink-0 text-slate-400"
                      />

                      <span className="text-sm text-slate-500">
                        Prioritas
                      </span>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${getPriorityClass(
                        ticket.priority
                      )}`}
                    >
                      {formatPriority(ticket.priority)}
                    </span>
                  </div>

                  {/* STATUS */}

                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <CheckCircle2
                        size={17}
                        className="shrink-0 text-slate-400"
                      />

                      <span className="text-sm text-slate-500">
                        Status
                      </span>
                    </div>

                    <span className="text-right text-xs font-bold text-slate-700">
                      {getStatusLabel(ticket.status)}
                    </span>
                  </div>

                  {/* SOURCE */}

                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Ticket
                        size={17}
                        className="shrink-0 text-slate-400"
                      />

                      <span className="text-sm text-slate-500">
                        Sumber
                      </span>
                    </div>

                    <span className="text-right text-xs font-bold capitalize text-slate-700">
                      {ticket.source || "-"}
                    </span>
                  </div>

                  {/* CREATED */}

                  <div className="flex items-start justify-between gap-4 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <CalendarDays
                        size={17}
                        className="shrink-0 text-slate-400"
                      />

                      <span className="text-sm text-slate-500">
                        Dibuat
                      </span>
                    </div>

                    <span className="max-w-[150px] text-right text-xs font-semibold text-slate-700">
                      {formatDateTime(
                        ticket.createdAt
                      )}
                    </span>
                  </div>

                  {/* UPDATED */}

                  <div className="flex items-start justify-between gap-4 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Clock3
                        size={17}
                        className="shrink-0 text-slate-400"
                      />

                      <span className="text-sm text-slate-500">
                        Diperbarui
                      </span>
                    </div>

                    <span className="max-w-[150px] text-right text-xs font-semibold text-slate-700">
                      {formatDateTime(
                        ticket.updatedAt
                      )}
                    </span>
                  </div>
                </div>
              </section>

              {/* FINISHED */}

              {isFinished && (
                <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                      <CheckCircle2
                        size={20}
                        className="text-emerald-600"
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-emerald-800">
                        Tiket{" "}
                        {ticket.status === "closed"
                          ? "Ditutup"
                          : "Selesai"}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-emerald-700">
                        Penanganan tiket telah selesai dan pelapor
                        dapat melihat hasil penanganan melalui Tracking.
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}