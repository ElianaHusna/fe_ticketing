"use client";

import { useState } from "react";
import Link from "next/link";
import { dummyTickets, TicketStatus, TicketPriority, TicketTier, SlaStatus } from "../data/dummyTickets";

const slaColor: Record<SlaStatus, string> = {
  aman: "bg-green-100 text-green-700",
  "mendekati-batas": "bg-yellow-100 text-yellow-700",
  terlampaui: "bg-red-100 text-red-700",
};

const statusLabel: Record<TicketStatus, string> = {
  open: "Open",
  "in-progress": "Diproses",
  escalated: "Eskalasi",
  resolved: "Selesai",
};

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");
  const [tierFilter, setTierFilter] = useState<TicketTier | "all">("all");

  const filtered = dummyTickets.filter((t) => {
    const matchSearch =
      t.judul.toLowerCase().includes(search.toLowerCase()) ||
      t.pelapor.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchPriority = priorityFilter === "all" || t.prioritas === priorityFilter;
    const matchTier = tierFilter === "all" || t.tier === tierFilter;
    return matchSearch && matchStatus && matchPriority && matchTier;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Daftar Tiket</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Cari judul, pelapor, atau ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 flex-1 min-w-[200px]"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TicketStatus | "all")}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="all">Semua Status</option>
          <option value="open">Open</option>
          <option value="in-progress">Diproses</option>
          <option value="escalated">Eskalasi</option>
          <option value="resolved">Selesai</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | "all")}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="all">Semua Prioritas</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as TicketTier | "all")}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="all">Semua Tier</option>
          <option value="tier-1">Tier 1</option>
          <option value="tier-2">Tier 2</option>
          <option value="tier-3">Tier 3</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Pelapor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Prioritas</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">SLA</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/tickets/${t.id}`} className="text-blue-600 hover:underline">
                    {t.id}
                  </Link>
                </td>
                <td className="px-4 py-3">{t.judul}</td>
                <td className="px-4 py-3">{t.pelapor}</td>
                <td className="px-4 py-3">{statusLabel[t.status]}</td>
                <td className="px-4 py-3 capitalize">{t.prioritas}</td>
                <td className="px-4 py-3">{t.tier}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${slaColor[t.sla]}`}>
                    {t.sla}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  Tidak ada tiket yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}