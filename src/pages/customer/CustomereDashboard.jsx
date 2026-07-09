import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../components/layout/DashboardLayout";

export default function CustomerDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      const [profileRes, transactionRes] = await Promise.all([
        api.get("/profile"),
        api.get("/transactions", {
          params: {
            page: 1,
            per_page: 5,
          },
        }),
      ]);

      setProfile(profileRes.data.data);
      setTransactions(transactionRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch dashboard data");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatMoney = (amount, currency) => {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
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

    return `${sign}${formatMoney(transaction.amount, transaction.currency)}`;
  };

  const getTypeBadgeClass = (type) => {
    if (["deposit", "transfer_in"].includes(type)) {
      return "bg-green-100 text-green-700";
    }

    if (["withdraw", "transfer_out"].includes(type)) {
      return "bg-red-100 text-red-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  if (fetching) {
    return (
      <DashboardLayout title="Customer Dashboard">
        <div className="p-8 text-center bg-white border rounded-xl text-slate-500">
          Loading customer dashboard...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Customer Dashboard">
        <div className="px-4 py-3 text-sm text-red-600 rounded-lg bg-red-50">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  const customer = profile?.customer;
  const accounts = customer?.accounts || [];
  const mainAccount = accounts[0];

  return (
    <DashboardLayout title="Customer Dashboard">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Customer Dashboard
          </h2>
          <p className="text-slate-500">
            Welcome back, {profile?.name}. View your account information.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/customer/transfer")}
            className="px-4 py-2 text-white bg-blue-700 rounded-lg hover:bg-blue-800"
          >
            Transfer Money
          </button>

          <button
            type="button"
            onClick={() => navigate("/customer/transactions")}
            className="px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-50"
          >
            View Transactions
          </button>
        </div>
      </div>

      <div className="grid gap-4 mb-6 md:grid-cols-4">
        <div className="p-6 bg-white border rounded-xl">
          <p className="text-sm text-slate-500">Customer Code</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {customer?.customer_code || "-"}
          </h3>
        </div>

        <div className="p-6 bg-white border rounded-xl">
          <p className="text-sm text-slate-500">KYC Status</p>
          <h3 className="mt-2 text-2xl font-bold text-green-700 capitalize">
            {customer?.kyc_status || "-"}
          </h3>
        </div>

        <div className="p-6 bg-white border rounded-xl">
          <p className="text-sm text-slate-500">Account Status</p>
          <h3 className="mt-2 text-2xl font-bold capitalize text-slate-900">
            {mainAccount?.status || "-"}
          </h3>
        </div>

        <div className="p-6 bg-white border rounded-xl">
          <p className="text-sm text-slate-500">Available Balance</p>
          <h3 className="mt-2 text-2xl font-bold text-green-700">
            {mainAccount
              ? formatMoney(mainAccount.balance, mainAccount.currency)
              : "-"}
          </h3>
        </div>
      </div>

      <div className="p-6 mb-6 bg-white border rounded-xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          My Bank Account
        </h3>

        {mainAccount ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Account Number" value={mainAccount.account_number} />
            <Info label="Account Type" value={mainAccount.account_type} />
            <Info label="Currency" value={mainAccount.currency} />
            <Info
              label="Balance"
              value={formatMoney(mainAccount.balance, mainAccount.currency)}
            />
            <Info
              label="Branch"
              value={
                mainAccount.branch
                  ? `${mainAccount.branch.branch_code} - ${mainAccount.branch.branch_name}`
                  : "-"
              }
            />
            <Info label="Opened At" value={mainAccount.opened_at || "-"} />
          </div>
        ) : (
          <div className="px-4 py-3 text-sm text-yellow-700 rounded-lg bg-yellow-50">
            No account found yet. Please contact MiniBank support.
          </div>
        )}
      </div>

      <div className="p-6 mb-6 bg-white border rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Recent Transactions
          </h3>

          <button
            type="button"
            onClick={() => navigate("/customer/transactions")}
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            View All
          </button>
        </div>

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
                <th className="px-4 py-3 font-semibold text-right text-slate-700">
                  Balance After
                </th>
                <th className="px-4 py-3 font-semibold text-left text-slate-700">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-t">
                  <td className="px-4 py-3 text-slate-700">
                    {formatDate(transaction.transaction_date)}
                  </td>

                  <td className="px-4 py-3 font-medium text-slate-900">
                    {transaction.transaction_reference}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs capitalize ${getTypeBadgeClass(
                        transaction.type
                      )}`}
                    >
                      {transaction.type.replace("_", " ")}
                    </span>
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

                  <td className="px-4 py-3 text-right text-slate-700">
                    {formatMoney(
                      transaction.balance_after,
                      transaction.currency
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs text-green-700 capitalize bg-green-100 rounded-full">
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}

              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No recent transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-white border rounded-xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Personal Information
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <Info label="Full Name" value={customer?.full_name || "-"} />
          <Info label="Email" value={customer?.email || profile?.email || "-"} />
          <Info label="Phone" value={customer?.phone || "-"} />
          <Info label="Gender" value={customer?.gender || "-"} />
          <Info label="National ID" value={customer?.national_id || "-"} />
          <Info label="City" value={customer?.city || "-"} />

          <div className="md:col-span-2">
            <Info label="Address" value={customer?.address || "-"} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide uppercase text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium capitalize text-slate-900">
        {value}
      </p>
    </div>
  );
}