"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Search,
  Star,
  LogOut,
  User,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menus = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Buat Tiket", href: "/submit-ticket", icon: Ticket },
    { name: "Tracking", href: "/tracking", icon: Search },
    { name: "Rating", href: "/rating", icon: Star },
  ];

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-slate-900 text-slate-100 border-r border-slate-800">
      {/* Header / Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
          <Ticket size={18} />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white">
            Ticketing
          </h1>
          <p className="text-[11px] font-medium text-slate-400">
            Helpdesk System
          </p>
        </div>
      </div>

      {/* Menu Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </p>
        <nav className="space-y-1">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const active = pathname === menu.href;

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={active ? "text-white" : "text-slate-400"}
                  />
                  <span>{menu.name}</span>
                </div>
                {active && <ChevronRight size={15} className="text-white/80" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick Stats */}
      <div className="mx-4 mb-4 rounded-xl bg-slate-800 border border-slate-700/60 p-3.5">
        <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
          Ringkasan Tiket
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-700/40">
            <p className="text-[10px] font-medium text-slate-400">Total</p>
            <p className="mt-0.5 text-sm font-bold text-white">12</p>
          </div>
          <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-700/40">
            <p className="text-[10px] font-medium text-amber-400">Proses</p>
            <p className="mt-0.5 text-sm font-bold text-amber-400">3</p>
          </div>
          <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-700/40">
            <p className="text-[10px] font-medium text-emerald-400">Selesai</p>
            <p className="mt-0.5 text-sm font-bold text-emerald-400">9</p>
          </div>
        </div>
      </div>

      {/* User Section */}
      <div className="border-t border-slate-800 bg-slate-900/50 p-4">
        <div className="flex items-center gap-3 px-1 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            <User size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              Guest User
            </h3>
            <p className="text-xs text-slate-400 truncate">Pelapor</p>
          </div>
        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 py-2 text-xs font-semibold text-slate-300 hover:bg-red-600/10 hover:border-red-500/30 hover:text-red-400 transition-colors">
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}