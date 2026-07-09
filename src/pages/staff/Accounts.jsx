import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function Accounts() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState(initialPagination);

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const fetchAccounts = async (pageNumber = 1, searchValue = search) => {
    try {
      const res = await api.get("/accounts", {
        params: {
          page: pageNumber,
          per_page: 10,
          search: searchValue,
        },
      });

      setAccounts(res.data.data);
      setPagination(res.data.meta);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch accounts");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSearch = () => {
    setError("");
    setFetching(true);
    fetchAccounts(1, search);
  };

  const handleResetSearch = () => {
    setError("");
    setSearch("");
    setFetching(true);
    fetchAccounts(1, "");
  };

  const handlePreviousPage = () => {
    if (pagination.current_page <= 1) return;

    setError("");
    setFetching(true);
    fetchAccounts(pagination.current_page - 1, search);
  };

  const handleNextPage = () => {
    if (pagination.current_page >= pagination.last_page) return;

    setError("");
    setFetching(true);
    fetchAccounts(pagination.current_page + 1, search);
  };

  const formatMoney = (amount, currency) => {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  };

  return (
    <DashboardLayout title="Accounts">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Account Search
          </h2>
          <p className="text-slate-500">
            Search customer accounts and open account detail.
          </p>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 mb-4 text-sm text-red-600 rounded-lg bg-red-50">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Search by account number, customer code, name, email, phone..."
          className="w-full max-w-md px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 py-2 text-white bg-blue-700 rounded-lg hover:bg-blue-800"
          >
            Search
          </button>

          <button
            type="button"
            onClick={handleResetSearch}
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
                Account Number
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Customer
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Customer Code
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Branch
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Currency
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Balance
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Status
              </th>
              <th className="px-4 py-3 font-semibold text-right text-slate-700">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {fetching && (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Loading accounts...
                </td>
              </tr>
            )}

            {!fetching &&
              accounts.map((account) => (
                <tr key={account.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {account.account_number}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {account.customer?.full_name || "-"}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {account.customer?.customer_code || "-"}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {account.branch
                      ? `${account.branch.branch_code} - ${account.branch.branch_name}`
                      : "-"}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {account.currency}
                  </td>

                  <td className="px-4 py-3 font-medium text-slate-900">
                    {formatMoney(account.balance, account.currency)}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs capitalize ${
                        account.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {account.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/staff/accounts/${account.id}`)}
                      className="font-medium text-blue-700 cursor-pointer hover:underline"
                    >
                      View Detail
                    </button>
                  </td>
                </tr>
              ))}

            {!fetching && accounts.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No accounts found.
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