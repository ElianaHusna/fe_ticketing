"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Ticket,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  ChevronRight,
  TrendingUp,
  CircleDot,
  Layers3,
  BarChart3,
  Inbox,
  PieChart as PieChartIcon,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import AdminSidebar from "@/components/AdminSidebar";
import { apiFetch } from "@/src/lib/api";

// =====================================================
// TYPE
// =====================================================

type TicketStatus =
  | "new"
  | "in_progress"
  | "waiting_reply"
  | "escalated"
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
// WARNA STATUS
// =====================================================

const statusColors = [
  "#2563eb",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#22c55e",
  "#94a3b8",
];

// =====================================================
// PAGE
// =====================================================

export default function DashboardAdminPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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
  // STATISTIK
  // =====================================================

  const total = tickets.length;

  const newTickets = tickets.filter(
    (ticket) => ticket.status === "new"
  ).length;

  const inProgress = tickets.filter(
    (ticket) => ticket.status === "in_progress"
  ).length;

  const resolved = tickets.filter(
    (ticket) =>
      ticket.status === "resolved" ||
      ticket.status === "closed"
  ).length;

  // =====================================================
  // BULAN SEKARANG & BULAN SEBELUMNYA
  // =====================================================

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const previousMonth =
    currentMonth === 0 ? 11 : currentMonth - 1;

  const previousMonthYear =
    currentMonth === 0
      ? currentYear - 1
      : currentYear;

  // =====================================================
  // TREND BULANAN
  // =====================================================

  const currentMonthTickets = tickets.filter((ticket) => {
    const date = new Date(ticket.createdAt);
    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  });

  const previousMonthTickets = tickets.filter((ticket) => {
    const date = new Date(ticket.createdAt);
    return (
      date.getMonth() === previousMonth &&
      date.getFullYear() === previousMonthYear
    );
  });

  const calculateTrend = (
    current: number,
    previous: number
  ) => {
    if (previous === 0) {
      if (current === 0) return 0;
      return 100;
    }
    return Math.round(
      ((current - previous) / previous) * 100
    );
  };

  const totalTrend = calculateTrend(
    currentMonthTickets.length,
    previousMonthTickets.length
  );

  const newTrend = calculateTrend(
    currentMonthTickets.filter(
      (ticket) => ticket.status === "new"
    ).length,
    previousMonthTickets.filter(
      (ticket) => ticket.status === "new"
    ).length
  );

  const progressTrend = calculateTrend(
    currentMonthTickets.filter(
      (ticket) => ticket.status === "in_progress"
    ).length,
    previousMonthTickets.filter(
      (ticket) => ticket.status === "in_progress"
    ).length
  );

  const resolvedTrend = calculateTrend(
    currentMonthTickets.filter(
      (ticket) =>
        ticket.status === "resolved" ||
        ticket.status === "closed"
    ).length,
    previousMonthTickets.filter(
      (ticket) =>
        ticket.status === "resolved" ||
        ticket.status === "closed"
    ).length
  );

  // =====================================================
  // SPARKLINE DATA
  // =====================================================

  const makeSparkline = (
    status?: TicketStatus
  ) => {
    const months = Array.from(
      { length: 6 },
      (_, index) => {
        const date = new Date();
        date.setMonth(
          date.getMonth() - (5 - index)
        );
        return {
          month: date.getMonth(),
          year: date.getFullYear(),
        };
      }
    );

    return months.map((item) => {
      const value = tickets.filter((ticket) => {
        const date = new Date(ticket.createdAt);
        const sameMonth =
          date.getMonth() === item.month &&
          date.getFullYear() === item.year;
        if (!sameMonth) return false;
        if (!status) return true;
        return ticket.status === status;
      }).length;
      return { value };
    });
  };

  const totalSparkline = makeSparkline();
  const newSparkline = makeSparkline("new");
  const progressSparkline = makeSparkline("in_progress");

  const resolvedSparkline = tickets
    ? Array.from({ length: 6 }, (_, index) => {
        const date = new Date();
        date.setMonth(
          date.getMonth() - (5 - index)
        );
        const value = tickets.filter((ticket) => {
          const ticketDate = new Date(
            ticket.createdAt
          );
          return (
            ticketDate.getMonth() ===
              date.getMonth() &&
            ticketDate.getFullYear() ===
              date.getFullYear() &&
            (ticket.status === "resolved" ||
              ticket.status === "closed")
          );
        }).length;
        return { value };
      })
    : [];

  // =====================================================
  // FILTER SEARCH
  // =====================================================

  const filteredTickets = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return tickets;
    }
    return tickets.filter((ticket) => {
      return (
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
          .includes(keyword)
      );
    });
  }, [tickets, search]);

  // =====================================================
  // TIKET TERBARU
  // =====================================================

  const latestTickets = [...filteredTickets]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 8);

  // =====================================================
  // GRAFIK STATUS / PIE
  // =====================================================

  const statusChartData = useMemo(() => {
    const statusMap: Record<
      TicketStatus,
      number
    > = {
      new: 0,
      in_progress: 0,
      waiting_reply: 0,
      escalated: 0,
      resolved: 0,
      closed: 0,
    };

    tickets.forEach((ticket) => {
      if (
        statusMap[ticket.status] !== undefined
      ) {
        statusMap[ticket.status]++;
      }
    });

    return [
      {
        name: "Belum Dilihat",
        value: statusMap.new,
      },
      {
        name: "Diproses",
        value: statusMap.in_progress,
      },
      {
        name: "Menunggu Balasan",
        value: statusMap.waiting_reply,
      },
      {
        name: "Eskalasi",
        value: statusMap.escalated,
      },
      {
        name: "Selesai",
        value: statusMap.resolved,
      },
      {
        name: "Ditutup",
        value: statusMap.closed,
      },
    ];
  }, [tickets]);

  // =====================================================
  // GRAFIK TIKET MASUK PER BULAN
  // =====================================================

  const monthlyTicketChartData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    return months.map((month, index) => {
      const count = tickets.filter((ticket) => {
        if (!ticket.createdAt) return false;
        const date = new Date(
          ticket.createdAt
        );
        return (
          date.getFullYear() === currentYear &&
          date.getMonth() === index
        );
      }).length;
      return {
        name: month,
        tiket: count,
      };
    });
  }, [tickets, currentYear]);

  // =====================================================
  // TOTAL TIKET TAHUN INI
  // =====================================================

  const totalTicketsThisYear = useMemo(() => {
    return tickets.filter((ticket) => {
      if (!ticket.createdAt) return false;
      return (
        new Date(
          ticket.createdAt
        ).getFullYear() === currentYear
      );
    }).length;
  }, [tickets, currentYear]);

  // =====================================================
  // KATEGORI
  // =====================================================

  const categoryChartData = useMemo(() => {
    const categoryMap: Record<
      string,
      number
    > = {};

    tickets.forEach((ticket) => {
      const category =
        ticket.category || "other";
      categoryMap[category] =
        (categoryMap[category] || 0) + 1;
    });

    return Object.entries(categoryMap)
      .map(([name, value]) => ({
        name: formatCategory(name),
        value,
      }))
      .sort(
        (a, b) =>
          b.value - a.value
      );
  }, [tickets]);

  // =====================================================
  // KATEGORI TERBANYAK
  // =====================================================

  const topCategory =
    categoryChartData.length > 0
      ? categoryChartData[0]
      : null;

  const topCategoryPercentage =
    topCategory && total > 0
      ? (
          (topCategory.value / total) *
          100
        ).toFixed(1)
      : "0.0";

  // =====================================================
  // STATUS LABEL
  // =====================================================

  const getStatusLabel = (
    status: TicketStatus
  ) => {
    switch (status) {
      case "new":
        return "Belum Dilihat";
      case "in_progress":
        return "Diproses";
      case "waiting_reply":
        return "Menunggu";
      case "escalated":
        return "Eskalasi";
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
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "in_progress":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "waiting_reply":
        return "bg-purple-50 border-purple-200 text-purple-700";
      case "escalated":
        return "bg-red-50 border-red-200 text-red-700";
      case "resolved":
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "closed":
        return "bg-slate-100 border-slate-200 text-slate-700";
      default:
        return "bg-slate-100 border-slate-200 text-slate-600";
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
        return "bg-red-50 text-red-600 border-red-100";
      case "high":
        return "bg-orange-50 text-orange-600 border-orange-100";
      case "medium":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "low":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  // =====================================================
  // PRIORITY LABEL
  // =====================================================

  const formatPriority = (
    priority: TicketPriority
  ) => {
    switch (priority) {
      case "urgent":
        return "Sangat Tinggi";
      case "high":
        return "Tinggi";
      case "medium":
        return "Sedang";
      case "low":
        return "Rendah";
      default:
        return priority;
    }
  };

  // =====================================================
  // CATEGORY
  // =====================================================

  function formatCategory(
    category: string
  ) {
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
  }

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
  // TREND COMPONENT
  // =====================================================

  const TrendText = ({
    value,
  }: {
    value: number;
  }) => {
    const positive = value >= 0;
    return (
      <p
        className={`mt-2 flex items-center gap-1 text-xs ${
          positive
            ? "text-emerald-600"
            : "text-red-500"
        }`}
      >
        <TrendingUp
          size={13}
          className={
            positive
              ? ""
              : "rotate-180"
          }
        />
        {positive ? "↑" : "↓"}{" "}
        {Math.abs(value)}%{" "}
        <span className="text-slate-400">
          dari bulan lalu
        </span>
      </p>
    );
  };

  // =====================================================
  // STAT CARD
  // =====================================================

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    iconBg,
    iconColor,
    valueColor,
    trend,
    chartData,
    lineColor,
  }: {
    title: string;
    value: number;
    description: string;
    icon: any;
    iconBg: string;
    iconColor: string;
    valueColor: string;
    trend: number;
    chartData: { value: number }[];
    lineColor: string;
  }) => {
    return (
      <div
        className="
          group
          overflow-hidden
          rounded-2xl
          border
          border-slate-200/60
          bg-white/80
          backdrop-blur-sm
          shadow-sm
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:shadow-lg
          hover:border-blue-200/60
        "
      >
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {title}
              </p>
              <p
                className={`mt-2 text-3xl font-bold tracking-tight ${valueColor}`}
              >
                {loading ? "..." : value}
              </p>
              <TrendText value={trend} />
              <p className="mt-1 text-[11px] text-slate-400">
                {description}
              </p>
            </div>
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg} group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon
                size={21}
                className={iconColor}
              />
            </div>
          </div>
        </div>
        <div className="h-12 px-3 pb-2">
          {!loading && (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={lineColor}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      <AdminSidebar />

      <main className="ml-64 min-h-screen">

        {/* =================================================
            HEADER - CLEAN & MODERN
        ================================================= */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-30">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/25">
                  <PieChartIcon size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    Dashboard Overview
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Pantau dan kelola semua aktivitas tiket
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* SEARCH */}
                <div className="relative w-64">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Cari tiket..."
                    className="
                      w-full
                      h-9
                      rounded-xl
                      border
                      border-slate-200/60
                      bg-slate-50/80
                      pl-9
                      pr-4
                      text-xs
                      text-slate-700
                      outline-none
                      transition-all
                      placeholder:text-slate-400
                      focus:border-blue-400
                      focus:bg-white
                      focus:ring-2
                      focus:ring-blue-400/20
                    "
                  />
                </div>

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

          {/* ERROR */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200/80 bg-red-50/80 backdrop-blur-sm px-5 py-4 shadow-sm">
              <AlertTriangle
                size={18}
                className="text-red-500"
              />
              <div>
                <p className="font-semibold text-red-700">
                  Gagal memuat tiket
                </p>
                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              STAT CARDS
          ================================================= */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 mb-6">
            <StatCard
              title="Semua Tiket"
              value={total}
              description="Total tiket masuk"
              icon={Ticket}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              valueColor="text-slate-900"
              trend={totalTrend}
              chartData={totalSparkline}
              lineColor="#2563eb"
            />
            <StatCard
              title="Belum Dilihat"
              value={newTickets}
              description="Menunggu ditangani"
              icon={CircleDot}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              valueColor="text-blue-600"
              trend={newTrend}
              chartData={newSparkline}
              lineColor="#2563eb"
            />
            <StatCard
              title="Sedang Diproses"
              value={inProgress}
              description="Sedang ditangani"
              icon={Clock3}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              valueColor="text-amber-600"
              trend={progressTrend}
              chartData={progressSparkline}
              lineColor="#f59e0b"
            />
            <StatCard
              title="Selesai"
              value={resolved}
              description="Berhasil diselesaikan"
              icon={CheckCircle2}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              valueColor="text-emerald-600"
              trend={resolvedTrend}
              chartData={resolvedSparkline}
              lineColor="#22c55e"
            />
          </div>

          {/* =================================================
              ROW GRAFIK
          ================================================= */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

            {/* =================================================
                DISTRIBUSI STATUS - PIE
            ================================================= */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Distribusi Status Tiket
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Kondisi seluruh tiket saat ini
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <PieChartIcon
                    size={19}
                    className="text-blue-600"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_1fr]">
                <div className="relative h-[250px]">
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <RefreshCw
                        size={25}
                        className="animate-spin text-blue-600"
                      />
                    </div>
                  ) : total === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center">
                      <PieChartIcon
                        size={38}
                        className="text-slate-300"
                      />
                      <p className="mt-3 text-sm text-slate-500">
                        Belum ada data
                      </p>
                    </div>
                  ) : (
                    <>
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <PieChart>
                          <Pie
                            data={
                              statusChartData
                            }
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={105}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="#ffffff"
                            strokeWidth={2}
                          >
                            {statusChartData.map(
                              (_, index) => (
                                <Cell
                                  key={`status-${index}`}
                                  fill={
                                    statusColors[
                                      index
                                    ]
                                  }
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [
                              `${value ?? 0} tiket`,
                              "Jumlah",
                            ]}
                            contentStyle={{
                              borderRadius:
                                "12px",
                              border:
                                "1px solid #e2e8f0",
                              boxShadow:
                                "0 10px 25px rgba(15,23,42,0.08)",
                              background: "white",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-900">
                            {total}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Total
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* LEGEND */}
                <div className="space-y-3 pr-2">
                  {statusChartData.map(
                    (item, index) => {
                      const percentage =
                        total > 0
                          ? (
                              (item.value /
                                total) *
                              100
                            ).toFixed(1)
                          : "0.0";
                      return (
                        <div
                          key={item.name}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  statusColors[
                                    index
                                  ],
                              }}
                            />
                            <span className="truncate text-xs text-slate-600">
                              {item.name}
                            </span>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-xs font-semibold text-slate-700">
                              {item.value}
                            </span>
                            <span className="ml-1 text-[10px] text-slate-400">
                              ({percentage}%)
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                TIKET MASUK PER BULAN
            ================================================= */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Tiket Masuk per Bulan
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Jumlah tiket yang masuk selama tahun{" "}
                    {currentYear}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <BarChart3
                    size={19}
                    className="text-blue-600"
                  />
                </div>
              </div>

              <div className="mt-5 h-[250px]">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <RefreshCw
                      size={25}
                      className="animate-spin text-blue-600"
                    />
                  </div>
                ) : (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={
                        monthlyTicketChartData
                      }
                      margin={{
                        top: 15,
                        right: 10,
                        left: -20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fontSize: 11,
                          fill: "#64748b",
                        }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fontSize: 11,
                          fill: "#64748b",
                        }}
                      />
                      <Tooltip
                        cursor={{
                          fill: "#f8fafc",
                        }}
                        contentStyle={{
                          borderRadius:
                            "12px",
                          border:
                            "1px solid #e2e8f0",
                          boxShadow:
                            "0 10px 25px rgba(15,23,42,0.08)",
                          background: "white",
                        }}
                        formatter={(value) => [
                          `${value ?? 0} tiket`,
                          "Tiket Masuk",
                        ]}
                      />
                      <Bar
                        dataKey="tiket"
                        name="Tiket Masuk"
                        fill="#2563eb"
                        radius={[
                          6,
                          6,
                          0,
                          0,
                        ]}
                        maxBarSize={38}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50/80 border border-slate-200/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Inbox
                    size={16}
                    className="text-blue-600"
                  />
                  <span className="text-xs font-medium text-slate-500">
                    Total tiket tahun ini
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {loading
                    ? "..."
                    : totalTicketsThisYear}{" "}
                  tiket
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              KATEGORI TIKET
          ================================================= */}
          <div className="mt-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                  <Layers3
                    size={19}
                    className="text-indigo-600"
                  />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Kategori Tiket
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Jumlah laporan berdasarkan kategori
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-400">
                Total {total} tiket
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 items-center gap-6 xl:grid-cols-[1fr_180px]">
              <div className="h-[260px]">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <RefreshCw
                      size={25}
                      className="animate-spin text-blue-600"
                    />
                  </div>
                ) : categoryChartData.length ===
                  0 ? (
                  <div className="flex h-full flex-col items-center justify-center">
                    <Layers3
                      size={38}
                      className="text-slate-300"
                    />
                    <p className="mt-3 text-sm font-medium text-slate-500">
                      Belum ada data kategori
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={
                        categoryChartData
                      }
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 10,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fontSize: 11,
                          fill: "#64748b",
                        }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={75}
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fontSize: 11,
                          fill: "#475569",
                        }}
                      />
                      <Tooltip
                        cursor={{
                          fill: "#f8fafc",
                        }}
                        contentStyle={{
                          borderRadius:
                            "12px",
                          border:
                            "1px solid #e2e8f0",
                          boxShadow:
                            "0 10px 25px rgba(15,23,42,0.08)",
                          background: "white",
                        }}
                        formatter={(value) => [
                          `${value ?? 0} tiket`,
                          "Jumlah",
                        ]}
                      />
                      <Bar
                        dataKey="value"
                        name="Jumlah Tiket"
                        fill="#3b82f6"
                        radius={[
                          0,
                          6,
                          6,
                          0,
                        ]}
                        maxBarSize={25}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* TOP CATEGORY */}
              <div className="flex flex-col items-center justify-center border-l border-slate-200/60 pl-5">
                {topCategory ? (
                  <>
                    <div className="relative flex h-20 w-20 items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-[10px] border-blue-100" />
                      <div
                        className="
                          absolute
                          inset-0
                          rounded-full
                          border-[10px]
                          border-blue-600
                        "
                        style={{
                          clipPath:
                            "inset(0 0 0 50%)",
                        }}
                      />
                      <Layers3
                        size={22}
                        className="relative text-blue-600"
                      />
                    </div>
                    <p className="mt-4 text-[11px] text-slate-400">
                      Paling Banyak
                    </p>
                    <p className="mt-1 text-lg font-bold text-blue-600">
                      {topCategory.name}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {topCategoryPercentage}%
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      dari total tiket
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">
                    Belum ada data
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              TIKET TERBARU
          ================================================= */}
          <div className="mt-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200/60 px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Tiket Terbaru
                  </h2>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">
                    {latestTickets.length} terbaru
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Tiket terbaru yang masuk ke sistem
                </p>
              </div>
              <Link
                href="/tickets"
                className="
                  flex
                  items-center
                  gap-1
                  rounded-xl
                  border
                  border-slate-200/60
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-blue-600
                  transition-all
                  hover:bg-blue-50
                "
              >
                Lihat Semua
                <ChevronRight size={15} />
              </Link>
            </div>

            {search && (
              <div className="border-b border-slate-200/60 bg-slate-50/80 px-6 py-3">
                <p className="text-xs text-slate-500">
                  Menampilkan{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredTickets.length}
                  </span>{" "}
                  tiket untuk pencarian{" "}
                  <span className="font-semibold text-blue-600">
                    "{search}"
                  </span>
                </p>
              </div>
            )}

            {loading ? (
              <div className="py-20 text-center">
                <RefreshCw
                  size={26}
                  className="mx-auto animate-spin text-blue-600"
                />
                <p className="mt-3 text-sm text-slate-500">
                  Memuat tiket...
                </p>
              </div>
            ) : latestTickets.length === 0 ? (
              <div className="py-20 text-center">
                <Ticket
                  size={42}
                  className="mx-auto text-slate-300"
                />
                <p className="mt-4 font-semibold text-slate-600">
                  Tidak ada tiket
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Belum ada tiket yang sesuai.
                </p>
              </div>
            ) : (
              <div>
                {latestTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="
                      group
                      flex
                      items-center
                      gap-4
                      border-b
                      border-slate-100/80
                      px-6
                      py-3.5
                      transition-all
                      duration-200
                      last:border-b-0
                      hover:bg-blue-50/40
                    "
                  >
                    <div
                      className="
                        hidden
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-50
                        text-blue-600
                        transition
                        group-hover:bg-blue-100
                        sm:flex
                      "
                    >
                      <Ticket size={18} />
                    </div>

                    <div className="w-48 shrink-0">
                      <p className="truncate text-xs font-bold text-slate-800">
                        #{ticket.ticketNumber}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-slate-400">
                        {ticket.subject}
                      </p>
                    </div>

                    <div className="hidden w-44 shrink-0 lg:block">
                      <p className="truncate text-xs font-semibold text-slate-700">
                        {ticket.requesterName}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-slate-400">
                        {ticket.requesterEmail}
                      </p>
                    </div>

                    <div className="hidden w-28 shrink-0 xl:block">
                      <p className="text-xs text-slate-600">
                        {formatCategory(
                          ticket.category
                        )}
                      </p>
                    </div>

                    <div className="hidden w-24 shrink-0 md:block">
                      <span
                        className={`
                          inline-flex
                          rounded-md
                          border
                          px-2
                          py-1
                          text-[10px]
                          font-semibold
                          ${getPriorityClass(
                            ticket.priority
                          )}
                        `}
                      >
                        {formatPriority(
                          ticket.priority
                        )}
                      </span>
                    </div>

                    <div className="hidden w-28 shrink-0 sm:block">
                      <span
                        className={`
                          inline-flex
                          rounded-md
                          border
                          px-2
                          py-1
                          text-[10px]
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
                    </div>

                    <div className="hidden min-w-0 flex-1 text-right xl:block">
                      <p className="text-[11px] font-medium text-slate-500">
                        {formatDate(
                          ticket.createdAt
                        )}
                      </p>
                    </div>

                    <ChevronRight
                      size={17}
                      className="
                        shrink-0
                        text-slate-300
                        transition
                        group-hover:translate-x-0.5
                        group-hover:text-blue-500
                      "
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}