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

export default function PendingKyc() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState(initialPagination);

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const fetchPendingKyc = async (pageNumber = 1, searchValue = search) => {
    try {
      const res = await api.get("/kyc/pending", {
        params: {
          page: pageNumber,
          per_page: 10,
          search: searchValue,
        },
      });

      setCustomers(res.data.data);
      setPagination(res.data.meta);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch pending KYC");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPendingKyc();
  }, []);

  const handleSearch = () => {
    setError("");
    setFetching(true);
    fetchPendingKyc(1, search);
  };

  const handleResetSearch = () => {
    setError("");
    setSearch("");
    setFetching(true);
    fetchPendingKyc(1, "");
  };

  const handlePreviousPage = () => {
    if (pagination.current_page <= 1) return;

    setError("");
    setFetching(true);
    fetchPendingKyc(pagination.current_page - 1, search);
  };

  const handleNextPage = () => {
    if (pagination.current_page >= pagination.last_page) return;

    setError("");
    setFetching(true);
    fetchPendingKyc(pagination.current_page + 1, search);
  };

  return (
    <DashboardLayout title="Pending KYC">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pending KYC</h2>
          <p className="text-slate-500">
            Review customer registration and KYC documents.
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
          placeholder="Search by customer code, name, email, phone, national ID..."
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
                Customer Code
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Full Name
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Email
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Phone
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Document Type
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                KYC Status
              </th>
              <th className="px-4 py-3 font-semibold text-right text-slate-700">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {fetching && (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                  Loading pending KYC...
                </td>
              </tr>
            )}

            {!fetching &&
              customers.map((customer) => (
                <tr key={customer.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 text-slate-700">
                    {customer.customer_code}
                  </td>

                  <td className="px-4 py-3 font-medium text-slate-900">
                    {customer.full_name}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {customer.email}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {customer.phone || "-"}
                  </td>

                  <td className="px-4 py-3 capitalize text-slate-700">
                    {customer.document?.document_type?.replace("_", " ") || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs text-yellow-700 capitalize bg-yellow-100 rounded-full">
                      {customer.kyc_status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/kyc/${customer.id}`)}
                      className="font-medium text-blue-700 cursor-pointer hover:underline"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}

            {!fetching && customers.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                  No pending KYC found.
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