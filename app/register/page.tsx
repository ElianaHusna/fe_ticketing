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

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  // =========================
  // API BACKEND
  // =========================
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://192.168.200.193:3000/api/v1";

  // =========================
  // REGISTER
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // =========================
    // VALIDASI
    // =========================

    if (!name || !email || !password || !confirmPassword) {
      setError("Semua field wajib diisi");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    try {
      setLoading(true);

      console.log("=================================");
      console.log("MENGIRIM REGISTER");
      console.log("API:", `${API_URL}/auth/register`);
      console.log("NAME:", name);
      console.log("EMAIL:", email);
      console.log("=================================");

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
            password_confirmation: confirmPassword,
          }),
        }
      );

      console.log("FETCH SELESAI");
      console.log("STATUS:", response.status);

      const data = await response.json();

      console.log("RESPONSE BACKEND:", data);

      // =========================
      // REGISTER GAGAL
      // =========================

      if (!response.ok) {
        if (data.message) {
          setError(data.message);
        } else if (data.error) {
          setError(data.error);
        } else if (data.errors) {
          const firstError = Object.values(data.errors)
            .flat()
            .find(
              (message) => typeof message === "string"
            );

          setError(
            typeof firstError === "string"
              ? firstError
              : "Registrasi gagal"
          );
        } else {
          setError(
            "Registrasi gagal. Silakan coba lagi."
          );
        }

        return;
      }

      // =========================
      // REGISTER BERHASIL
      // =========================

      console.log("REGISTER BERHASIL!");
      console.log(data);

      setSuccess(
        "Registrasi berhasil! Mengalihkan ke halaman login..."
      );

      // Kosongkan form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // =========================
      // PINDAH KE LOGIN
      // =========================

      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch (error) {
      console.error("REGISTER ERROR:", error);

      setError(
        "Tidak dapat terhubung ke server. Pastikan backend sedang berjalan dan alamat IP dapat diakses."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* ================= LEFT ================= */}

        <div className="hidden md:flex bg-slate-950 p-10 lg:p-14 flex-col justify-between relative overflow-hidden">

          {/* Decoration */}

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
              Daftar Sekarang
            </p>

            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Mulai gunakan
              <br />
              layanan kami.
            </h1>

            <p className="text-slate-400 mt-5 max-w-md leading-relaxed">
              Daftarkan akun Anda sekarang dan nikmati
              kemudahan dalam mengelola tiket dukungan
              teknis bersama tim kami.
            </p>

          </div>

          {/* Footer */}

          <div className="relative z-10 text-xs text-slate-500">
            © 2026 Ticketing System
          </div>

        </div>

        {/* ================= RIGHT ================= */}

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
              Buat akun
            </p>

            <h1 className="text-3xl font-bold text-slate-900">
              Daftar akun baru
            </h1>

            <p className="text-slate-500 mt-2">
              Daftarkan akun untuk menggunakan
              Ticketing System.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

              <p className="text-sm text-red-600">
                {error}
              </p>

            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">

              <p className="text-sm font-medium text-green-600">
                {success}
              </p>

            </div>
          )}

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Nama */}

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
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Nama lengkap"
                  disabled={loading}
                  className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
                />

              </div>

            </div>

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
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="nama@perusahaan.com"
                  disabled={loading}
                  className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  disabled={loading}
                  className="w-full border border-slate-300 rounded-xl pl-11 pr-12 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100 disabled:cursor-not-allowed [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                />

                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:pointer-events-none transition-colors"
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  disabled={loading}
                  className="w-full border border-slate-300 rounded-xl pl-11 pr-12 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100 disabled:cursor-not-allowed [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                />

                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  aria-label={
                    showConfirmPassword
                      ? "Sembunyikan konfirmasi password"
                      : "Tampilkan konfirmasi password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Button */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-blue-600/20"
            >
              {loading
                ? "Mendaftarkan..."
                : "Daftar"}
            </button>

          </form>

          {/* Login */}

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">

            <p className="text-sm text-slate-500">
              Sudah punya akun?

              <Link
                href="/login"
                className="ml-2 font-semibold text-blue-600 hover:text-blue-700"
              >
                Masuk
              </Link>
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}