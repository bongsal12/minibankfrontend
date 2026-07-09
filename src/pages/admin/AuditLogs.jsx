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
  module: "",
  action: "",
  search: "",
};

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [pagination, setPagination] = useState(initialPagination);
  const [filters, setFilters] = useState(initialFilters);

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const fetchAuditLogs = async (pageNumber = 1, filterValue = filters) => {
    try {
      const res = await api.get("/admin/audit-logs", {
        params: {
          page: pageNumber,
          per_page: 10,
          module: filterValue.module,
          action: filterValue.action,
          search: filterValue.search,
        },
      });

      setAuditLogs(res.data.data);
      setPagination(res.data.meta);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch audit logs");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
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
    fetchAuditLogs(1, filters);
  };

  const handleReset = () => {
    setError("");
    setFetching(true);
    setFilters(initialFilters);
    fetchAuditLogs(1, initialFilters);
  };

  const handlePreviousPage = () => {
    if (pagination.current_page <= 1) return;

    setError("");
    setFetching(true);
    fetchAuditLogs(pagination.current_page - 1, filters);
  };

  const handleNextPage = () => {
    if (pagination.current_page >= pagination.last_page) return;

    setError("");
    setFetching(true);
    fetchAuditLogs(pagination.current_page + 1, filters);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const formatText = (text) => {
    if (!text) return "-";
    return text.replace("_", " ");
  };

  return (
    <DashboardLayout title="Audit Logs">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Audit Logs</h2>
        <p className="text-slate-500">
          Track important actions performed in the MiniBank system.
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 mb-4 text-sm text-red-600 rounded-lg bg-red-50">
          {error}
        </div>
      )}

      <div className="p-6 mb-6 bg-white border rounded-xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Filters
        </h3>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Module
            </label>
            <select
              name="module"
              value={filters.module}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Modules</option>
              <option value="KYC">KYC</option>
              <option value="Transaction">Transaction</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Action
            </label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="approve_kyc">Approve KYC</option>
              <option value="reject_kyc">Reject KYC</option>
              <option value="deposit">Deposit</option>
              <option value="withdraw">Withdraw</option>
              <option value="transfer">Transfer</option>
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
              placeholder="Search description, user, action..."
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
                User
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Module
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Action
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Description
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                IP Address
              </th>
            </tr>
          </thead>

          <tbody>
            {fetching && (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Loading audit logs...
                </td>
              </tr>
            )}

            {!fetching &&
              auditLogs.map((log) => (
                <tr key={log.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 text-slate-700">
                    {formatDate(log.created_at)}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    <div className="font-medium text-slate-900">
                      {log.user?.name || "-"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {log.user?.role || "-"}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                      {log.module}
                    </span>
                  </td>

                  <td className="px-4 py-3 capitalize text-slate-700">
                    {formatText(log.action)}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {log.description || "-"}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {log.ip_address || "-"}
                  </td>
                </tr>
              ))}

            {!fetching && auditLogs.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No audit logs found.
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