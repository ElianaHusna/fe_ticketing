"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Settings,
  Lock,
  Mail,
  Upload,
  Save,
  ShieldCheck,
  Bell,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
} from "lucide-react";

export default function AdminSettingsPage() {
  const router = useRouter();

  // =====================================================
  // STATE
  // =====================================================

  const [email, setEmail] = useState("admin@gmail.com");
  const [maxUpload, setMaxUpload] = useState("5");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // EFFECTS - LOAD DATA
  // =====================================================

  useEffect(() => {
    // Load data email dari localStorage
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user?.email) setEmail(user.email);
      }
    } catch {}

    // Load notifikasi
    try {
      const savedNotifications = localStorage.getItem("adminNotifications");
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        setEmailNotifications(parsed.email ?? true);
        setPushNotifications(parsed.push ?? true);
      }
    } catch {}

    // Load maksimal ukuran upload foto
    try {
      const savedMaxUpload = localStorage.getItem("maxUploadSize");
      if (savedMaxUpload) {
        setMaxUpload(savedMaxUpload);
      }
    } catch {}
  }, []);

  // =====================================================
  // HANDLE SAVE
  // =====================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Simulasi API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Simpan email ke localStorage
      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...existingUser, email }));

      // Simpan preferensi notifikasi
      localStorage.setItem(
        "adminNotifications",
        JSON.stringify({
          email: emailNotifications,
          push: pushNotifications,
        })
      );

      // Simpan batas maksimal upload foto (dibaca oleh form Submit Ticket)
      localStorage.setItem("maxUploadSize", maxUpload);

      setSuccess("Pengaturan berhasil disimpan!");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // HANDLE LOGOUT
  // =====================================================

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin logout?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-white">
      <AdminSidebar />

      <main className="ml-64 min-h-screen bg-white">
        {/* HEADER */}
        <header className="border-b border-slate-100 bg-white px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Settings size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Pengaturan
              </h1>
              <p className="text-sm text-slate-500">
                Kelola konfigurasi sistem dan preferensi akun
              </p>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* NOTIFICATIONS ALERT */}
            {success && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-emerald-800">
                <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-800">
                <AlertCircle size={20} className="shrink-0 text-red-600" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* EMAIL AKUN */}
            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Email Akun</h2>
                    <p className="text-xs text-slate-500">Alamat email utama admin</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="max-w-md">
                  <label className="block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <div className="relative mt-2">
                    <Mail
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      placeholder="admin@email.com"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* NOTIFIKASI */}
            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Notifikasi</h2>
                    <p className="text-xs text-slate-500">Atur notifikasi yang ingin Anda terima</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Email Notifications</p>
                    <p className="text-xs text-slate-500">Terima notifikasi pembaruan melalui email</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      emailNotifications ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        emailNotifications ? "translate-x-5" : "translate-x-0.5"
                      } my-0.5`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Push Notifications</p>
                    <p className="text-xs text-slate-500">Notifikasi langsung pada peramban web</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPushNotifications(!pushNotifications)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      pushNotifications ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        pushNotifications ? "translate-x-5" : "translate-x-0.5"
                      } my-0.5`}
                    />
                  </button>
                </div>
              </div>
            </section>

        
            {/* KEAMANAN */}
            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Keamanan</h2>
                    <p className="text-xs text-slate-500">Sesi dan otentikasi akun</p>
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => alert("Fitur ganti password akan segera hadir!")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                >
                  <Lock size={16} />
                  Ganti Password
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 active:bg-red-100"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </section>

            {/* SAVE BUTTON */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Simpan Pengaturan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}