import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 ml-64">
        <Navbar />

        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6">
            Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <StatCard title="Total Ticket" total="120" />

            <StatCard title="Open Ticket" total="20" />

            <StatCard title="Diproses" total="45" />

            <StatCard title="Selesai" total="55" />

          </div>
        </div>
      </main>
    </div>
  );
}