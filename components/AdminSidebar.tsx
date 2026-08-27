"use client";

import Link from "next/link";
import {
  usePathname,
  useSearchParams,
  useRouter,
} from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  Inbox,
  Users,
  Settings,
  LogOut,
  User,
  Star,
  ChevronRight,
} from "lucide-react";

type UserData = {
  name?: string;
  email?: string;
  role?: string;
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentStatus =
    searchParams.get("status");

  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] =
    useState<UserData | null>(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser =
          localStorage.getItem("user");

        if (!savedUser) {
          setUser(null);
          return;
        }

        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    };

    loadUser();

    const handleUserUpdate = () => {
      loadUser();
    };

    window.addEventListener(
      "userUpdated",
      handleUserUpdate
    );

    window.addEventListener(
      "storage",
      handleUserUpdate
    );

    return () => {
      window.removeEventListener(
        "userUpdated",
        handleUserUpdate
      );

      window.removeEventListener(
        "storage",
        handleUserUpdate
      );
    };
  }, []);

  // =====================================================
  // MENU
  // =====================================================

  const menus = [
    {
      name: "Dashboard",
      href: "/dashboard-admin",
      icon: LayoutDashboard,
    },

    {
      name: "Semua Tiket",
      href: "/tickets",
      icon: Inbox,
      ticketMenu: true,
      status: undefined,
    },

    {
  name: "Escalations",
  href: "/escalations",
  icon: Users,
},

{
  name: "Rating & Masukan",
  href: "/feedback",
  icon: Star,
},

    {
      name: "Pengaturan",
      href: "/settings",
      icon: Settings,
    },
  ];

  // =====================================================
  // ACTIVE MENU
  // =====================================================

  const isActive = (
    menu: (typeof menus)[number]
  ) => {
    // ===================================================
    // DASHBOARD
    // ===================================================

    if (
      menu.href ===
      "/dashboard-admin"
    ) {
      return (
        pathname ===
        "/dashboard-admin"
      );
    }

    // ===================================================
    // SEMUA TIKET
    // ===================================================

    if (menu.ticketMenu) {
      if (pathname !== "/tickets") {
        return false;
      }

      if (
        menu.status === undefined
      ) {
        return !currentStatus;
      }

      return (
        currentStatus ===
        menu.status
      );
    }

    // ===================================================
    // MENU BIASA
    // ===================================================

    return (
      pathname === menu.href ||
      pathname.startsWith(
        `${menu.href}/`
      )
    );
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "user"
    );

    router.replace("/login");
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <aside
      className="
        fixed
        left-0
        top-0
        z-40
        flex
        h-screen
        w-64
        flex-col
        bg-slate-950
        text-white
      "
    >

      {/* =================================================
          LOGO
      ================================================= */}

      <div
        className="
          border-b
          border-slate-800
          px-6
          py-6
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-blue-600
              shadow-lg
              shadow-blue-600/20
            "
          >
            <Ticket size={21} />
          </div>

          <div>

            <h1
              className="
                text-lg
                font-bold
              "
            >
              Ticketing
            </h1>

            <p
              className="
                text-xs
                text-slate-400
              "
            >
              Admin Helpdesk
            </p>

          </div>

        </div>

      </div>

      {/* =================================================
          MENU
      ================================================= */}

      <nav
        className="
          flex-1
          overflow-y-auto
          px-4
          py-6
        "
      >

        <p
          className="
            mb-3
            px-3
            text-[11px]
            font-semibold
            uppercase
            tracking-wider
            text-slate-500
          "
        >
          Menu Utama
        </p>

        <div
          className="
            space-y-1.5
          "
        >

          {menus.map((menu) => {
            const Icon =
              menu.icon;

            const active =
              isActive(menu);

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  px-3.5
                  py-3
                  text-sm
                  font-medium
                  transition

                  ${
                    active
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <Icon
                    size={18}
                    className={
                      active
                        ? "text-white"
                        : "text-slate-400"
                    }
                  />

                  <span>
                    {menu.name}
                  </span>

                </div>

                {active && (
                  <ChevronRight
                    size={15}
                    className="
                      text-white/70
                    "
                  />
                )}

              </Link>
            );
          })}

        </div>

      </nav>

      {/* =================================================
          ADMIN PROFILE
      ================================================= */}

      <div
        className="
          border-t
          border-slate-800
          p-4
        "
      >

        <div
          className="
            mb-4
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-blue-600
            "
          >
            <User size={18} />
          </div>

          <div
            className="
              min-w-0
            "
          >

            <p
              className="
                truncate
                text-sm
                font-semibold
                text-white
              "
            >
              {user?.name ||
                "Admin"}
            </p>

            <p
              className="
                truncate
                text-xs
                text-slate-400
              "
            >
              {user?.email ||
                "Administrator"}
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={
            handleLogout
          }
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

          Logout

        </button>

      </div>

    </aside>
  );
}