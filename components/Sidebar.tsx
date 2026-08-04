import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-blue-900 text-white fixed">
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-2xl font-bold">🎫 Ticketing</h1>
        <p className="text-sm text-gray-300 mt-1">
          Helpdesk System
        </p>
      </div>

      <nav className="mt-6">
        <Link
          href="/dashboard"
          className="block px-6 py-3 bg-blue-700 hover:bg-blue-600"
        >
          Dashboard
        </Link>

        <Link
          href="/ticket"
          className="block px-6 py-3 hover:bg-blue-800"
        >
          Ticket
        </Link>

        <Link
          href="/status"
          className="block px-6 py-3 hover:bg-blue-800"
        >
          Status
        </Link>

        <Link
          href="/report"
          className="block px-6 py-3 hover:bg-blue-800"
        >
          Laporan
        </Link>

        <Link
          href="/setting"
          className="block px-6 py-3 hover:bg-blue-800"
        >
          Pengaturan
        </Link>
      </nav>
    </aside>
  );
}