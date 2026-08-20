"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Ticket,
} from "lucide-react";

import AdminSidebar from "@/components/AdminSidebar";
import { apiFetch } from "@/src/lib/api";


// =====================================================
// TYPE
// =====================================================

type TicketData = {
  id: string;

  ticketNumber: string;

  subject: string;

  requesterName: string;

  requesterEmail: string;

  priority: string;

  status: string;

  createdAt: string;
};


// =====================================================
// PAGE
// =====================================================


export default function EscalationPage() {


  const [tickets,setTickets] =
    useState<TicketData[]>([]);


  const [loading,setLoading] =
    useState(true);


  const [error,setError] =
    useState("");



  // =====================================================
  // FETCH ESCALATED
  // =====================================================


  const fetchEscalations = async()=>{

    try{

      setLoading(true);
      setError("");


      const response =
        await apiFetch(
          "/tickets?status=escalated&page=1&limit=100"
        );


      setTickets(
        response?.data || []
      );


    }catch(err){

      console.error(err);

      setError(
        err instanceof Error
        ? err.message
        : "Gagal mengambil tiket eskalasi"
      );


    }finally{

      setLoading(false);

    }

  };



  useEffect(()=>{

    fetchEscalations();

  },[]);




  return (

    <div className="min-h-screen bg-[#f5f7fb]">


      <AdminSidebar />



      <main className="ml-64 min-h-screen">


        {/* HEADER */}

        <header className="
          border-b
          border-slate-200
          bg-white
          px-8
          py-6
        ">


          <div className="flex justify-between items-center">


            <div>


              <p className="
                text-xs
                font-bold
                uppercase
                tracking-widest
                text-red-600
              ">
                Admin Helpdesk
              </p>



              <h1 className="
                mt-2
                text-2xl
                font-bold
                text-slate-900
              ">
                Tiket Eskalasi
              </h1>



              <p className="
                mt-1
                text-sm
                text-slate-500
              ">
                Tiket yang membutuhkan penanganan lebih lanjut.
              </p>


            </div>




            <button
              onClick={fetchEscalations}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                px-4
                py-2
                text-sm
                font-semibold
                text-slate-600
                hover:bg-slate-50
              "
            >

              <RefreshCw
                size={16}
                className={
                  loading
                  ?"animate-spin"
                  :""
                }
              />

              Refresh

            </button>


          </div>


        </header>





        <div className="p-8">



          {
            error && (

              <div className="
                mb-6
                rounded-xl
                border
                border-red-200
                bg-red-50
                p-4
                text-red-700
              ">

                {error}

              </div>

            )
          }





          <div className="
            rounded-2xl
            border
            bg-white
            overflow-hidden
          ">


            <div className="
              border-b
              px-6
              py-5
              flex
              items-center
              gap-3
            ">


              <div className="
                h-10
                w-10
                rounded-xl
                bg-red-50
                flex
                items-center
                justify-center
              ">

                <AlertTriangle
                  size={20}
                  className="text-red-600"
                />

              </div>


              <div>

                <h2 className="
                  font-bold
                  text-slate-900
                ">
                  Daftar Eskalasi
                </h2>


                <p className="
                  text-sm
                  text-slate-500
                ">
                  {tickets.length} tiket membutuhkan perhatian
                </p>


              </div>


            </div>





            {
              loading ? (


                <div className="
                  py-20
                  text-center
                ">

                  <RefreshCw
                    className="
                      mx-auto
                      animate-spin
                      text-red-600
                    "
                  />

                  <p className="mt-3 text-sm text-slate-500">
                    Memuat tiket eskalasi...
                  </p>


                </div>



              ) : tickets.length===0 ? (


                <div className="
                  py-20
                  text-center
                ">


                  <Ticket
                    size={35}
                    className="
                      mx-auto
                      text-slate-300
                    "
                  />


                  <p className="
                    mt-4
                    font-semibold
                    text-slate-600
                  ">
                    Tidak ada tiket eskalasi
                  </p>


                  <p className="
                    text-sm
                    text-slate-400
                  ">
                    Semua tiket masih dalam kondisi normal.
                  </p>


                </div>




              ) : (


                <div className="divide-y">


                  {
                    tickets.map((ticket)=>(


                      <div
                        key={ticket.id}
                        className="
                          flex
                          items-center
                          justify-between
                          px-6
                          py-5
                          hover:bg-red-50/40
                        "
                      >



                        <div>


                          <p className="
                            text-xs
                            font-bold
                            text-red-600
                          ">
                            {ticket.ticketNumber}
                          </p>



                          <h3 className="
                            mt-1
                            font-bold
                            text-slate-800
                          ">
                            {ticket.subject}
                          </h3>



                          <p className="
                            mt-1
                            text-sm
                            text-slate-500
                          ">
                            {ticket.requesterName}
                            {" • "}
                            {ticket.requesterEmail}
                          </p>



                        </div>




                        <Link

                          href={`/tickets/${ticket.id}`}

                          className="
                            flex
                            items-center
                            gap-1
                            rounded-xl
                            bg-red-600
                            px-4
                            py-2
                            text-xs
                            font-semibold
                            text-white
                            hover:bg-red-700
                          "

                        >

                          Detail

                          <ChevronRight size={14}/>


                        </Link>



                      </div>


                    ))
                  }



                </div>


              )
            }




          </div>




        </div>



      </main>



    </div>

  );

}