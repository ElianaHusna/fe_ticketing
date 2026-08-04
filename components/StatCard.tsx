interface Props {
  title: string;
  total: string;
}

export default function StatCard({
  title,
  total,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-gray-500">
        {title}
      </h2>

      <h1 className="text-3xl font-bold mt-3">
        {total}
      </h1>

    </div>
  );
}