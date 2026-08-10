"use client";

import {
  Bell,
  ChevronDown,
  Search,
} from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-[88px] bg-white border-b border-slate-200 px-6 lg:px-8 flex items-center justify-between">

      {/* Left */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Ticketing System
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Kelola tiket dengan mudah dan cepat.
        </p>
      </div>


      {/* Right */}
      <div className="flex items-center gap-4">

        {/* Search */}
        <div className="relative hidden lg:block">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Cari tiket..."
            className="w-64 xl:w-72 h-11 rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition"
          />

        </div>


        {/* Notification */}
        <button
          type="button"
          className="relative w-11 h-11 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-100 flex items-center justify-center transition"
        >

          <Bell
            size={20}
            className="text-slate-600"
          />

          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />

        </button>


        {/* Profile */}
        <div className="flex items-center gap-3 pl-2">

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            BS
          </div>


          {/* User Information */}
          <div className="hidden sm:block">

            <p className="text-sm font-semibold text-slate-800">
              Budi Santoso
            </p>

            <p className="text-xs text-slate-500">
              Pelapor
            </p>

          </div>


          {/* Dropdown */}
          <button
            type="button"
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition"
          >
            <ChevronDown
              size={17}
              className="text-slate-500"
            />
          </button>

        </div>

      </div>

    </header>
  );
}