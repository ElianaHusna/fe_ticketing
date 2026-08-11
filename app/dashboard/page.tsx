import Link from "next/link";
import { dummyTickets } from "../data/dummyTickets";

export default function DashboardPage() {
  const total = dummyTickets.length;
  const open = dummyTickets.filter((t) => t.status === "open").length;
  const inProgress = dummyTickets.filter((t) => t.status === "in-progress").length;
  const escalated = dummyTickets.filter((t) => t.status === "escalated").length;
  const resolved = dummyTickets.filter((t) => t.status === "resolved").length;

  const slaAman = dummyTickets.filter((t) => t.sla === "aman").length;
  const slaMendekati = dummyTickets.filter((t) => t.sla === "mendekati-batas").length;
  const slaTerlampaui = dummyTickets.filter((t) => t.sla === "terlampaui").length;

  const priorityHigh = dummyTickets.filter((t) => t.prioritas === "high").length;
  const priorityMedium = dummyTickets.filter((t) => t.prioritas === "medium").length;
  const priorityLow = dummyTickets.filter((t) => t.prioritas === "low").length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Dashboard Admin</h1>
        <Link href="/tickets" className="text-blue-600 hover:underline text-sm">
          Lihat Daftar Tiket →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-gray-500 text-sm">Total Tiket</p>
          <p className="text-3xl font-semibold mt-1">{total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-gray-500 text-sm">Open</p>
          <p className="text-3xl font-semibold mt-1 text-blue-600">{open}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-gray-500 text-sm">Diproses</p>
          <p className="text-3xl font-semibold mt-1 text-yellow-600">{inProgress}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-gray-500 text-sm">Eskalasi</p>
          <p className="text-3xl font-semibold mt-1 text-orange-600">{escalated}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-medium mb-4">Status SLA</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Aman</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                {slaAman} tiket
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Mendekati Batas</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                {slaMendekati} tiket
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Terlampaui</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                {slaTerlampaui} tiket
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-medium mb-4">Prioritas Tiket</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">High</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                {priorityHigh} tiket
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Medium</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                {priorityMedium} tiket
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Low</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {priorityLow} tiket
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="font-medium mb-2">Tiket Selesai</h2>
        <p className="text-3xl font-semibold text-green-600">{resolved} <span className="text-base font-normal text-gray-500">dari {total} tiket</span></p>
      </div>
    </div>
  );
}