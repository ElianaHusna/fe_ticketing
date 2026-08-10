import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function SubmitTicketPage() {
  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800">
      <Sidebar />

      <main className="ml-64 flex-1">
        <Navbar />

        <div className="p-8 max-w-5xl">
          {/* Breadcrumb & Title */}
          <div className="mb-6">
            <p className="text-xs text-blue-600 font-medium">
              Dashboard / <span className="text-slate-500">Buat Tiket baru</span>
            </p>

            <p className="text-xs text-slate-500 mt-4">
              Harap isi form berikut dengan lengkap.
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <form className="space-y-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white placeholder:text-slate-400"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Masukkan email"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white placeholder:text-slate-400"
                />
              </div>

              {/* Judul Tiket */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Judul Tiket
                </label>
                <input
                  type="text"
                  placeholder="Masukkan judul tiket"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white placeholder:text-slate-400"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kategori
                </label>
                <select 
                  defaultValue="" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-700"
                >
                  <option value="" disabled hidden>
                    Pilih Kategori
                  </option>
                  <option value="teknis">Teknis</option>
                  <option value="jaringan">Jaringan</option>
                  <option value="akun">Akun</option>
                </select>
              </div>

              {/* Prioritas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Prioritas
                </label>
                <select 
                  defaultValue="" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-700"
                >
                  <option value="" disabled hidden>
                    Pilih Prioritas
                  </option>
                  <option value="tinggi">Tinggi</option>
                  <option value="sedang">Sedang</option>
                  <option value="rendah">Rendah</option>
                </select>
              </div>

              {/* Deskripsi Masalah */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Deskripsi Masalah
                </label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan deskripsi masalah Anda di sini..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white resize-none placeholder:text-slate-400"
                ></textarea>
              </div>

              {/* Lampiran (opsional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Lampiran <span className="font-normal text-slate-400">(opsional)</span>
                </label>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <div className="flex items-center gap-2 px-3 py-2 flex-1 text-xs text-slate-400 bg-slate-50/50">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span>Tidak ada file yang dipilih</span>
                  </div>
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-xs font-medium border-l border-slate-300 transition-colors">
                    Pilih File
                    <input type="file" className="hidden" />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="reset"
                  className="px-6 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Kirim Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}