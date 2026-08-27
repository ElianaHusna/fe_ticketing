"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  Ticket,
  Eye,
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

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://192.168.200.193:3000/api/v1";

  // ==================================================
  // PARSE RESPONSE API
  // ==================================================

  const parseResponse = async (response: Response) => {
    const contentType =
      response.headers.get("content-type") || "";

    const rawResponse = await response.text();

    console.log("Response content-type:", contentType);
    console.log("Response raw:", rawResponse);

    // ==================================================
    // JSON RESPONSE
    // ==================================================

    if (contentType.includes("application/json")) {
      try {
        return rawResponse
          ? JSON.parse(rawResponse)
          : {};
      } catch (error) {
        console.error(
          "JSON response tidak valid:",
          error
        );

        throw new Error(
          "Server mengembalikan JSON yang tidak valid."
        );
      }
    }

    // ==================================================
    // TEXT / HTML RESPONSE
    // ==================================================

    return {
      message:
        rawResponse ||
        "Server tidak mengembalikan response yang valid.",
    };
  };

  // ==================================================
  // AMBIL USER DARI TOKEN JWT
  // ==================================================

  const getUserFromToken = (token: string) => {
    try {
      const parts = token.split(".");

      if (parts.length !== 3) {
        throw new Error(
          "Format token JWT tidak valid."
        );
      }

      const base64Url = parts[1];

      const base64 = base64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const paddedBase64 =
        base64 +
        "=".repeat(
          (4 - (base64.length % 4)) % 4
        );

      const payload = JSON.parse(
        atob(paddedBase64)
      );

      console.log("JWT payload:", payload);

      // ==================================================
      // AMBIL NAMA
      // ==================================================

      const userName =
        payload.name ||
        payload.nama ||
        payload.full_name ||
        null;

      console.log(
        "Nama dari JWT:",
        userName
      );

      return {
        id:
          payload.sub ||
          payload.id,

        name: userName,

        email:
          payload.email,

        role:
          payload.role,
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
      // ==================================================
      // VALIDASI REGISTER
      // ==================================================

      if (
        !name.trim() ||
        !email.trim() ||
        !password ||
        !confirmPassword
      ) {
        setError(
          "Semua field wajib diisi."
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Password dan konfirmasi password tidak sama."
        );

        return;
      }

      if (password.length < 6) {
        setError(
          "Password minimal 6 karakter."
        );

        return;
      }

      // ==================================================
      // REQUEST REGISTER
      // ==================================================

      try {
        setLoading(true);

        const registerUrl =
          `${API_URL}/auth/register`;

        console.log(
          "========================================"
        );

        console.log("REGISTER");

        console.log(
          "API URL:",
          API_URL
        );

        console.log(
          "Register URL:",
          registerUrl
        );

        console.log(
          "Nama:",
          name.trim()
        );

        console.log(
          "Email:",
          email.trim()
        );

        console.log(
          "========================================"
        );

        const response =
          await fetch(
            registerUrl,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify({
                  name:
                    name.trim(),

                  email:
                    email.trim(),

                  password,

                  password_confirmation:
                    confirmPassword,
                }),
            }
          );

        console.log(
          "Register HTTP status:",
          response.status
        );

        // ==================================================
        // PARSE RESPONSE
        // ==================================================

        const data =
          await parseResponse(
            response
          );

        console.log(
          "REGISTER RESPONSE:",
          data
        );

        // ==================================================
        // ERROR REGISTER
        // ==================================================

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Registrasi gagal."
          );
        }

        // ==================================================
        // SIMPAN NAMA
        // ==================================================

        const savedName =
          name.trim();

        localStorage.setItem(
          "registerName",
          savedName
        );

        localStorage.setItem(
          "userName",
          savedName
        );

        console.log(
          "Nama register disimpan:",
          savedName
        );

        // ==================================================
        // SUCCESS
        // ==================================================

        setSuccess(
          "Registrasi berhasil. Silakan login."
        );

        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        // ==================================================
        // KEMBALI KE LOGIN
        // ==================================================

        setTimeout(() => {
          setIsRegister(false);
          setSuccess("");
        }, 1000);
      } catch (err) {
        console.error(
          "Register error:",
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

      return;
    }

    // ==================================================
    // VALIDASI LOGIN
    // ==================================================

    if (
      !email.trim() ||
      !password
    ) {
      setError(
        "Email dan password wajib diisi."
      );

      return;
    }

    // ==================================================
    // LOGIN
    // ==================================================

    try {
      setLoading(true);

      // ==================================================
      // LOGIN URL
      // ==================================================

      const loginUrl =
        `${API_URL}/auth/login`;

      console.log(
        "========================================"
      );

      console.log("LOGIN");

      console.log(
        "API URL:",
        API_URL
      );

      console.log(
        "Login URL:",
        loginUrl
      );

      console.log(
        "Email:",
        email.trim()
      );

      console.log(
        "========================================"
      );

      // ==================================================
      // REQUEST LOGIN
      // ==================================================

      const response =
        await fetch(
          loginUrl,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body:
              JSON.stringify({
                email:
                  email.trim(),

                password,
              }),
          }
        );

      // ==================================================
      // STATUS LOGIN
      // ==================================================

      console.log(
        "Login HTTP status:",
        response.status
      );

      // ==================================================
      // PARSE RESPONSE
      // ==================================================

      const data =
        await parseResponse(
          response
        );

      console.log(
        "LOGIN RESPONSE FULL:",
        data
      );

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

      // ==================================================
      // TOKEN TIDAK ADA
      // ==================================================

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

      console.log(
        "Token berhasil disimpan."
      );

      // ==================================================
      // AMBIL USER DARI RESPONSE
      // ==================================================

      let user =
        data?.user ||
        data?.data?.user ||
        null;

      console.log(
        "USER DARI BACKEND:",
        user
      );

      // ==================================================
      // JIKA USER TIDAK ADA
      // AMBIL DARI JWT
      // ==================================================

      if (!user) {
        console.log(
          "Data user tidak ada di response."
        );

        console.log(
          "Mengambil data user dari JWT..."
        );

        user =
          getUserFromToken(
            token
          );

        console.log(
          "USER DARI JWT:",
          user
        );
      }

      // ==================================================
      // CEK USER
      // ==================================================

      if (!user) {
        throw new Error(
          "Data user tidak dapat dibaca."
        );
      }

      // ==================================================
      // PASTIKAN USER PUNYA NAME
      // ==================================================

      console.log(
        "========================================"
      );

      console.log(
        "MEMASTIKAN USER PUNYA NAME"
      );

      console.log(
        "User sebelum diproses:",
        user
      );

      // ==================================================
      // JIKA NAME KOSONG
      // ==================================================

      if (
        !user.name ||
        user.name === "Pengguna" ||
        user.name === ""
      ) {
        console.log(
          "User tidak punya name."
        );

        // ==================================================
        // 1. AMBIL DARI LOCAL STORAGE
        // ==================================================

        const savedName =
          localStorage.getItem(
            "registerName"
          ) ||
          localStorage.getItem(
            "userName"
          );

        console.log(
          "Nama dari localStorage:",
          savedName
        );

        if (savedName) {
          user.name =
            savedName;

          console.log(
            "Nama diambil dari localStorage:",
            user.name
          );
        }

        // ==================================================
        // 2. AMBIL DARI EMAIL
        // ==================================================

        else {
          const emailName =
            email.split("@")[0];

          console.log(
            "Nama dari email:",
            emailName
          );

          if (emailName) {
            user.name =
              emailName
                .charAt(0)
                .toUpperCase() +
              emailName.slice(1);

            console.log(
              "Nama dari email:",
              user.name
            );
          }

          // ==================================================
          // 3. DEFAULT
          // ==================================================

          else {
            user.name =
              "Pengguna";

            console.log(
              "Menggunakan nama default:",
              user.name
            );
          }
        }
      } else {
        console.log(
          "User sudah punya name:",
          user.name
        );
      }

      // ==================================================
      // SIMPAN USER
      // ==================================================

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      localStorage.setItem(
        "userName",
        user.name
      );

      console.log(
        "USER FINAL DISIMPAN:",
        user
      );

      console.log(
        "Nama user:",
        user.name
      );

      // ==================================================
      // ROLE
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
      // REDIRECT ADMIN
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

      // ==================================================
      // REDIRECT AGENT
      // ==================================================

      if (role === "agent") {
        console.log(
          "Redirect ke dashboard admin/agent"
        );

        router.replace(
          "/dashboard-admin"
        );

        return;
      }

      // ==================================================
      // REDIRECT USER
      // ==================================================

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
          user?.role ||
          "tidak ada"
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

          <div className="relative z-10 text-xs text-slate-500">

            © 2026 Ticketing System

          </div>

        </div>

        {/* ==================================================
            RIGHT FORM
        ================================================== */}

        <div className="p-8 sm:p-10 lg:p-14">

          {/* ==================================================
              MOBILE LOGO
          ================================================== */}

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

          {/* ==================================================
              HEADER
          ================================================== */}

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

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

              <p className="text-sm text-red-600">
                {error}
              </p>

            </div>
          )}

          {/* ==================================================
              SUCCESS
          ================================================== */}

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

            {/* ==================================================
                NAME
            ================================================== */}

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

            {/* ==================================================
                EMAIL
            ================================================== */}

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

            {/* ==================================================
                PASSWORD
            ================================================== */}

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
                      (prev) =>
                        !prev
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Tampilkan password"
                >

                  <Eye
                    size={19}
                  />

                </button>

              </div>

            </div>

            {/* ==================================================
                CONFIRM PASSWORD
            ================================================== */}

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

            {/* ==================================================
                BUTTON
            ================================================== */}

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

          {/* ==================================================
              SWITCH
          ================================================== */}

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">

            <p className="text-sm text-slate-500">

              {isRegister
                ? "Sudah punya akun?"
                : "Belum punya akun?"}

              {isRegister ? (

                <button
                  type="button"
                  onClick={
                    switchMode
                  }
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