export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Bagian Kiri */}
      <div className="hidden md:flex w-1/2 bg-blue-700 items-center justify-center">
        <div className="text-center text-white px-10">
          <h1 className="text-5xl font-bold mb-4">
            Ticketing System
          </h1>

          <p className="text-lg">
            Sistem Helpdesk untuk Pengelolaan Tiket dan Laporan Masalah
          </p>
        </div>
      </div>

      {/* Bagian Kanan */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-xl rounded-xl p-8 w-[400px]">

          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Login
          </h2>

          <p className="text-center text-gray-500 mb-8">
            Silakan login untuk melanjutkan
          </p>

          <form className="space-y-5">

            <div>
              <label className="block mb-2 font-medium">
                Email
              </label>

              <input
                type="email"
                placeholder="Masukkan Email"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Password
              </label>

              <input
                type="password"
                placeholder="Masukkan Password"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
            >
              Login
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}