"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Tags,
  RefreshCw,
  X,
  Check,
  AlertCircle,
  Power,
  FolderOpen,
} from "lucide-react";

import AdminSidebar from "@/components/AdminSidebar";
import { apiFetch } from "@/src/lib/api";

// =====================================================
// TYPE
// =====================================================

type CategoryStatus = "active" | "inactive";

interface Category {
  id: string | number;
  name: string;
  description?: string;
  status?: CategoryStatus;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

interface CategoryForm {
  name: string;
  description: string;
  status: CategoryStatus;
}

// =====================================================
// KATEGORI LAMA
// =====================================================
//
// Ini fallback sementara jika endpoint:
// GET /api/v1/categories
// belum tersedia.
//
// Setelah backend categories tersedia,
// data dari API akan digunakan.
// =====================================================

const LEGACY_CATEGORIES: Category[] = [
  {
    id: "technical",
    name: "Teknis",
    description:
      "Masalah teknis pada sistem, aplikasi, jaringan, atau fitur.",
    status: "active",
  },
  {
    id: "billing",
    name: "Billing",
    description:
      "Pertanyaan atau masalah yang berkaitan dengan pembayaran dan tagihan.",
    status: "active",
  },
  {
    id: "account",
    name: "Akun",
    description:
      "Masalah akun, login, profil, akses, atau informasi pengguna.",
    status: "active",
  },
  {
    id: "feature_request",
    name: "Permintaan Fitur",
    description:
      "Permintaan penambahan atau pengembangan fitur baru.",
    status: "active",
  },
  {
    id: "other",
    name: "Lainnya",
    description:
      "Laporan yang tidak termasuk ke dalam kategori lainnya.",
    status: "active",
  },
];

// =====================================================
// PAGE
// =====================================================

export default function CategoriesPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<Category | null>(null);

  const [form, setForm] =
    useState<CategoryForm>({
      name: "",
      description: "",
      status: "active",
    });

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await apiFetch("/categories");

      console.log(
        "CATEGORIES RESPONSE:",
        response
      );

      const data =
        Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.categories)
          ? response.categories
          : [];

      if (data.length > 0) {
        setCategories(data);
      } else {
        setCategories(
          LEGACY_CATEGORIES
        );
      }
    } catch (err) {
      console.error(
        "Gagal mengambil kategori:",
        err
      );

      /*
       * Jangan biarkan halaman kategori
       * menjadi error hanya karena endpoint
       * backend belum tersedia.
       *
       * Gunakan kategori lama sebagai fallback.
       */

      setCategories(
        LEGACY_CATEGORIES
      );

      setError(
        "Data kategori server belum tersedia. Menampilkan kategori lama."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchCategories();
  }, []);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredCategories =
    useMemo(() => {
      const keyword =
        search
          .toLowerCase()
          .trim();

      if (!keyword) {
        return categories;
      }

      return categories.filter(
        (category) =>
          category.name
            ?.toLowerCase()
            .includes(keyword) ||
          category.description
            ?.toLowerCase()
            .includes(keyword)
      );
    }, [
      categories,
      search,
    ]);

  // =====================================================
  // ADD
  // =====================================================

  const handleAdd = () => {
    setEditingCategory(null);

    setForm({
      name: "",
      description: "",
      status: "active",
    });

    setShowModal(true);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (
    category: Category
  ) => {
    setEditingCategory(category);

    setForm({
      name:
        category.name || "",
      description:
        category.description || "",
      status:
        category.status ===
        "inactive"
          ? "inactive"
          : "active",
    });

    setShowModal(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingCategory(null);

    setForm({
      name: "",
      description: "",
      status: "active",
    });
  };

  // =====================================================
  // FORM
  // =====================================================

  const handleFormChange = (
    field: keyof CategoryForm,
    value: string
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const name =
      form.name.trim();

    const description =
      form.description.trim();

    if (!name) {
      alert(
        "Nama kategori wajib diisi."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name,
        description,
        status: form.status,
      };

      // =================================================
      // EDIT
      // =================================================

      if (editingCategory) {
        await apiFetch(
          `/categories/${editingCategory.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(
              payload
            ),
          }
        );
      }

      // =================================================
      // ADD
      // =================================================

      else {
        await apiFetch(
          "/categories",
          {
            method: "POST",
            body: JSON.stringify(
              payload
            ),
          }
        );
      }

      handleCloseModal();

      await fetchCategories();
    } catch (err) {
      console.error(
        "Gagal menyimpan kategori:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan kategori."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setSaving(true);

      await apiFetch(
        `/categories/${deleteTarget.id}`,
        {
          method: "DELETE",
        }
      );

      setDeleteTarget(null);

      await fetchCategories();
    } catch (err) {
      console.error(
        "Gagal menghapus kategori:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Gagal menghapus kategori."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // TOGGLE STATUS
  // =====================================================

  const handleToggleStatus = async (
    category: Category
  ) => {
    const nextStatus =
      category.status ===
      "inactive"
        ? "active"
        : "inactive";

    try {
      setSaving(true);

      await apiFetch(
        `/categories/${category.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            name: category.name,
            description:
              category.description || "",
            status: nextStatus,
          }),
        }
      );

      await fetchCategories();
    } catch (err) {
      console.error(
        "Gagal mengubah status kategori:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Gagal mengubah status kategori."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (
    status?: string
  ) => {
    if (
      status === "inactive"
    ) {
      return {
        container:
          "bg-slate-100 text-slate-600 border-slate-200",
        dot:
          "bg-slate-400",
        label:
          "Nonaktif",
      };
    }

    return {
      container:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot:
        "bg-emerald-500",
      label:
        "Aktif",
    };
  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (
    date?: string
  ) => {
    if (!date) {
      return "-";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "-";
    }

    return parsed.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // STATS
  // =====================================================

  const totalCategories =
    categories.length;

  const activeCategories =
    categories.filter(
      (item) =>
        item.status !==
        "inactive"
    ).length;

  const inactiveCategories =
    categories.filter(
      (item) =>
        item.status ===
        "inactive"
    ).length;

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f5f7fb]">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <AdminSidebar />

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="ml-64 min-h-screen">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="border-b border-slate-200 bg-white">

          <div className="px-8 py-6">

            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

                    <Tags
                      size={21}
                      className="text-blue-600"
                    />

                  </div>

                  <div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      Kategori Tiket
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                      Kelola kategori yang
                      digunakan untuk tiket
                      helpdesk.
                    </p>

                  </div>

                </div>

              </div>

              <div className="flex items-center gap-3">

                <button
                  type="button"
                  onClick={
                    fetchCategories
                  }
                  disabled={loading}
                  className="
                    flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    text-sm
                    font-semibold
                    text-slate-600
                    shadow-sm
                    transition
                    hover:bg-slate-50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  <RefreshCw
                    size={16}
                    className={
                      loading
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh

                </button>

                <button
                  type="button"
                  onClick={
                    handleAdd
                  }
                  className="
                    flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    px-4
                    text-sm
                    font-bold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-blue-700
                  "
                >

                  <Plus
                    size={17}
                  />

                  Tambah Kategori

                </button>

              </div>

            </div>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="p-8">

          {/* =================================================
              WARNING / ERROR
          ================================================= */}

          {error && (

            <div className="
              mb-6
              flex
              items-start
              gap-3
              rounded-xl
              border
              border-amber-200
              bg-amber-50
              px-5
              py-4
            ">

              <AlertCircle
                size={19}
                className="
                  mt-0.5
                  shrink-0
                  text-amber-600
                "
              />

              <div className="flex-1">

                <p className="
                  text-sm
                  font-bold
                  text-amber-800
                ">
                  Menggunakan kategori lama
                </p>

                <p className="
                  mt-1
                  text-xs
                  leading-5
                  text-amber-700
                ">
                  {error}
                </p>

              </div>

              <button
                type="button"
                onClick={
                  fetchCategories
                }
                className="
                  text-xs
                  font-bold
                  text-amber-700
                  hover:text-amber-900
                "
              >
                Coba Lagi
              </button>

            </div>

          )}

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="
            mb-6
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-3
          ">

            {/* TOTAL */}

            <div className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-[0_2px_10px_rgba(15,23,42,0.04)]
            ">

              <div className="
                flex
                items-center
                justify-between
              ">

                <div>

                  <p className="
                    text-sm
                    text-slate-500
                  ">
                    Total Kategori
                  </p>

                  <p className="
                    mt-2
                    text-3xl
                    font-bold
                    text-slate-900
                  ">
                    {loading
                      ? "..."
                      : totalCategories}
                  </p>

                </div>

                <div className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                ">

                  <FolderOpen
                    size={21}
                    className="text-blue-600"
                  />

                </div>

              </div>

            </div>

            {/* ACTIVE */}

            <div className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-[0_2px_10px_rgba(15,23,42,0.04)]
            ">

              <div className="
                flex
                items-center
                justify-between
              ">

                <div>

                  <p className="
                    text-sm
                    text-slate-500
                  ">
                    Kategori Aktif
                  </p>

                  <p className="
                    mt-2
                    text-3xl
                    font-bold
                    text-slate-900
                  ">
                    {loading
                      ? "..."
                      : activeCategories}
                  </p>

                </div>

                <div className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-50
                ">

                  <Check
                    size={21}
                    className="text-emerald-600"
                  />

                </div>

              </div>

            </div>

            {/* INACTIVE */}

            <div className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-[0_2px_10px_rgba(15,23,42,0.04)]
            ">

              <div className="
                flex
                items-center
                justify-between
              ">

                <div>

                  <p className="
                    text-sm
                    text-slate-500
                  ">
                    Nonaktif
                  </p>

                  <p className="
                    mt-2
                    text-3xl
                    font-bold
                    text-slate-900
                  ">
                    {loading
                      ? "..."
                      : inactiveCategories}
                  </p>

                </div>

                <div className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-100
                ">

                  <Power
                    size={21}
                    className="text-slate-500"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <section className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-[0_2px_10px_rgba(15,23,42,0.04)]
          ">

            {/* TABLE HEADER */}

            <div className="
              border-b
              border-slate-200
              px-6
              py-5
            ">

              <div className="
                flex
                flex-col
                gap-4
                lg:flex-row
                lg:items-center
                lg:justify-between
              ">

                <div>

                  <h2 className="
                    font-bold
                    text-slate-900
                  ">
                    Daftar Kategori
                  </h2>

                  <p className="
                    mt-1
                    text-xs
                    text-slate-400
                  ">
                    Kelola kategori tiket
                    helpdesk.
                  </p>

                </div>

                {/* SEARCH */}

                <div className="
                  relative
                  w-full
                  lg:w-[320px]
                ">

                  <Search
                    size={17}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Cari kategori..."
                    className="
                      h-10
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      pl-10
                      pr-4
                      text-sm
                      text-slate-700
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-blue-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-50
                    "
                  />

                </div>

              </div>

            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="
                    border-b
                    border-slate-200
                    bg-slate-50
                  ">

                    <th className="
                      px-6
                      py-3.5
                      text-left
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-500
                    ">
                      Kategori
                    </th>

                    <th className="
                      px-6
                      py-3.5
                      text-left
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-500
                    ">
                      Deskripsi
                    </th>

                    <th className="
                      px-6
                      py-3.5
                      text-left
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-500
                    ">
                      Status
                    </th>

                    <th className="
                      px-6
                      py-3.5
                      text-left
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-500
                    ">
                      Dibuat
                    </th>

                    <th className="
                      px-6
                      py-3.5
                      text-right
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-500
                    ">
                      Aksi
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {/* LOADING */}

                  {loading ? (

                    <tr>

                      <td
                        colSpan={5}
                        className="
                          px-6
                          py-16
                          text-center
                        "
                      >

                        <RefreshCw
                          size={26}
                          className="
                            mx-auto
                            animate-spin
                            text-blue-600
                          "
                        />

                        <p className="
                          mt-3
                          text-sm
                          font-semibold
                          text-slate-500
                        ">
                          Memuat kategori...
                        </p>

                      </td>

                    </tr>

                  ) : filteredCategories.length ===
                    0 ? (

                    /* EMPTY */

                    <tr>

                      <td
                        colSpan={5}
                        className="
                          px-6
                          py-16
                          text-center
                        "
                      >

                        <div className="
                          mx-auto
                          flex
                          h-14
                          w-14
                          items-center
                          justify-center
                          rounded-full
                          bg-slate-100
                        ">

                          <Tags
                            size={25}
                            className="text-slate-400"
                          />

                        </div>

                        <p className="
                          mt-4
                          text-sm
                          font-bold
                          text-slate-700
                        ">
                          {search
                            ? "Kategori tidak ditemukan"
                            : "Belum ada kategori"}
                        </p>

                        <p className="
                          mt-1
                          text-xs
                          text-slate-400
                        ">
                          {search
                            ? "Coba gunakan kata kunci lain."
                            : "Tambahkan kategori untuk mulai mengelola tiket."}
                        </p>

                      </td>

                    </tr>

                  ) : (

                    filteredCategories.map(
                      (category) => {

                        const status =
                          getStatusStyle(
                            category.status
                          );

                        return (

                          <tr
                            key={
                              category.id
                            }
                            className="
                              border-b
                              border-slate-100
                              transition
                              last:border-0
                              hover:bg-slate-50
                            "
                          >

                            {/* NAME */}

                            <td className="
                              px-6
                              py-4
                            ">

                              <div className="
                                flex
                                items-center
                                gap-3
                              ">

                                <div className="
                                  flex
                                  h-10
                                  w-10
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-xl
                                  bg-blue-50
                                ">

                                  <Tags
                                    size={18}
                                    className="text-blue-600"
                                  />

                                </div>

                                <div>

                                  <p className="
                                    text-sm
                                    font-bold
                                    text-slate-800
                                  ">
                                    {
                                      category.name
                                    }
                                  </p>

                                  <p className="
                                    mt-0.5
                                    text-[11px]
                                    text-slate-400
                                  ">
                                    ID:{" "}
                                    {
                                      category.id
                                    }
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* DESCRIPTION */}

                            <td className="
                              max-w-[380px]
                              px-6
                              py-4
                            ">

                              <p className="
                                truncate
                                text-sm
                                text-slate-500
                              ">
                                {
                                  category.description ||
                                  "Tidak ada deskripsi"
                                }
                              </p>

                            </td>

                            {/* STATUS */}

                            <td className="
                              px-6
                              py-4
                            ">

                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-full
                                  border
                                  px-2.5
                                  py-1
                                  text-xs
                                  font-bold
                                  ${status.container}
                                `}
                              >

                                <span
                                  className={`
                                    h-1.5
                                    w-1.5
                                    rounded-full
                                    ${status.dot}
                                  `}
                                />

                                {
                                  status.label
                                }

                              </span>

                            </td>

                            {/* DATE */}

                            <td className="
                              whitespace-nowrap
                              px-6
                              py-4
                              text-sm
                              text-slate-500
                            ">
                              {formatDate(
                                category.createdAt ||
                                category.created_at
                              )}
                            </td>

                            {/* ACTION */}

                            <td className="
                              px-6
                              py-4
                            ">

                              <div className="
                                flex
                                justify-end
                                gap-2
                              ">

                                {/* TOGGLE */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleStatus(
                                      category
                                    )
                                  }
                                  disabled={
                                    saving
                                  }
                                  title={
                                    category.status ===
                                    "inactive"
                                      ? "Aktifkan kategori"
                                      : "Nonaktifkan kategori"
                                  }
                                  className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-white
                                    text-slate-500
                                    transition
                                    hover:border-emerald-200
                                    hover:bg-emerald-50
                                    hover:text-emerald-600
                                    disabled:opacity-50
                                  "
                                >

                                  <Power
                                    size={15}
                                  />

                                </button>

                                {/* EDIT */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEdit(
                                      category
                                    )
                                  }
                                  disabled={
                                    saving
                                  }
                                  title="Edit kategori"
                                  className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-white
                                    text-slate-500
                                    transition
                                    hover:border-blue-200
                                    hover:bg-blue-50
                                    hover:text-blue-600
                                    disabled:opacity-50
                                  "
                                >

                                  <Pencil
                                    size={15}
                                  />

                                </button>

                                {/* DELETE */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteTarget(
                                      category
                                    )
                                  }
                                  disabled={
                                    saving
                                  }
                                  title="Hapus kategori"
                                  className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-white
                                    text-slate-500
                                    transition
                                    hover:border-red-200
                                    hover:bg-red-50
                                    hover:text-red-600
                                    disabled:opacity-50
                                  "
                                >

                                  <Trash2
                                    size={15}
                                  />

                                </button>

                              </div>

                            </td>

                          </tr>

                        );
                      }
                    )

                  )}

                </tbody>

              </table>

            </div>

            {/* FOOTER */}

            {!loading &&
              filteredCategories.length >
                0 && (

              <div className="
                border-t
                border-slate-100
                px-6
                py-4
              ">

                <p className="
                  text-xs
                  text-slate-400
                ">
                  Menampilkan{" "}
                  <span className="
                    font-bold
                    text-slate-600
                  ">
                    {
                      filteredCategories.length
                    }
                  </span>{" "}
                  dari{" "}
                  <span className="
                    font-bold
                    text-slate-600
                  ">
                    {
                      categories.length
                    }
                  </span>{" "}
                  kategori
                </p>

              </div>

            )}

          </section>

        </div>

      </main>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (

        <div className="
          fixed
          inset-0
          z-[100]
          flex
          items-center
          justify-center
          bg-slate-950/40
          p-4
          backdrop-blur-sm
        ">

          <button
            type="button"
            aria-label="Tutup modal"
            onClick={
              handleCloseModal
            }
            className="
              absolute
              inset-0
            "
          />

          <div className="
            relative
            z-10
            w-full
            max-w-lg
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-2xl
          ">

            {/* HEADER */}

            <div className="
              flex
              items-center
              justify-between
              border-b
              border-slate-200
              px-6
              py-5
            ">

              <div>

                <h2 className="
                  text-lg
                  font-bold
                  text-slate-900
                ">
                  {editingCategory
                    ? "Edit Kategori"
                    : "Tambah Kategori"}
                </h2>

                <p className="
                  mt-1
                  text-xs
                  text-slate-400
                ">
                  {editingCategory
                    ? "Perbarui informasi kategori tiket."
                    : "Tambahkan kategori baru untuk tiket."}
                </p>

              </div>

              <button
                type="button"
                onClick={
                  handleCloseModal
                }
                disabled={
                  saving
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-600
                "
              >

                <X
                  size={18}
                />

              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
              className="p-6"
            >

              {/* NAME */}

              <div>

                <label className="
                  text-xs
                  font-bold
                  text-slate-700
                ">
                  Nama Kategori
                </label>

                <input
                  type="text"
                  value={
                    form.name
                  }
                  onChange={(
                    event
                  ) =>
                    handleFormChange(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Contoh: Teknis"
                  disabled={
                    saving
                  }
                  className="
                    mt-2
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    text-sm
                    text-slate-700
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-blue-400
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-50
                  "
                />

              </div>

              {/* DESCRIPTION */}

              <div className="mt-5">

                <label className="
                  text-xs
                  font-bold
                  text-slate-700
                ">
                  Deskripsi
                </label>

                <textarea
                  value={
                    form.description
                  }
                  onChange={(
                    event
                  ) =>
                    handleFormChange(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Jelaskan kategori ini..."
                  rows={4}
                  disabled={
                    saving
                  }
                  className="
                    mt-2
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    py-3
                    text-sm
                    text-slate-700
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-blue-400
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-50
                  "
                />

              </div>

              {/* STATUS */}

              <div className="mt-5">

                <label className="
                  text-xs
                  font-bold
                  text-slate-700
                ">
                  Status
                </label>

                <select
                  value={
                    form.status
                  }
                  onChange={(
                    event
                  ) =>
                    handleFormChange(
                      "status",
                      event.target.value
                    )
                  }
                  disabled={
                    saving
                  }
                  className="
                    mt-2
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    text-sm
                    text-slate-700
                    outline-none
                    focus:border-blue-400
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-50
                  "
                >

                  <option value="active">
                    Aktif
                  </option>

                  <option value="inactive">
                    Nonaktif
                  </option>

                </select>

              </div>

              {/* BUTTON */}

              <div className="
                mt-7
                flex
                justify-end
                gap-3
              ">

                <button
                  type="button"
                  onClick={
                    handleCloseModal
                  }
                  disabled={
                    saving
                  }
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-600
                    transition
                    hover:bg-slate-50
                  "
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    !form.name.trim()
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    px-5
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-blue-700
                    disabled:cursor-not-allowed
                    disabled:bg-slate-300
                  "
                >

                  {saving ? (

                    <>
                      <RefreshCw
                        size={15}
                        className="animate-spin"
                      />

                      Menyimpan...
                    </>

                  ) : (

                    <>
                      <Check
                        size={15}
                      />

                      {editingCategory
                        ? "Simpan Perubahan"
                        : "Tambah Kategori"}
                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteTarget && (

        <div className="
          fixed
          inset-0
          z-[110]
          flex
          items-center
          justify-center
          bg-slate-950/40
          p-4
          backdrop-blur-sm
        ">

          <button
            type="button"
            aria-label="Tutup"
            onClick={() =>
              setDeleteTarget(
                null
              )
            }
            className="
              absolute
              inset-0
            "
          />

          <div className="
            relative
            z-10
            w-full
            max-w-md
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-2xl
          ">

            <div className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-red-50
            ">

              <Trash2
                size={21}
                className="text-red-600"
              />

            </div>

            <h2 className="
              mt-5
              text-lg
              font-bold
              text-slate-900
            ">
              Hapus kategori?
            </h2>

            <p className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            ">
              Kamu yakin ingin
              menghapus kategori{" "}
              <span className="
                font-bold
                text-slate-700
              ">
                "{deleteTarget.name}"
              </span>
              ? Tindakan ini tidak
              dapat dibatalkan.
            </p>

            <div className="
              mt-6
              flex
              justify-end
              gap-3
            ">

              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(
                    null
                  )
                }
                disabled={
                  saving
                }
                className="
                  rounded-xl
                  border
                  border-slate-200
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-600
                  hover:bg-slate-50
                "
              >
                Batal
              </button>

              <button
                type="button"
                onClick={
                  handleDelete
                }
                disabled={
                  saving
                }
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-red-600
                  px-5
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  hover:bg-red-700
                  disabled:opacity-50
                "
              >

                {saving ? (

                  <>
                    <RefreshCw
                      size={15}
                      className="animate-spin"
                    />

                    Menghapus...
                  </>

                ) : (

                  <>
                    <Trash2
                      size={15}
                    />

                    Hapus
                  </>

                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}