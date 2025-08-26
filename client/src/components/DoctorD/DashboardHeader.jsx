
export default function DashboardHeader({ name, specialty }) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-600 text-white p-5 shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">{name}</h1>
        <div className="text-sm sm:text-base opacity-90">Doctor Dashboard</div>
      </div>
      {specialty ? (
        <div className="opacity-90 mt-1 text-xs sm:text-sm">{specialty}</div>
      ) : null}
    </div>
  );
}
