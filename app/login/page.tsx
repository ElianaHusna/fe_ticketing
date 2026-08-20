"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  Ticket,
  Eye,
  EyeOff,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  // ==================================================
  // API
  // ==================================================

  // Request akan masuk ke Next.js proxy terlebih dahulu.
  // Next.js kemudian meneruskannya ke backend.
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "/backend";

  // ==================================================
  // AMBIL USER DARI TOKEN JWT
  // ==================================================

  const getUserFromToken = (token: string) => {
    try {
      const parts = token.split(".");

      if (parts.length !== 3) {
        throw new Error("Format token JWT tidak valid.");
      }

      const base64Url = parts[1];

      const base64 = base64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const paddedBase64 =
        base64 + "=".repeat((4 - (base64.length % 4)) % 4);

      const payload = JSON.parse(atob(paddedBase64));

      console.log("JWT payload:", payload);

      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      console.error(
        "Gagal membaca data user dari token:",
        error
      );

      return null;
    }
  };

  // ==================================================
  // SUBMIT
  // ==================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ==================================================
    // REGISTER
    // ==================================================

    if (isRegister) {
      if (
        !name.trim() ||
        !email.trim() ||
        !password ||
        !confirmPassword
      ) {
        setError("Semua field wajib diisi.");
        return;
      }

      if (password !== confirmPassword) {
        setError(
          "Password dan konfirmasi password tidak sama."
        );
        return;
      }

      if (password.length < 6) {
        setError("Password minimal 6 karakter.");
        return;
      }

      try {
        setLoading(true);

        const registerUrl =
          `${API_URL}/auth/register`;

        console.log("=== REGISTER ===");
        console.log("Register URL:", registerUrl);

        const response = await fetch(registerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            password_confirmation: confirmPassword,
          }),
        });

        const data = await response.json();

        console.log("Register response:", data);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Registrasi gagal."
          );
        }

        setSuccess(
          "Registrasi berhasil. Silakan login."
        );

        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        setTimeout(() => {
          setIsRegister(false);
          setSuccess("");
        }, 1000);
      } catch (err) {
        console.error("Register error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Tidak dapat terhubung ke server."
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    // ==================================================
    // VALIDASI LOGIN
    // ==================================================

    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    // ==================================================
    // LOGIN
    // ==================================================

    try {
      setLoading(true);

      const loginUrl =
        `${API_URL}/auth/login`;

      console.log("=== LOGIN ===");
      console.log("API URL:", API_URL);
      console.log("Login URL:", loginUrl);
      console.log("Email:", email.trim());

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      console.log(
        "Login HTTP status:",
        response.status
      );

      const data = await response.json();

      console.log("Login response:", data);

      // ==================================================
      // CEK RESPONSE
      // ==================================================

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Email atau password salah."
        );
      }

      // ==================================================
      // AMBIL TOKEN
      // ==================================================

      const token =
        data?.token ||
        data?.access_token ||
        data?.data?.token ||
        data?.data?.access_token;

      console.log(
        "Token ditemukan:",
        !!token
      );

      if (!token) {
        throw new Error(
          "Login berhasil tetapi token tidak ditemukan dari server."
        );
      }

      // ==================================================
      // SIMPAN TOKEN
      // ==================================================

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "accessToken",
        token
      );

      // ==================================================
      // AMBIL DATA USER
      // ==================================================

      let user =
        data?.user ||
        data?.data?.user ||
        null;

      // ==================================================
      // JIKA USER TIDAK ADA,
      // AMBIL DARI JWT
      // ==================================================

      if (!user) {
        console.log(
          "Data user tidak ada di response."
        );

        console.log(
          "Mengambil user dari JWT..."
        );

        user = getUserFromToken(token);
      }

      console.log(
        "User login:",
        user
      );

      // ==================================================
      // CEK USER
      // ==================================================

      if (!user) {
        throw new Error(
          "Data user tidak dapat dibaca dari token."
        );
      }

      // ==================================================
      // SIMPAN USER
      // ==================================================

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // ==================================================
      // CEK ROLE
      // ==================================================

      const role =
        typeof user?.role === "string"
          ? user.role
              .toLowerCase()
              .trim()
          : "";

      console.log(
        "Role user:",
        role
      );

      // ==================================================
      // REDIRECT SESUAI ROLE
      // ==================================================

      if (role === "admin") {
        console.log(
          "Redirect ke dashboard admin"
        );

        router.replace(
          "/dashboard-admin"
        );

        return;
      }

      if (role === "agent") {
        console.log(
          "Redirect ke dashboard admin/agent"
        );

        router.replace(
          "/dashboard-admin"
        );

        return;
      }

      if (role === "user") {
        console.log(
          "Redirect ke dashboard user"
        );

        router.replace(
          "/dashboard"
        );

        return;
      }

      // ==================================================
      // ROLE TIDAK DIKENALI
      // ==================================================

      throw new Error(
        `Role akun tidak dikenali: ${
          user?.role || "tidak ada"
        }`
      );
    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Tidak dapat terhubung ke server."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // SWITCH LOGIN / REGISTER
  // ==================================================

  const switchMode = () => {
    setIsRegister(
      (prev) => !prev
    );

    setError("");
    setSuccess("");

    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

    setShowPassword(false);
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* ==================================================
            LEFT
        ================================================== */}

        <div className="hidden md:flex bg-slate-950 p-10 lg:p-14 flex-col justify-between relative overflow-hidden">

          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl" />

          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />

          {/* Logo */}

          <div className="relative z-10">
            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center">
                <Ticket
                  size={24}
                  className="text-white"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  Ticketing
                </h2>

                <p className="text-xs text-slate-400">
                  Helpdesk System
                </p>
              </div>

            </div>
          </div>

          {/* Description */}

          <div className="relative z-10">

            <p className="text-blue-400 text-sm font-medium mb-3">
              {isRegister
                ? "Daftar Sekarang"
                : "Helpdesk Support"}
            </p>

            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">

              {isRegister ? (
                <>
                  Mulai gunakan
                  <br />
                  layanan kami.
                </>
              ) : (
                <>
                  Kelola tiket
                  <br />
                  dengan mudah.
                </>
              )}

            </h1>

            <p className="text-slate-400 mt-5 max-w-md leading-relaxed">

              {isRegister
                ? "Daftarkan akun Anda dan nikmati kemudahan dalam mengelola tiket dukungan teknis."
                : "Laporkan masalah, pantau perkembangan tiket, dan dapatkan bantuan dari tim support dengan lebih cepat."}

            </p>

          </div>

          {/* Footer */}

          <div className="relative z-10 text-xs text-slate-500">
            © 2026 Ticketing System
          </div>

        </div>

        {/* ==================================================
            RIGHT
        ================================================== */}

        <div className="p-8 sm:p-10 lg:p-14">

          {/* Mobile Logo */}

          <div className="flex md:hidden items-center gap-3 mb-10">

            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center">
              <Ticket
                size={24}
                className="text-white"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Ticketing
              </h2>

              <p className="text-xs text-slate-500">
                Helpdesk System
              </p>
            </div>

          </div>

          {/* Header */}

          <div className="mb-8">

            <p className="text-sm font-medium text-blue-600 mb-2">
              {isRegister
                ? "Buat akun"
                : "Selamat datang"}
            </p>

            <h1 className="text-3xl font-bold text-slate-900">
              {isRegister
                ? "Daftar akun baru"
                : "Login ke akun Anda"}
            </h1>

            <p className="text-slate-500 mt-2">
              {isRegister
                ? "Daftarkan akun untuk menggunakan Ticketing System."
                : "Masuk untuk mengelola dan memantau tiket Anda."}
            </p>

          </div>

          {/* Error */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* Success */}

          {success && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm text-green-600">
                {success}
              </p>
            </div>
          )}

          {/* ==================================================
              FORM
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Nama */}

            {isRegister && (
              <div>

                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Nama Lengkap
                </label>

                <div className="relative">

                  <User
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                    placeholder="Nama lengkap"
                    className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />

                </div>

              </div>
            )}

            {/* Email */}

            <div>

              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Email
              </label>

              <div className="relative">

                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="nama@perusahaan.com"
                  className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

              </div>

            </div>

            {/* Password */}

            <div>

              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Password
              </label>

              <div className="relative">

                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder={
                    isRegister
                      ? "Minimal 6 karakter"
                      : "Masukkan password"
                  }
                  className="w-full border border-slate-300 rounded-xl pl-11 pr-12 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={
                    showPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

            </div>

            {/* Confirm Password */}

            {isRegister && (
              <div>

                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Konfirmasi Password
                </label>

                <div className="relative">

                  <Lock
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Ulangi password"
                    className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />

                </div>

              </div>
            )}

            {/* Button */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-blue-600/20"
            >
              {loading
                ? "Memproses..."
                : isRegister
                  ? "Daftar"
                  : "Masuk"}
            </button>

          </form>

          {/* Switch */}

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">

            <p className="text-sm text-slate-500">

              {isRegister
                ? "Sudah punya akun?"
                : "Belum punya akun?"}

              {isRegister ? (
                <button
                  type="button"
                  onClick={switchMode}
                  className="ml-2 font-semibold text-blue-600 hover:text-blue-700"
                >
                  Masuk
                </button>
              ) : (
                <Link
                  href="/register"
                  className="ml-2 font-semibold text-blue-600 hover:text-blue-700"
                >
                  Daftar sekarang
                </Link>
              )}

            </p>

          </div>

        </div>
      </div>
    </div>
  );
}