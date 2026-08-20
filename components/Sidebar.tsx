"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Search,
  Star,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // =====================================================
  // MENU USER
  // =====================================================

  const menus = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Buat Tiket",
      href: "/submit-ticket",
      icon: Ticket,
    },
    {
      name: "Tracking Tiket",
      href: "/tracking",
      icon: Search,
    },
    {
      name: "Rating",
      href: "/rating",
      icon: Star,
    },
  ];

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    router.replace("/login");
  };

  // =====================================================
  // ACTIVE MENU
  // =====================================================

  const isActive = (href: string) => {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-slate-900 text-white">

      {/* =================================================
          LOGO
      ================================================= */}

      <div className="border-b border-slate-800 px-6 py-6">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
            <Ticket size={20} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Ticketing
            </h1>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Helpdesk System
            </p>
          </div>

        </div>

      </div>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav className="flex-1 px-4 py-6">

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
          Menu Utama
        </p>

        <div className="space-y-1.5">

          {menus.map((menu) => {

            const Icon = menu.icon;
            const active = isActive(menu.href);

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`
                  group
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-medium
                  transition-all
                  ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >

                <div className="flex items-center gap-3">

                  <Icon
                    size={19}
                    className={
                      active
                        ? "text-white"
                        : "text-slate-400 group-hover:text-slate-200"
                    }
                  />

                  <span>
                    {menu.name}
                  </span>

                </div>

                {active && (
                  <ChevronRight
                    size={16}
                    className="text-white/80"
                  />
                )}

              </Link>
            );
          })}

        </div>

      </nav>

      {/* =================================================
          BANTUAN / INFO
      ================================================= */}

      <div className="mx-4 mb-4 rounded-xl border border-slate-800 bg-slate-800/50 p-4">

        <div className="flex items-start gap-3">

          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
            <MessageIcon />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-200">
              Butuh bantuan?
            </p>

            <p className="mt-1 text-[11px] leading-4 text-slate-500">
              Pantau balasan admin melalui Tracking Tiket.
            </p>
          </div>

        </div>

      </div>

      {/* =================================================
          LOGOUT
      ================================================= */}

      <div className="border-t border-slate-800 p-4">

        <button
          type="button"
          onClick={handleLogout}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-700
            py-2.5
            text-sm
            font-medium
            text-slate-300
            transition
            hover:border-red-500/30
            hover:bg-red-500/10
            hover:text-red-400
          "
        >

          <LogOut size={16} />

          <span>
            Logout
          </span>

        </button>

      </div>

    </aside>
  );
}

// =====================================================
// SIMPLE MESSAGE ICON
// =====================================================

function MessageIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-blue-400"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.2 9.2 0 0 1-3.9-.9L3 21l1.9-4.1A8.4 8.4 0 1 1 21 11.5Z" />
    </svg>
  );
}