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

const initialFilters = {
  date_from: "",
  date_to: "",
  type: "",
  status: "",
  search: "",
};

export default function TransactionReport() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(initialPagination);
  const [filters, setFilters] = useState(initialFilters);

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const fetchTransactions = async (pageNumber = 1, filterValue = filters) => {
    try {
      const res = await api.get("/admin/reports/transactions", {
        params: {
          page: pageNumber,
          per_page: 10,
          date_from: filterValue.date_from,
          date_to: filterValue.date_to,
          type: filterValue.type,
          status: filterValue.status,
          search: filterValue.search,
        },
      });

      setTransactions(res.data.data);
      setSummary(res.data.summary);
      setPagination(res.data.meta);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch transaction report"
      );
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = () => {
    setError("");
    setFetching(true);
    fetchTransactions(1, filters);
  };

  const handleReset = () => {
    setError("");
    setFetching(true);
    setFilters(initialFilters);
    fetchTransactions(1, initialFilters);
  };

  const handlePreviousPage = () => {
    if (pagination.current_page <= 1) return;

    setError("");
    setFetching(true);
    fetchTransactions(pagination.current_page - 1, filters);
  };

  const handleNextPage = () => {
    if (pagination.current_page >= pagination.last_page) return;

    setError("");
    setFetching(true);
    fetchTransactions(pagination.current_page + 1, filters);
  };

  const formatMoney = (amount, currency = "USD") => {
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

  return (
    <DashboardLayout title="Transaction Report">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Transaction Report
        </h2>
        <p className="text-slate-500">
          View and filter all MiniBank transaction records.
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 mb-4 text-sm text-red-600 rounded-lg bg-red-50">
          {error}
        </div>
      )}

      <div className="grid gap-4 mb-6 md:grid-cols-5">
        <SummaryCard
          label="Total Deposit"
          value={formatMoney(summary?.total_deposit)}
          highlight
        />
        <SummaryCard
          label="Total Withdraw"
          value={formatMoney(summary?.total_withdraw)}
          danger
        />
        <SummaryCard
          label="Transfer In"
          value={formatMoney(summary?.total_transfer_in)}
          highlight
        />
        <SummaryCard
          label="Transfer Out"
          value={formatMoney(summary?.total_transfer_out)}
          danger
        />
        <SummaryCard
          label="Transactions"
          value={summary?.total_transactions || 0}
        />
      </div>

      <div className="p-6 mb-6 bg-white border rounded-xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Filters
        </h3>

        <div className="grid gap-4 md:grid-cols-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Date From
            </label>
            <input
              type="date"
              name="date_from"
              value={filters.date_from}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Date To
            </label>
            <input
              type="date"
              name="date_to"
              value={filters.date_to}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="deposit">Deposit</option>
              <option value="withdraw">Withdraw</option>
              <option value="transfer_in">Transfer In</option>
              <option value="transfer_out">Transfer Out</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Search
            </label>
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Reference, account, customer..."
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 py-2 text-white bg-blue-700 rounded-lg hover:bg-blue-800"
          >
            Apply Filter
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>

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
                Customer
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Type
              </th>
              <th className="px-4 py-3 font-semibold text-right text-slate-700">
                Amount
              </th>
              <th className="px-4 py-3 font-semibold text-right text-slate-700">
                Before
              </th>
              <th className="px-4 py-3 font-semibold text-right text-slate-700">
                After
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Performed By
              </th>
            </tr>
          </thead>

          <tbody>
            {fetching && (
              <tr>
                <td
                  colSpan="9"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Loading transaction report...
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

                  <td className="px-4 py-3 text-slate-700">
                    {transaction.account?.customer?.full_name || "-"}
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
                      transaction.balance_before,
                      transaction.currency
                    )}
                  </td>

                  <td className="px-4 py-3 text-right text-slate-700">
                    {formatMoney(
                      transaction.balance_after,
                      transaction.currency
                    )}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {transaction.performed_by?.name ||
                      transaction.performedBy?.name ||
                      "-"}
                  </td>
                </tr>
              ))}

            {!fetching && transactions.length === 0 && (
              <tr>
                <td
                  colSpan="9"
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