"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  User,
  UserPlus,
  LogOut,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";

type UserData = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
};

export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  const router = useRouter();

  // =========================================================
  // BACA USER DARI JWT
  // =========================================================

  const getUserFromToken = (): UserData | null => {
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      if (!token) {
        return null;
      }

      const parts = token.split(".");

      if (parts.length !== 3) {
        return null;
      }

      const base64 = parts[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const padded = base64.padEnd(
        base64.length +
          ((4 - (base64.length % 4)) % 4),
        "="
      );

      const payload = JSON.parse(atob(padded));

      return {
        id: payload.sub,
        name:
          payload.name ||
          payload.fullName ||
          payload.username ||
          "",
        email: payload.email || "",
        role: payload.role || "user",
        avatar: payload.avatar || "",
      };
    } catch (error) {
      console.error(
        "Gagal membaca user dari token:",
        error
      );

      return null;
    }
  };

  // =========================================================
  // LOAD USER
  // =========================================================

  const loadUser = () => {
    try {
      // PRIORITAS 1: localStorage user
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);

        setUser(parsedUser);

        return;
      }

      // PRIORITAS 2: JWT
      const tokenUser = getUserFromToken();

      if (tokenUser) {
        localStorage.setItem(
          "user",
          JSON.stringify(tokenUser)
        );

        setUser(tokenUser);

        window.dispatchEvent(
          new Event("userUpdated")
        );

        return;
      }

      setUser(null);
    } catch (error) {
      console.error(
        "Gagal mengambil data user:",
        error
      );

      setUser(null);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadUser();

    const handleStorageChange = (
      event: StorageEvent
    ) => {
      if (
        event.key === "user" ||
        event.key === "token" ||
        event.key === "accessToken"
      ) {
        loadUser();
      }
    };

    const handleUserUpdated = () => {
      loadUser();
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    window.addEventListener(
      "userUpdated",
      handleUserUpdated
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        "userUpdated",
        handleUserUpdated
      );
    };
  }, []);

  // =========================================================
  // USER
  // =========================================================

  const userName =
    user?.name?.trim() || "Pengguna";

  const userEmail =
    user?.email || "";

  const userRole =
    user?.role?.toLowerCase() || "user";

  const roleLabel =
    userRole === "admin"
      ? "Administrator"
      : userRole === "agent"
      ? "Agent"
      : "Pelapor";

  // =========================================================
  // AVATAR
  // =========================================================

  const getInitials = () => {
    return (
      userName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase() || "U"
    );
  };

  const getAvatarDisplay = () => {
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt={userName}
          className="w-full h-full object-cover"
        />
      );
    }

    return (
      <span className="text-sm font-bold text-white">
        {getInitials()}
      </span>
    );
  };

  // =========================================================
  // PROFILE
  // =========================================================

  const handleProfile = () => {
    setOpenDropdown(false);

    router.push("/profile");
  };

  // =========================================================
  // ADD ACCOUNT
  // =========================================================

  const handleAddAccount = () => {
    setOpenDropdown(false);

    router.push("/register");
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    setUser(null);
    setOpenDropdown(false);

    router.replace("/login");
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <header
      className="
        sticky
        top-0
        z-40
        h-[88px]
        bg-white
        border-b
        border-slate-200
      "
    >
      <div
        className="
          h-full
          px-6
          lg:px-8
          flex
          items-center
          justify-between
        "
      >

        {/* ===================================================
            LEFT
        =================================================== */}

        <div>
          <h1
            className="
              text-xl
              font-bold
              text-slate-800
            "
          >
            Ticketing System
          </h1>

          <p
            className="
              text-sm
              text-slate-500
              mt-1
            "
          >
            Kelola tiket dengan mudah
            dan cepat.
          </p>
        </div>

        {/* ===================================================
            RIGHT
        =================================================== */}

        <div
          className="
            flex
            items-center
            gap-4
          "
        >

          {/* DIVIDER */}

          <div
            className="
              hidden
              sm:block
              h-8
              w-px
              bg-slate-200
            "
          />

          {/* =================================================
              PROFILE
          ================================================= */}

          <div className="relative">

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              {/* AVATAR */}

              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(
                    (previous) => !previous
                  )
                }
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-blue-600
                  flex
                  items-center
                  justify-center
                  text-white
                  overflow-hidden
                  flex-shrink-0
                "
              >
                {getAvatarDisplay()}
              </button>

              {/* USER */}

              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(
                    (previous) => !previous
                  )
                }
                className="
                  hidden
                  sm:block
                  text-left
                  max-w-[180px]
                "
              >
                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-800
                    truncate
                  "
                >
                  {userName}
                </p>

                <p
                  className="
                    text-xs
                    text-slate-500
                    mt-0.5
                  "
                >
                  {roleLabel}
                </p>
              </button>

              {/* CHEVRON */}

              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(
                    (previous) => !previous
                  )
                }
                className="
                  w-8
                  h-8
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-slate-400
                  hover:bg-slate-100
                "
              >
                <ChevronDown
                  size={17}
                  className={
                    openDropdown
                      ? "rotate-180 transition-transform"
                      : "transition-transform"
                  }
                />
              </button>

            </div>

            {/* =================================================
                PROFILE DROPDOWN
            ================================================= */}

            {openDropdown && (
              <>

                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(false)
                  }
                  className="
                    fixed
                    inset-0
                    z-40
                    cursor-default
                  "
                  aria-label="Tutup menu"
                />

                <div
                  className="
                    absolute
                    right-0
                    top-14
                    w-72
                    bg-white
                    border
                    border-slate-200
                    rounded-xl
                    shadow-lg
                    z-50
                    overflow-hidden
                  "
                >

                  {/* USER INFO */}

                  <div
                    className="
                      px-4
                      py-4
                      bg-slate-50
                      border-b
                      border-slate-200
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
                          w-11
                          h-11
                          rounded-full
                          bg-blue-600
                          flex
                          items-center
                          justify-center
                          text-white
                          overflow-hidden
                        "
                      >
                        {getAvatarDisplay()}
                      </div>

                      <div className="min-w-0">

                        <p
                          className="
                            text-sm
                            font-semibold
                            text-slate-800
                            truncate
                          "
                        >
                          {userName}
                        </p>

                        <p
                          className="
                            text-xs
                            text-slate-500
                            truncate
                            mt-1
                          "
                        >
                          {userEmail || "-"}
                        </p>

                        <p
                          className="
                            text-xs
                            text-slate-500
                            mt-1
                          "
                        >
                          {roleLabel}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* MENU */}

                  <div className="p-2">

                    {/* PROFIL */}

                    <button
                      type="button"
                      onClick={handleProfile}
                      className="
                        w-full
                        flex
                        items-center
                        gap-3
                        px-3
                        py-3
                        rounded-lg
                        text-left
                        text-slate-700
                        hover:bg-slate-50
                      "
                    >
                      <User size={18} />

                      <span
                        className="
                          text-sm
                          font-medium
                        "
                      >
                        Profil Saya
                      </span>
                    </button>

                    {/* PENGATURAN */}

                    <button
                      type="button"
                      onClick={handleProfile}
                      className="
                        w-full
                        flex
                        items-center
                        gap-3
                        px-3
                        py-3
                        rounded-lg
                        text-left
                        text-slate-700
                        hover:bg-slate-50
                      "
                    >
                      <Settings size={18} />

                      <span
                        className="
                          text-sm
                          font-medium
                        "
                      >
                        Pengaturan Profil
                      </span>
                    </button>

                    {/* TAMBAH AKUN */}

                    <button
                      type="button"
                      onClick={handleAddAccount}
                      className="
                        w-full
                        flex
                        items-center
                        gap-3
                        px-3
                        py-3
                        rounded-lg
                        text-left
                        text-slate-700
                        hover:bg-slate-50
                      "
                    >
                      <UserPlus size={18} />

                      <span
                        className="
                          text-sm
                          font-medium
                        "
                      >
                        Tambah Akun
                      </span>
                    </button>

                  </div>

                  {/* LOGOUT */}

                  <div
                    className="
                      border-t
                      border-slate-200
                      p-2
                    "
                  >

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="
                        w-full
                        flex
                        items-center
                        gap-3
                        px-3
                        py-3
                        rounded-lg
                        text-left
                        text-red-600
                        hover:bg-red-50
                      "
                    >
                      <LogOut size={18} />

                      <span
                        className="
                          text-sm
                          font-medium
                        "
                      >
                        Keluar
                      </span>
                    </button>

                  </div>

                </div>

              </>
            )}

          </div>

        </div>

      </div>
    </header>
  );
}