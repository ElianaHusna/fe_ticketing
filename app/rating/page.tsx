"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/src/lib/api";
import {
  Star,
  Ticket,
  Send,
  MessageSquare,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface TicketData {
  id: string;
  ticketNumber?: string;
  status?: string;
  subject?: string;
  description?: string;
  [key: string]: any;
}

export default function RatingPage() {
  const searchParams = useSearchParams();
  const [ticketNumber, setTicketNumber] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchingTicket, setFetchingTicket] = useState(false);
  const [userTickets, setUserTickets] = useState<TicketData[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // =====================================================
  // AMBIL TIKET USER LOGIN
  // =====================================================

  const fetchUserTickets = async () => {
    try {
      setLoadingTickets(true);
      const response = await apiFetch(
        "/tickets?page=1&limit=100",
        {
          method: "GET",
        }
      );

      const allTickets =
        Array.isArray(response)
          ? response
          : response?.data || [];

      const savedUser =
        localStorage.getItem("user");

      if(!savedUser){
        setUserTickets([]);
        return;
      }

      const user =
        JSON.parse(savedUser);

      const email =
        user.email
        ?.toLowerCase()
        .trim();

      const filtered =
        allTickets.filter(
          (ticket:any)=>{
            const ticketEmail =
              (
                ticket.requesterEmail ||
                ticket.requester_email ||
                ""
              )
              .toLowerCase()
              .trim();

            return (
              ticketEmail === email &&
              (
                ticket.status === "resolved" ||
                ticket.status === "closed"
              )
            );
          }
        );

      console.log(
        "TIKET USER:",
        filtered
      );

      setUserTickets(filtered);

    }catch(error){
      console.error(
        "Gagal mengambil tiket user:",
        error
      );
      setUserTickets([]);
    }
    finally{
      setLoadingTickets(false);
    }
  };

  // =====================================================
  // CEK URL PARAMS SAAT LOAD
  // =====================================================

  useEffect(() => {
    fetchUserTickets();

    const ticketFromUrl = searchParams.get("ticket");
    const idFromUrl = searchParams.get("id");
    
    if (ticketFromUrl) {
      setTicketNumber(ticketFromUrl);
      // Langsung fetch dengan delay kecil
      setTimeout(() => {
        fetchTicketByNumber(ticketFromUrl);
      }, 300);
    }
    
    if (idFromUrl) {
      setTicketId(idFromUrl);
      // Jika ada ID langsung, kita bisa langsung ambil data tiket
      fetchTicketById(idFromUrl);
    }
  }, []);

  // =====================================================
  // FETCH TICKET BY ID (LANGSUNG)
  // =====================================================

  const fetchTicketById = async (id: string) => {
    if (!id) return;
    
    setFetchingTicket(true);
    setError("");
    
    try {
      const result = await apiFetch(`/tickets/${id}`, {
        method: "GET",
      });
      
      console.log("TICKET BY ID:", result);
      
      const ticket = result?.data || result;
      if (ticket?.id) {
        setTicketId(ticket.id);
        setTicketData(ticket);
        setTicketNumber(ticket.ticketNumber || ticket.number || "");
        setError("");
      }
    } catch (error) {
      console.error("Fetch by ID error:", error);
    } finally {
      setFetchingTicket(false);
    }
  };

  // =====================================================
  // FETCH TICKET BY NUMBER
  // =====================================================

  const fetchTicketByNumber = async (number: string) => {
    if (!number.trim() || number.trim().length < 3) {
      setTicketId("");
      setTicketData(null);
      return;
    }

    setFetchingTicket(true);
    setError("");

    try {
      // ✅ COBA ENDPOINT YANG LEBIH SPESIFIK
      // Endpoint 1: GET /tickets/number/{ticketNumber}
      let result = null;
      let ticket = null;

      try {
        console.log("Mencoba: /tickets/number/" + number);
        result = await apiFetch(`/tickets/number/${encodeURIComponent(number)}`, {
          method: "GET",
        });
        console.log("Response 1:", result);
      } catch (err) {
        console.log("Endpoint 1 gagal");
      }

      // Endpoint 2: GET /tickets?ticketNumber=xxx
      if (!result?.data && !result?.id) {
        try {
          console.log("Mencoba: /tickets?ticketNumber=" + number);
          result = await apiFetch(`/tickets?ticketNumber=${encodeURIComponent(number)}`, {
            method: "GET",
          });
          console.log("Response 2:", result);
        } catch (err) {
          console.log("Endpoint 2 gagal");
        }
      }

      // Endpoint 3: GET /tickets/track?number=xxx
      if (!result?.data && !result?.id) {
        try {
          console.log("Mencoba: /tickets/track?number=" + number);
          result = await apiFetch(`/tickets/track?number=${encodeURIComponent(number)}`, {
            method: "GET",
          });
          console.log("Response 3:", result);
        } catch (err) {
          console.log("Endpoint 3 gagal");
        }
      }

      // Proses hasil
      ticket = result?.data || result;
      
      if (Array.isArray(ticket) && ticket.length > 0) {
        ticket = ticket[0];
      }

      console.log("Hasil akhir:", ticket);

      if (ticket?.id) {
        setTicketId(ticket.id);
        setTicketData(ticket);
        setError("");
        console.log("✅ Tiket ditemukan dengan ID:", ticket.id);
      } else {
        setTicketId("");
        setTicketData(null);
        setError("Tiket tidak ditemukan. Pastikan nomor tiket benar.");
      }

    } catch (error: any) {
      console.error("FETCH ERROR:", error);
      setTicketId("");
      setTicketData(null);
      setError(
        error instanceof Error ? error.message : "Gagal mencari tiket."
      );
    } finally {
      setFetchingTicket(false);
    }
  };

  // =====================================================
  // AUTO FETCH SAAT TIKET NUMBER BERUBAH
  // =====================================================

  const handleTicketNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTicketNumber(value);
    setError("");

    if (ticketId) {
      setRating(0);
      setComment("");
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (value.trim().length >= 3) {
        fetchTicketByNumber(value);
      } else {
        setTicketId("");
        setTicketData(null);
      }
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // =====================================================
  // FUNGSI PILIH TIKET
  // =====================================================

  const handleSelectTicket = (
    e: React.ChangeEvent<HTMLSelectElement>
  )=>{
    const id =
      e.target.value;

    const selected =
      userTickets.find(
        (ticket)=>
          ticket.id === id
      );

    if(selected){
      setTicketId(
        selected.id
      );

      setTicketNumber(
        selected.ticketNumber || ""
      );

      setTicketData(
        selected
      );

      setRating(0);

      setComment("");

      setError("");
    }
  };

  // =====================================================
  // SUBMIT RATING
  // =====================================================

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!ticketNumber.trim()) {
      setError("Nomor tiket harus diisi.");
      return;
    }

    if (!ticketId) {
      setError("Tiket tidak ditemukan. Periksa kembali nomor tiket.");
      return;
    }

    if (rating === 0) {
      setError("Silakan pilih rating terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await apiFetch(
        `/tickets/${ticketId}/satisfaction`,
        {
          method: "POST",
          body: JSON.stringify({
            rating: rating,
            comment: comment.trim() || "",
          }),
        }
      );

      console.log("SATISFACTION RESPONSE:", result);
      setSubmitted(true);
      setError("");

    } catch (error: any) {
      console.error("SEND ERROR:", error);
      setError(
        error instanceof Error ? error.message : "Terjadi kesalahan saat mengirim rating."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTicketNumber("");
    setTicketId("");
    setTicketData(null);
    setRating(0);
    setComment("");
    setSubmitted(false);
    setError("");
    setLoading(false);
  };

  const getRatingText = (value: number) => {
    switch (value) {
      case 1: return "Sangat Tidak Puas";
      case 2: return "Tidak Puas";
      case 3: return "Cukup Puas";
      case 4: return "Puas";
      case 5: return "Sangat Puas";
      default: return "Belum memberikan rating";
    }
  };

  const getRatingDescription = (value: number) => {
    switch (value) {
      case 1: return "Pelayanan yang diterima belum memenuhi harapan.";
      case 2: return "Masih banyak hal yang perlu diperbaiki.";
      case 3: return "Pelayanan cukup baik, tetapi masih bisa ditingkatkan.";
      case 4: return "Pelayanan sudah baik dan sesuai harapan.";
      case 5: return "Pelayanan sangat baik dan memuaskan.";
      default: return "Klik salah satu bintang untuk memberikan penilaian.";
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800">
      <Sidebar />
      <main className="ml-64 flex-1 min-w-0">
        <Navbar />

        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-blue-600 mb-2">
              Penilaian Layanan
            </p>
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Beri Rating Pelayanan
                </h1>
                <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                  Bagikan pengalaman Anda setelah mendapatkan bantuan
                  dari tim Helpdesk.
                </p>
              </div>
              <div className="hidden md:flex w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 items-center justify-center">
                <Star size={24} strokeWidth={2.2} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl shadow-sm">
              <div className="p-4 flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    {error.includes("Tiket tidak ditemukan") ? "Tiket Tidak Ditemukan" : "Gagal"}
                  </p>
                  <p className="text-sm text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {submitted && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm">
              <div className="p-4 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-700">Rating berhasil dikirim</h3>
                  <p className="text-sm text-emerald-600 mt-0.5">
                    Terima kasih telah memberikan penilaian untuk tiket{" "}
                    <span className="font-semibold">{ticketNumber}</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MAIN CARD */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            {/* CARD HEADER */}
            <div className="px-6 py-5 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <MessageSquare size={19} className="text-slate-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Penilaian Tiket</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Isi penilaian berdasarkan pelayanan yang Anda terima.
                  </p>
                </div>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              {/* NOMOR TIKET */}
              <div className="mb-8">
                <label htmlFor="ticket" className="block text-sm font-semibold text-slate-800 mb-2">
                  Nomor Tiket
                </label>
                <div className="relative">
                  <Ticket size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={ticketId}
                    onChange={handleSelectTicket}
                    disabled={
                      submitted ||
                      loading ||
                      loadingTickets
                    }
                    className="
                      w-full h-11
                      border border-slate-300
                      rounded-lg
                      pl-10 pr-4
                      text-sm
                      text-slate-900
                      outline-none
                      focus:border-blue-600
                      focus:ring-2
                      focus:ring-blue-100
                      disabled:bg-slate-50 disabled:text-slate-500
                    "
                  >
                    <option value="">
                      {
                        loadingTickets
                        ?
                        "Memuat tiket..."
                        :
                        "Pilih tiket yang ingin diberi rating"
                      }
                    </option>

                    {
                      userTickets.map((ticket)=>(
                        <option
                          key={ticket.id}
                          value={ticket.id}
                        >
                          {ticket.ticketNumber}
                          {" - "}
                          {ticket.subject || "Tanpa judul"}
                        </option>
                      ))
                    }
                  </select>
                  {fetchingTicket && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 size={18} className="animate-spin text-blue-500" />
                    </div>
                  )}
                  {ticketId && !fetchingTicket && ticketNumber.trim().length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Pilih tiket yang sudah selesai untuk memberikan penilaian.
                  {ticketId && (
                    <span className="text-emerald-600 font-medium ml-1">✓ Tiket ditemukan</span>
                  )}
                  {!ticketId && ticketNumber.trim().length > 3 && !fetchingTicket && (
                    <span className="text-red-500 font-medium ml-1">✗ Tiket tidak ditemukan</span>
                  )}
                </p>

                {ticketData && ticketId && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <span className="font-semibold">Status:</span> {ticketData.status || 'N/A'} | 
                      <span className="font-semibold ml-2">Subject:</span> {ticketData.subject || 'N/A'}
                    </p>
                  </div>
                )}
              </div>

              {/* RATING - Sama seperti sebelumnya */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Kualitas Pelayanan</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Klik bintang sesuai dengan penilaian Anda.
                      </p>
                    </div>
                    {rating > 0 && (
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-900">
                          {rating}
                          <span className="text-sm font-medium text-slate-400">/5</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 py-9">
                  <div className="flex justify-center items-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isSelected = star <= rating;
                      return (
                        <button
                          key={star}
                          type="button"
                          disabled={submitted || loading || fetchingTicket}
                          onClick={() => {
                            if (!ticketId) {
                              setError("Silakan cari tiket terlebih dahulu.");
                              return;
                            }
                            setRating(star);
                            setError("");
                          }}
                          className={`p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all ${
                            !ticketId || submitted || loading || fetchingTicket
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer hover:scale-110 active:scale-95'
                          }`}
                        >
                          <Star
                            size={40}
                            strokeWidth={2.5}
                            className={
                              isSelected
                                ? "fill-yellow-400 text-yellow-500"
                                : "fill-white text-slate-300"
                            }
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-center mt-5">
                    <p className={`text-base font-bold ${rating > 0 ? "text-slate-900" : "text-slate-400"}`}>
                      {getRatingText(rating)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1.5">
                      {getRatingDescription(rating)}
                    </p>
                    {!ticketId && ticketNumber.trim().length > 0 && !fetchingTicket && (
                      <p className="text-xs text-amber-600 mt-2">
                        ⚠️ Masukkan nomor tiket yang valid terlebih dahulu
                      </p>
                    )}
                    {fetchingTicket && (
                      <p className="text-xs text-blue-600 mt-2">🔍 Mencari tiket...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* COMMENT */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="comment" className="text-sm font-semibold text-slate-800">
                    Komentar & Masukan
                  </label>
                  <span className="text-xs text-slate-400">Opsional</span>
                </div>
                <textarea
                  id="comment"
                  rows={5}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={submitted || loading || !ticketId}
                  placeholder={ticketId ? "Tulis pengalaman, kritik, atau saran Anda..." : "Cari tiket terlebih dahulu untuk memberikan komentar"}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 outline-none resize-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                />
                <div className="flex justify-end mt-2">
                  <span className="text-xs text-slate-400">{comment.length} karakter</span>
                </div>
              </div>

              {/* FOOTER */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                    Penilaian Anda membantu tim Helpdesk meningkatkan kualitas pelayanan.
                  </p>
                  <div className="flex items-center gap-3">
                    {!submitted && !loading && (
                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <RotateCcw size={15} />
                        Reset
                      </button>
                    )}
                    {submitted ? (
                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
                      >
                        <Star size={15} />
                        Beri Rating Lain
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={submitted || loading || fetchingTicket || !ticketId || rating === 0}
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <Send size={15} />
                            Kirim Rating
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>

          <p className="text-xs text-slate-400 text-center mt-5">
            Berikan penilaian secara jujur berdasarkan pengalaman Anda selama menggunakan layanan Helpdesk.
          </p>
        </div>
      </main>
    </div>
  );
}