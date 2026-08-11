export type TicketStatus = "open" | "in-progress" | "escalated" | "resolved";
export type TicketPriority = "low" | "medium" | "high";
export type TicketTier = "tier-1" | "tier-2" | "tier-3";
export type SlaStatus = "aman" | "mendekati-batas" | "terlampaui";

export interface Ticket {
  id: string;
  judul: string;
  pelapor: string;
  status: TicketStatus;
  prioritas: TicketPriority;
  tier: TicketTier;
  sla: SlaStatus;
  deskripsi: string;
  dibuatPada: string;
  riwayat: { waktu: string; aktivitas: string }[];
}

export const dummyTickets: Ticket[] = [
  {
    id: "TCK-001",
    judul: "Login gagal terus menerus",
    pelapor: "Budi Santoso",
    status: "open",
    prioritas: "high",
    tier: "tier-2",
    sla: "mendekati-batas",
    deskripsi: "User tidak bisa login sejak pagi ini, muncul error 500.",
    dibuatPada: "2026-08-09 08:15",
    riwayat: [{ waktu: "2026-08-09 08:15", aktivitas: "Tiket dibuat oleh pelapor" }],
  },
  {
    id: "TCK-002",
    judul: "Permintaan reset password",
    pelapor: "Sari Wijaya",
    status: "in-progress",
    prioritas: "medium",
    tier: "tier-1",
    sla: "aman",
    deskripsi: "User lupa password dan butuh reset manual.",
    dibuatPada: "2026-08-09 09:00",
    riwayat: [
      { waktu: "2026-08-09 09:00", aktivitas: "Tiket dibuat oleh pelapor" },
      { waktu: "2026-08-09 09:10", aktivitas: "Ditugaskan ke agen Rina" },
    ],
  },
  {
    id: "TCK-003",
    judul: "Data laporan tidak muncul",
    pelapor: "Ahmad Fauzi",
    status: "escalated",
    prioritas: "high",
    tier: "tier-3",
    sla: "terlampaui",
    deskripsi: "Modul laporan bulanan kosong sejak update terakhir.",
    dibuatPada: "2026-08-08 14:30",
    riwayat: [
      { waktu: "2026-08-08 14:30", aktivitas: "Tiket dibuat oleh pelapor" },
      { waktu: "2026-08-08 15:00", aktivitas: "Eskalasi ke tim backend" },
    ],
  },
  {
    id: "TCK-004",
    judul: "Permintaan penambahan fitur export",
    pelapor: "Dewi Lestari",
    status: "resolved",
    prioritas: "low",
    tier: "tier-1",
    sla: "aman",
    deskripsi: "User minta fitur export ke Excel ditambahkan.",
    dibuatPada: "2026-08-07 10:00",
    riwayat: [
      { waktu: "2026-08-07 10:00", aktivitas: "Tiket dibuat oleh pelapor" },
      { waktu: "2026-08-07 16:00", aktivitas: "Diselesaikan, fitur sudah tersedia" },
    ],
  },
];