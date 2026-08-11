"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { dummyTickets as initialTickets, Ticket } from "../data/dummyTickets";

interface TicketContextType {
  tickets: Ticket[];
  addTicket: (t: Omit<Ticket, "id" | "riwayat">) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  addActivity: (id: string, aktivitas: string) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);

  const addTicket = (t: Omit<Ticket, "id" | "riwayat">) => {
    const newId = `TCK-${String(tickets.length + 1).padStart(3, "0")}`;
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    setTickets((prev) => [
      ...prev,
      { ...t, id: newId, riwayat: [{ waktu: now, aktivitas: "Tiket dibuat" }] },
    ]);
  };

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTicket = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  const addActivity = (id: string, aktivitas: string) => {
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, riwayat: [...t.riwayat, { waktu: now, aktivitas }] } : t
      )
    );
  };

  return (
    <TicketContext.Provider value={{ tickets, addTicket, updateTicket, deleteTicket, addActivity }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error("useTickets harus dipakai di dalam TicketProvider");
  return ctx;
}