import DashboardLayout from "../../components/layout/DashboardLayout";

export default function StaffDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <DashboardLayout title="Staff Dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Staff Dashboard
        </h2>
        <p className="text-slate-500">
          Welcome back, {user?.name}. You are logged in as staff.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 bg-white border rounded-xl">
          <p className="text-sm text-slate-500">Pending KYC</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">0</h3>
        </div>

        <div className="p-6 bg-white border rounded-xl">
          <p className="text-sm text-slate-500">Today Deposits</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">$0.00</h3>
        </div>

        <div className="p-6 bg-white border rounded-xl">
          <p className="text-sm text-slate-500">Today Withdrawals</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">$0.00</h3>
        </div>
      </div>
    </DashboardLayout>
  );
}