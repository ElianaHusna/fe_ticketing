"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { dummyTickets } from "../../data/dummyTickets";

export default function TicketDetailPage() {
  const params = useParams();
  const ticket = dummyTickets.find((t) => t.id === params.id);

  const [showEscalate, setShowEscalate] = useState(false);
  const [escalateReason, setEscalateReason] = useState("");
  const [showResolve, setShowResolve] = useState(false);
  const [resolveNote, setResolveNote] = useState("");

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-500 mb-4">Tiket tidak ditemukan.</p>
          <Link href="/tickets" className="text-blue-600 hover:underline">
            Kembali ke Daftar Tiket
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Link href="/tickets" className="text-blue-600 hover:underline text-sm">
        ← Kembali ke Daftar Tiket
      </Link>

      <div className="bg-white rounded-lg shadow p-6 mt-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-semibold">{ticket.judul}</h1>
            <p className="text-gray-500 text-sm">{ticket.id} • Tier {ticket.tier.split("-")[1]}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div><span className="text-gray-500">Pelapor:</span> {ticket.pelapor}</div>
          <div><span className="text-gray-500">Status:</span> {ticket.status}</div>
          <div><span className="text-gray-500">Prioritas:</span> {ticket.prioritas}</div>
          <div><span className="text-gray-500">SLA:</span> {ticket.sla}</div>
        </div>

        <div className="mb-6">
          <h2 className="font-medium mb-2">Deskripsi</h2>
          <p className="text-gray-700 text-sm">{ticket.deskripsi}</p>
        </div>

        <div className="mb-6">
          <h2 className="font-medium mb-2">Riwayat Aktivitas</h2>
          <ul className="space-y-2">
            {ticket.riwayat.map((r, i) => (
              <li key={i} className="text-sm border-l-2 border-blue-300 pl-3">
                <span className="text-gray-400">{r.waktu}</span> — {r.aktivitas}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3 flex-wrap border-t pt-4">
          <button
            onClick={() => alert("Tiket di-assign ke kamu (contoh saja, belum terhubung backend)")}
            className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-900"
          >
            Assign ke saya
          </button>

          <button
            onClick={() => setShowEscalate(!showEscalate)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-600"
          >
            Escalate
          </button>

          <button
            onClick={() => setShowResolve(!showResolve)}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
          >
            Resolve
          </button>
        </div>

        {showEscalate && (
          <div className="mt-4 border-t pt-4">
            <label className="block text-sm font-medium mb-1">Alasan eskalasi (wajib)</label>
            <textarea
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              rows={3}
              placeholder="Jelaskan alasan eskalasi..."
            />
            <button
              onClick={() => {
                if (!escalateReason) {
                  alert("Alasan wajib diisi");
                  return;
                }
                alert("Tiket berhasil di-eskalasi (contoh saja)");
                setShowEscalate(false);
                setEscalateReason("");
              }}
              className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700"
            >
              Kirim Eskalasi
            </button>
          </div>
        )}

        {showResolve && (
          <div className="mt-4 border-t pt-4">
            <label className="block text-sm font-medium mb-1">Catatan solusi</label>
            <textarea
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              rows={3}
              placeholder="Jelaskan solusi yang diberikan..."
            />
            <button
              onClick={() => {
                alert("Tiket berhasil diselesaikan (contoh saja)");
                setShowResolve(false);
                setResolveNote("");
              }}
              className="mt-2 bg-green-700 text-white px-4 py-2 rounded-md text-sm hover:bg-green-800"
            >
              Tandai Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  );
}