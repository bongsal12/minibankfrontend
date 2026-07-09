import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../components/layout/DashboardLayout";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    try {
      const res = await api.get("/admin/dashboard-summary");
      setSummary(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch dashboard summary");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const formatMoney = (amount) => {
    return `USD ${Number(amount || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const isPositiveTransaction = (type) => {
    return ["deposit", "transfer_in"].includes(type);
  };

  const formatTransactionAmount = (transaction) => {
    const sign = isPositiveTransaction(transaction.type) ? "+" : "-";
    return `${sign}${transaction.currency} ${Number(transaction.amount || 0).toFixed(2)}`;
  };

  if (fetching) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="p-8 text-center bg-white border rounded-xl text-slate-500">
          Loading dashboard summary...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="px-4 py-3 text-sm text-red-600 rounded-lg bg-red-50">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
        <p className="text-slate-500">
          Overview of MiniBank customers, accounts, transactions, and audit activity.
        </p>
      </div>

      <div className="grid gap-4 mb-6 md:grid-cols-3 lg:grid-cols-4">
        <SummaryCard label="Total Branches" value={summary.total_branches} />
        <SummaryCard label="Total Staff" value={summary.total_staff} />
        <SummaryCard label="Total Customers" value={summary.total_customers} />
        <SummaryCard label="Pending KYC" value={summary.pending_kyc} />
        <SummaryCard label="Approved KYC" value={summary.approved_kyc} />
        <SummaryCard label="Rejected KYC" value={summary.rejected_kyc} />
        <SummaryCard label="Total Accounts" value={summary.total_accounts} />
        <SummaryCard label="Active Accounts" value={summary.active_accounts} />
      </div>

      <div className="grid gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Bank Balance"
          value={formatMoney(summary.total_bank_balance)}
          highlight
        />
        <SummaryCard
          label="Today Deposits"
          value={formatMoney(summary.today_deposits)}
          highlight
        />
        <SummaryCard
          label="Today Withdrawals"
          value={formatMoney(summary.today_withdrawals)}
          danger
        />
        <SummaryCard
          label="Today Transfers"
          value={formatMoney(summary.today_transfer_out)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white border rounded-xl">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Recent Transactions
          </h3>

          <div className="overflow-hidden border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-left text-slate-700">
                    Date
                  </th>
                  <th className="px-4 py-3 font-semibold text-left text-slate-700">
                    Reference
                  </th>
                  <th className="px-4 py-3 font-semibold text-left text-slate-700">
                    Type
                  </th>
                  <th className="px-4 py-3 font-semibold text-right text-slate-700">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {(summary.recent_transactions || []).map((transaction) => (
                  <tr key={transaction.id} className="border-t">
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(transaction.transaction_date)}
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-900">
                      {transaction.transaction_reference}
                    </td>

                    <td className="px-4 py-3 capitalize text-slate-700">
                      {transaction.type.replace("_", " ")}
                    </td>

                    <td
                      className={`px-4 py-3 text-right font-medium ${
                        isPositiveTransaction(transaction.type)
                          ? "text-green-700"
                          : "text-red-600"
                      }`}
                    >
                      {formatTransactionAmount(transaction)}
                    </td>
                  </tr>
                ))}

                {(summary.recent_transactions || []).length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 bg-white border rounded-xl">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Recent Audit Logs
          </h3>

          <div className="space-y-3">
            {(summary.recent_audit_logs || []).map((log) => (
              <div key={log.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="font-medium capitalize text-slate-900">
                    {log.action.replace("_", " ")}
                  </p>
                  <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
                    {log.module}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-600">{log.description}</p>

                <p className="mt-2 text-xs text-slate-400">
                  By {log.user?.name || "-"} · {formatDate(log.created_at)}
                </p>
              </div>
            ))}

            {(summary.recent_audit_logs || []).length === 0 && (
              <div className="p-8 text-sm text-center border rounded-lg text-slate-500">
                No audit logs found.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SummaryCard({ label, value, highlight, danger }) {
  return (
    <div className="p-6 bg-white border rounded-xl">
      <p className="text-sm text-slate-500">{label}</p>
      <h3
        className={`mt-2 text-2xl font-bold ${
          danger
            ? "text-red-600"
            : highlight
            ? "text-green-700"
            : "text-slate-900"
        }`}
      >
        {value ?? 0}
      </h3>
    </div>
  );
}