"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  Image as ImageIcon,
  Send,
  ArrowLeft,
  Ticket,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/src/lib/api";

export default function SubmitTicketPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    requesterName: "",
    requesterEmail: "",
    subject: "",
    category: "",
    priority: "",
    description: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==============================
  // HANDLE INPUT
  // ==============================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==============================
  // HANDLE FOTO
  // ==============================

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");

    // Cek tipe file
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Format foto tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP."
      );

      e.target.value = "";
      return;
    }

    // Maksimal 10 MB
const maxSize = 10 * 1024 * 1024;

if (file.size > maxSize) {
  setError("Ukuran foto maksimal 10 MB.");
  e.target.value = "";
  return;
}
    setSelectedFile(file);

    // Hapus preview sebelumnya
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);
  };

  // ==============================
  // HAPUS FOTO
  // ==============================

  const removeFile = () => {
    setSelectedFile(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==============================
  // SUBMIT
  // ==============================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ==============================
    // VALIDASI
    // ==============================

    if (
      !form.requesterName.trim() ||
      !form.requesterEmail.trim() ||
      !form.subject.trim() ||
      !form.category ||
      !form.priority ||
      !form.description.trim()
    ) {
      setError("Semua field wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      // ==============================
      // FORM DATA UNTUK FILE UPLOAD
      // ==============================

      const formData = new FormData();

      formData.append(
        "requesterName",
        form.requesterName.trim()
      );

      formData.append(
        "requesterEmail",
        form.requesterEmail.trim()
      );

      formData.append(
        "subject",
        form.subject.trim()
      );

      formData.append(
        "category",
        form.category
      );

      formData.append(
        "priority",
        form.priority
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "source",
        "webform"
      );

      // ==============================
      // ATTACHMENT FOTO
      // nama field HARUS "file"
      // sesuai FileInterceptor('file')
      // ==============================

      if (selectedFile) {
        formData.append(
          "file",
          selectedFile
        );
      }

      const result = await apiFetch(
        "/tickets",
        {
          method: "POST",
          body: formData,
        }
      );

      console.log(
        "CREATE TICKET RESULT:",
        result
      );

      const ticketNumber =
        result?.ticket_number ||
        result?.ticketNumber ||
        result?.data?.ticket_number ||
        result?.data?.ticketNumber ||
        result?.id;

      setSuccess(
        `Tiket berhasil dibuat${
          ticketNumber
            ? ` dengan nomor ${ticketNumber}`
            : ""
        }.`
      );

      setForm({
        requesterName: "",
        requesterEmail: "",
        subject: "",
        category: "",
        priority: "",
        description: "",
      });

      removeFile();

      setTimeout(() => {
        router.push("/tracking");
      }, 1500);

    } catch (err) {

      console.error(
        "Gagal membuat tiket:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal membuat tiket. Silakan coba lagi."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        <Navbar />

        <div className="mx-auto max-w-6xl p-6 lg:p-8">
          {/* ==========================================
              HEADER
          ========================================== */}

          <div className="mb-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-5 flex items-center gap-2 text-sm text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Kembali
            </button>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
                <Ticket
                  size={24}
                  className="text-white"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Helpdesk Support
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  Buat Tiket Baru
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Jelaskan masalah yang kamu alami dengan
                  lengkap agar tim support dapat membantu
                  lebih cepat.
                </p>
              </div>
            </div>
          </div>

          {/* ==========================================
              NOTIFICATION
          ========================================== */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <div>
                <p className="text-sm font-semibold text-red-700">
                  Terjadi kesalahan
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-green-600"
              />

              <div>
                <p className="text-sm font-semibold text-green-700">
                  Tiket berhasil dibuat
                </p>

                <p className="mt-1 text-sm text-green-600">
                  {success}
                </p>
              </div>
            </div>
          )}

          {/* ==========================================
              FORM CARD
          ========================================== */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Card Header */}

            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5 lg:px-8">
              <h2 className="text-base font-bold text-slate-900">
                Informasi Tiket
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Lengkapi informasi berikut.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 lg:p-8"
            >
              <div className="grid gap-6 lg:grid-cols-2">
                {/* ======================================
                    NAMA
                ====================================== */}

                <div>
                  <label
                    htmlFor="requesterName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Nama Lengkap
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="requesterName"
                    name="requesterName"
                    type="text"
                    value={form.requesterName}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
                  />
                </div>

                {/* ======================================
                    EMAIL
                ====================================== */}

                <div>
                  <label
                    htmlFor="requesterEmail"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="requesterEmail"
                    name="requesterEmail"
                    type="email"
                    value={form.requesterEmail}
                    onChange={handleChange}
                    placeholder="nama@perusahaan.com"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
                  />
                </div>

                {/* ======================================
                    JUDUL
                ====================================== */}

                <div className="lg:col-span-2">
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Judul Tiket
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Contoh: Tidak dapat login ke sistem"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
                  />
                </div>

                {/* ======================================
                    KATEGORI
                ====================================== */}

                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Kategori
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
                  >
                    <option value="">
                      Pilih kategori
                    </option>

                    <option value="technical">
                      Teknis
                    </option>

                    <option value="billing">
                      Billing
                    </option>

                    <option value="account">
                      Akun
                    </option>

                    <option value="feature_request">
                      Permintaan Fitur
                    </option>

                    <option value="other">
                      Lainnya
                    </option>
                  </select>
                </div>

                {/* ======================================
                    PRIORITAS
                ====================================== */}

                <div>
                  <label
                    htmlFor="priority"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Prioritas
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    id="priority"
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
                  >
                    <option value="">
                      Pilih prioritas
                    </option>

                    <option value="low">
                      Rendah
                    </option>

                    <option value="medium">
                      Sedang
                    </option>

                    <option value="high">
                      Tinggi
                    </option>

                    <option value="urgent">
                      Urgent
                    </option>
                  </select>
                </div>

                {/* ======================================
                    DESKRIPSI
                ====================================== */}

                <div className="lg:col-span-2">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Deskripsi Masalah
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    rows={7}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Jelaskan masalah yang kamu alami secara detail..."
                    disabled={loading}
                    className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Jelaskan kapan masalah terjadi, pesan
                    error yang muncul, dan langkah yang sudah
                    dicoba.
                  </p>
                </div>

                {/* ======================================
                    UPLOAD FOTO
                ====================================== */}

                <div className="lg:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Bukti Foto / Screenshot
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      Opsional
                    </span>
                  </label>

                  {!selectedFile ? (
                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={loading}
                      className="group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                        <Upload size={25} />
                      </div>

                      <p className="text-sm font-semibold text-slate-700">
                        Klik untuk upload foto
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        JPG, JPEG, PNG atau WEBP
                      </p>

      
                    </button>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <div className="relative">
                        {previewUrl && (
                          <img
                            src={previewUrl}
                            alt="Preview bukti"
                            className="max-h-96 w-full object-contain bg-slate-100"
                          />
                        )}

                        <button
                          type="button"
                          onClick={removeFile}
                          disabled={loading}
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600"
                          aria-label="Hapus foto"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 border-t border-slate-200 bg-white px-4 py-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                          <ImageIcon size={20} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-700">
                            {selectedFile.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          disabled={loading}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Ganti
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Upload screenshot atau foto yang
                    membantu tim support memahami masalah.
                  </p>
                </div>
              </div>

              {/* ======================================
                  DIVIDER
              ====================================== */}

              <div className="my-8 border-t border-slate-100" />

              {/* ======================================
                  BUTTON
              ====================================== */}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  <Send size={17} />

                  {loading
                    ? "Mengirim..."
                    : "Kirim Tiket"}
                </button>
              </div>
            </form>
          </div>

          {/* ==========================================
              INFO
          ========================================== */}

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <p className="text-xs leading-5 text-blue-700">
              Pastikan informasi yang kamu masukkan sudah
              benar. Tim support akan menggunakan informasi
              tersebut untuk membantu menyelesaikan masalah.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}