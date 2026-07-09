import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "../../components/ui/pagination";

const initialForm = {
  branch_code: "",
  branch_name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  status: "active",
};

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingBranch, setEditingBranch] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0,
    from: null,
    to: null,
  });

  const fetchBranches = async (pageNumber = 1, searchValue) => {
    setFetching(true);
    try {
      const res = await api.get("/branches", {
        params: {
          page: pageNumber,
          per_page: 10,
          search: searchValue || "",
        },
      });
      setBranches(res.data.data || []);
      setPagination(res.data.meta);
      setPage(res.data.meta.current_page);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch branches");
    } finally {
      setFetching(false);
    }
  };
  useEffect(() => {
    fetchBranches();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const openCreateForm = () => {
    setEditingBranch(null);
    setForm(initialForm);
    setShowForm(true);
    setError("");
  };

  const openEditForm = (branch) => {
    setEditingBranch(branch);
    setForm({
      branch_code: branch.branch_code || "",
      branch_name: branch.branch_name || "",
      phone: branch.phone || "",
      email: branch.email || "",
      address: branch.address || "",
      city: branch.city || "",
      status: branch.status || "active",
    });
    setShowForm(true);
    setError("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBranch(null);
    setForm(initialForm);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (editingBranch) {
        await api.put(`/branches/${editingBranch.id}`, form);
      } else {
        await api.post("/branches", form);
      }

      await fetchBranches();

      setForm(initialForm);
      setEditingBranch(null);
      setShowForm(false);
    } catch (err) {
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0][0];
        setError(firstError);
      } else {
        setError(err.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (branch) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${branch.branch_name}?`,
    );

    if (!confirmed) return;

    setError("");

    try {
      await api.delete(`/branches/${branch.id}`);
      await fetchBranches();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete branch");
    }
  };

  return (
    <DashboardLayout title="Branch Management">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Branch Management
          </h2>
          <p className="text-slate-500">
            Manage all bank branches in the system.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="px-4 py-2 text-white bg-blue-700 rounded-lg hover:bg-blue-800"
        >
          Create Branch
        </button>
      </div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              fetchBranches(1, search);
            }
          }}
          placeholder="Search by code, name, city, phone..."
          className="w-full max-w-md px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fetchBranches(1, search)}
            className="px-4 py-2 text-white bg-blue-700 rounded-lg hover:bg-blue-800"
          >
            Search
          </button>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              fetchBranches(1, "");
            }}
            className="px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>
      {error && (
        <div className="px-4 py-3 mb-4 text-sm text-red-600 rounded-lg bg-red-50">
          {error}
        </div>
      )}

      {showForm && (
        <div className="p-6 mb-6 bg-white border rounded-xl">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            {editingBranch ? "Edit Branch" : "Create Branch"}
          </h3>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Branch Code
              </label>
              <input
                name="branch_code"
                value={form.branch_code}
                onChange={handleChange}
                placeholder="001"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Branch Name
              </label>
              <input
                name="branch_name"
                value={form.branch_name}
                onChange={handleChange}
                placeholder="Main Branch"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Phone
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="012345678"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="main@minibank.com"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                City
              </label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Phnom Penh"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Address
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Phnom Penh, Cambodia"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div className="flex justify-end gap-3 md:col-span-2">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Branch"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden bg-white border rounded-xl">
        <table className="w-full text-md">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Branch Code
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Branch Name
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                City
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Phone
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
                  colSpan="6"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Loading branches...
                </td>
              </tr>
            )}

            {!fetching &&
              branches.map((branch) => (
                <tr key={branch.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 text-slate-700">
                    {branch.branch_code}
                  </td>

                  <td className="px-4 py-3 font-medium text-slate-900">
                    {branch.branch_name}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {branch.city || "-"}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {branch.phone || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs capitalize ${
                        branch.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {branch.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 space-x-2 text-right">
                    <button
                      type="button"
                      onClick={() => openEditForm(branch)}
                      className="font-medium text-blue-700 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(branch)}
                      className="font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

            {!fetching && branches.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No branches found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
              onClick={() => fetchBranches(pagination.current_page - 1, search)}
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
              onClick={() => fetchBranches(pagination.current_page + 1, search)}
              className="rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
    </DashboardLayout>
  );
}
