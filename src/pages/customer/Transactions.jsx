import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../components/layout/DashboardLayout";

const initialPagination = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(initialPagination);

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const fetchTransactions = async (pageNumber = 1) => {
    try {
      const res = await api.get("/transactions", {
        params: {
          page: pageNumber,
          per_page: 10,
        },
      });

      setTransactions(res.data.data);
      setPagination(res.data.meta);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch transactions");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handlePreviousPage = () => {
    if (pagination.current_page <= 1) return;

    setError("");
    setFetching(true);
    fetchTransactions(pagination.current_page - 1);
  };

  const handleNextPage = () => {
    if (pagination.current_page >= pagination.last_page) return;

    setError("");
    setFetching(true);
    fetchTransactions(pagination.current_page + 1);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const formatMoney = (amount, currency) => {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
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

  return (
    <DashboardLayout title="Transaction History">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Transaction History
        </h2>
        <p className="text-slate-500">
          View all deposits, withdrawals, and transfers for your account.
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 mb-4 text-sm text-red-600 rounded-lg bg-red-50">
          {error}
        </div>
      )}

      <div className="overflow-hidden bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Date
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Reference
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Account
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
            {fetching && (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Loading transactions...
                </td>
              </tr>
            )}

            {!fetching &&
              transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 text-slate-700">
                    {formatDate(transaction.transaction_date)}
                  </td>

                  <td className="px-4 py-3 font-medium text-slate-900">
                    {transaction.transaction_reference}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {transaction.account?.account_number || "-"}
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

            {!fetching && transactions.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 text-sm border-t">
          <div className="text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-700">
              {pagination.from || 0}
            </span>{" "}
            to{" "}
            <span className="font-medium text-slate-700">
              {pagination.to || 0}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-700">
              {pagination.total}
            </span>{" "}
            results
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.current_page <= 1}
              onClick={handlePreviousPage}
              className="rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-slate-600">
              Page {pagination.current_page} of {pagination.last_page}
            </span>

            <button
              type="button"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={handleNextPage}
              className="rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}