import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";

export default function DashboardPage() {
  return (
    <div className="flex">

      <Sidebar />

      <main className="ml-64 flex-1 bg-gray-100 min-h-screen">

        <Navbar />

        <div className="p-8">

          <div className="grid grid-cols-4 gap-6">

            <StatCard
              title="Total Ticket"
              total="120"
            />

            <StatCard
              title="Open"
              total="20"
            />

            <StatCard
              title="Diproses"
              total="45"
            />

            <StatCard
              title="Selesai"
              total="55"
            />

          </div>

        </div>

      </main>

    </div>
  );
}