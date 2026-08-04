export default function Navbar() {
  return (
    <header className="bg-white shadow h-16 flex items-center justify-between px-8">

      <h1 className="text-2xl font-bold text-gray-700">
        Dashboard
      </h1>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center">
          A
        </div>

        <span className="font-semibold">
          Admin
        </span>
      </div>

    </header>
  );
}