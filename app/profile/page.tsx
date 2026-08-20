"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Shield,
  ArrowLeft,
  Save,
  Edit2,
  UserCircle,
  Calendar,
  CheckCircle,
  AlertCircle,
  Camera,
  Users,
  Search,
  Eye,
  X,
  Trash2,
  Maximize2,
  Sparkles
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

type UserData = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Modal Lightbox Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load users from localStorage
  const loadUsers = () => {
    try {
      const storedUsers = localStorage.getItem("users");
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        const defaultUsers = [
          { id: 1, name: "Admin User", email: "admin@example.com", role: "admin", avatar: "" },
          { id: 2, name: "Agent User", email: "agent@example.com", role: "agent", avatar: "" },
          { id: 3, name: "Pelapor User", email: "pelapor@example.com", role: "pelapor", avatar: "" },
        ];
        localStorage.setItem("users", JSON.stringify(defaultUsers));
        setUsers(defaultUsers);
      }
    } catch (err) {
      console.error("Gagal load users:", err);
    }
  };

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        router.replace("/login");
        return;
      }

      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setName(parsedUser.name || "");
      setEmail(parsedUser.email || "");
      setAvatar(parsedUser.avatar || "");

      if (parsedUser.role?.toLowerCase() === "admin") {
        loadUsers();
      }
    } catch (err) {
      console.error("Gagal membaca profil:", err);
      router.replace("/login");
    }
  }, [router]);

  const getInitials = (targetName?: string) => {
    const cleanName = targetName?.trim() || "Pengguna";
    return (
      cleanName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase() || "U"
    );
  };

  const getRoleLabel = (role?: string) => {
    const roleLower = role?.toLowerCase();
    if (roleLower === "admin") return "Administrator";
    if (roleLower === "agent") return "Agent";
    return "Pelapor";
  };

  const getRoleBadgeColor = (role?: string) => {
    const roleLower = role?.toLowerCase();
    if (roleLower === "admin") return "bg-purple-100 text-purple-700 border-purple-200";
    if (roleLower === "agent") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatar(base64);
      setSuccess("Foto profil berhasil diunggah!");

      if (user) {
        const updatedUser = { ...user, avatar: base64 };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        window.dispatchEvent(new Event("userUpdated"));

        if (user.role?.toLowerCase() === "admin") {
          updateUserInList(updatedUser);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar("");
    setSuccess("Foto profil berhasil dihapus!");
    if (user) {
      const updatedUser = { ...user, avatar: "" };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event("userUpdated"));

      if (user.role?.toLowerCase() === "admin") {
        updateUserInList(updatedUser);
      }
    }
  };

  const updateUserInList = (updatedUser: UserData) => {
    try {
      const storedUsers = localStorage.getItem("users");
      if (storedUsers) {
        const usersList = JSON.parse(storedUsers);
        const index = usersList.findIndex((u: UserData) => u.id === updatedUser.id);
        if (index !== -1) {
          usersList[index] = updatedUser;
          localStorage.setItem("users", JSON.stringify(usersList));
          setUsers(usersList);
        }
      }
    } catch (err) {
      console.error("Gagal update user list:", err);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Nama wajib diisi.");
      return;
    }

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      const updatedUser = {
        ...user,
        name: name.trim(),
        email: email.trim(),
        avatar: avatar,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      if (user?.role?.toLowerCase() === "admin") {
        updateUserInList(updatedUser);
      }

      window.dispatchEvent(new Event("userUpdated"));

      setSuccess("Profil berhasil diperbarui!");
      setIsEditing(false);
    } catch (err) {
      console.error("Gagal menyimpan profil:", err);
      setError("Gagal menyimpan perubahan profil.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setAvatar(user?.avatar || "");
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const handleViewUser = (selected: UserData) => {
    setSelectedUser(selected);
    setName(selected.name || "");
    setEmail(selected.email || "");
    setAvatar(selected.avatar || "");
    setShowUserList(false);
  };

  const handleCloseViewUser = () => {
    setSelectedUser(null);
    setName(user?.name || "");
    setEmail(user?.email || "");
    setAvatar(user?.avatar || "");
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const activeAvatar = selectedUser ? selectedUser.avatar : avatar;
  const activeName = selectedUser ? selectedUser.name : name || "Pengguna";

  if (!user) {
    return (
      <div className="flex min-h-screen bg-white items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl border border-slate-200">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium text-sm">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white text-slate-800">
      <Sidebar />

      <main className="ml-64 flex-1 min-w-0">
        <Navbar />

        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
          {/* Top Bar Actions */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 bg-white px-3.5 py-2 rounded-lg border border-slate-200 transition hover:border-blue-200"
            >
              <ArrowLeft size={16} />
              Kembali
            </button>

            <div className="flex items-center gap-3">
              {isAdmin && !selectedUser && (
                <button
                  onClick={() => setShowUserList(!showUserList)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition"
                >
                  <Users size={16} className="text-blue-600" />
                  {showUserList ? "Sembunyikan User" : "Kelola User"}
                </button>
              )}
              {!isEditing && !selectedUser && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                >
                  <Edit2 size={16} />
                  Edit Profil
                </button>
              )}
              {selectedUser && (
                <button
                  onClick={handleCloseViewUser}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition"
                >
                  <Eye size={16} className="text-blue-600" />
                  Kembali ke Profil Saya
                </button>
              )}
            </div>
          </div>

          {/* User List Panel for Admin */}
          {isAdmin && showUserList && !selectedUser && (
            <div className="border border-slate-200 rounded-2xl p-5 bg-white">
              <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-blue-600" />
                  <h3 className="font-semibold text-slate-800 text-base">Daftar Pengguna Sistem</h3>
                </div>
                <div className="w-full max-w-xs relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                {filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleViewUser(u)}
                    className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(u.name)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-blue-600 transition">
                        {u.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{u.email}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 border text-[11px] font-medium rounded-md ${getRoleBadgeColor(
                        u.role
                      )}`}
                    >
                      {getRoleLabel(u.role)}
                    </span>
                  </button>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="col-span-full text-center py-6 text-slate-400 text-sm">
                    Tidak ada pengguna ditemukan
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Feedback Alerts */}
          {success && (
            <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 rounded-xl flex items-center justify-between text-emerald-800">
              <div className="flex items-center gap-2.5">
                <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
                <span className="text-sm font-medium">{success}</span>
              </div>
              <button onClick={() => setSuccess("")} className="text-emerald-600 hover:text-emerald-800">
                <X size={16} />
              </button>
            </div>
          )}

          {error && (
            <div className="border border-rose-200 bg-rose-50 px-4 py-3 rounded-xl flex items-center justify-between text-rose-800">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
              <button onClick={() => setError("")} className="text-rose-600 hover:text-rose-800">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Column: Avatar & Quick Info Card */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
                
                {/* Avatar Wrapper (Plain White Style) */}
                <div className="mb-4 inline-block relative group">
                  <div
                    onClick={() => activeAvatar && setIsPreviewOpen(true)}
                    className={`w-28 h-28 rounded-full bg-slate-50 border-2 border-slate-200 mx-auto relative overflow-hidden ${
                      activeAvatar ? "cursor-pointer" : ""
                    }`}
                  >
                    <div className="w-full h-full rounded-full flex items-center justify-center text-slate-700 text-2xl font-bold overflow-hidden">
                      {activeAvatar ? (
                        <img
                          src={activeAvatar}
                          alt="Avatar"
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-blue-600 font-extrabold text-2xl">
                          {getInitials(activeName)}
                        </span>
                      )}
                    </div>

                    {/* Hover Overlay for Preview */}
                    {activeAvatar && (
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white gap-1 text-xs font-medium">
                        <Maximize2 size={16} />
                      </div>
                    )}
                  </div>

                  {/* Camera Badge Upload */}
                  {!selectedUser && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-1 right-1 p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white shadow-sm transition border-2 border-white"
                      title="Ubah foto profil"
                    >
                      <Camera size={14} />
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                {/* Profile Info Summary */}
                <h2 className="text-xl font-bold text-slate-900">{activeName}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{selectedUser ? selectedUser.email : email}</p>

                <div className="mt-3 flex items-center justify-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${getRoleBadgeColor(
                      selectedUser?.role || user?.role
                    )}`}
                  >
                    <Shield size={12} />
                    {getRoleLabel(selectedUser?.role || user?.role)}
                  </span>
                </div>

                {/* Avatar Actions for User */}
                {!selectedUser && activeAvatar && (
                  <div className="mt-4 flex items-center justify-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setIsPreviewOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
                    >
                      <Eye size={13} />
                      Preview
                    </button>
                    <button
                      onClick={handleRemoveAvatar}
                      className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition"
                    >
                      <Trash2 size={13} />
                      Hapus Foto
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Activity Stats */}
              {!selectedUser && (
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                    <Calendar size={16} />
                  </div>
                  <p className="text-xl font-bold text-slate-900">1</p>
                  <p className="text-xs font-medium text-slate-500">Total Laporan</p>
                </div>
              )}
            </div>

            {/* Right Column: Edit Form & Details Card */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <UserCircle size={20} className="text-blue-600" />
                      {selectedUser ? `Profil ${selectedUser.name}` : "Informasi Akun"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedUser
                        ? "Melihat detail akun pengguna"
                        : isEditing
                        ? "Perbarui detail informasi profil Anda"
                        : "Informasi utama identitas pengguna"}
                    </p>
                  </div>
                  {isEditing && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                      <Sparkles size={12} /> Mode Edit
                    </span>
                  )}
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                  {/* Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User
                        size={17}
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                          isEditing && !selectedUser ? "text-blue-600" : "text-slate-400"
                        }`}
                      />
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Masukkan nama lengkap"
                        disabled={loading || !isEditing || !!selectedUser}
                        className={`w-full h-11 rounded-xl border ${
                          isEditing && !selectedUser
                            ? "border-blue-300 focus:border-blue-500 bg-white ring-2 ring-blue-50"
                            : "border-slate-200 bg-slate-50/70 text-slate-600"
                        } pl-10 pr-4 text-sm font-medium outline-none transition disabled:cursor-not-allowed`}
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={17}
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                          isEditing && !selectedUser ? "text-blue-600" : "text-slate-400"
                        }`}
                      />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Masukkan alamat email"
                        disabled={loading || !isEditing || !!selectedUser}
                        className={`w-full h-11 rounded-xl border ${
                          isEditing && !selectedUser
                            ? "border-blue-300 focus:border-blue-500 bg-white ring-2 ring-blue-50"
                            : "border-slate-200 bg-slate-50/70 text-slate-600"
                        } pl-10 pr-4 text-sm font-medium outline-none transition disabled:cursor-not-allowed`}
                      />
                    </div>
                  </div>

                  {/* Role Read-Only */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Role / Hak Akses
                    </label>
                    <div className="relative">
                      <Shield size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <div className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 flex items-center text-sm font-medium text-slate-600">
                        {getRoleLabel(selectedUser?.role || user?.role)}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Hak akses ditentukan oleh administrator sistem dan tidak dapat diubah sendiri.
                    </p>
                  </div>

                  {/* Actions Bar */}
                  {isEditing && !selectedUser && (
                    <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="h-10 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition disabled:opacity-50"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Simpan Perubahan
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>

                {/* Security Note Box */}
                <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Shield size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Keamanan & Privasi Akun</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {selectedUser
                          ? `Anda sedang melihat profil ${selectedUser.name} dalam mode Administrator.`
                          : "Data profil Anda terlindungi dengan enkripsi lokal. Lakukan update berkala untuk menjaga keakuratan data pendaftaran."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Lightbox / Preview Avatar Modal */}
      {isPreviewOpen && activeAvatar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 text-white">
              <h3 className="text-sm font-semibold truncate">Foto Profil - {activeName}</h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Image */}
            <div className="p-6 flex items-center justify-center bg-black/50 min-h-[300px]">
              <img
                src={activeAvatar}
                alt="Preview Avatar"
                className="max-h-[60vh] w-auto object-contain rounded-lg"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}