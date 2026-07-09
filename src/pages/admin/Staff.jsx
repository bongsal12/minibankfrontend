import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../components/layout/DashboardLayout";

const initialForm = {
  branch_id: "",
  staff_code: "",
  full_name: "",
  email: "",
  password: "",
  gender: "",
  phone: "",
  position: "",
  status: "active",
};

const initialPagination = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [branches, setBranches] = useState([]);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState(initialForm);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(initialPagination);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  const fetchStaff = async (pageNumber = 1, searchValue = search) => {
    try {
      const res = await api.get("/staff", {
        params: {
          page: pageNumber,
          per_page: 10,
          search: searchValue,
        },
      });

      setStaffList(res.data.data);
      setPagination(res.data.meta);
      setPage(res.data.meta.current_page);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch staff");
    } finally {
      setFetching(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get("/branches", {
        params: {
          page: 1,
          per_page: 100,
        },
      });

      setBranches(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch branches");
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchBranches();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const clearErrors = () => {
    setError("");
    setValidationErrors([]);
  };

  const getValidationErrors = (err) => {
    if (err.response?.data?.errors) {
      return Object.values(err.response.data.errors).flat();
    }

    return [err.response?.data?.message || "Something went wrong"];
  };

  const openCreateForm = () => {
    setEditingStaff(null);
    setForm(initialForm);
    setShowForm(true);
    clearErrors();
  };

  const openEditForm = (staff) => {
    setEditingStaff(staff);

    setForm({
      branch_id: staff.branch_id || "",
      staff_code: staff.staff_code || "",
      full_name: staff.full_name || "",
      email: staff.user?.email || "",
      password: "",
      gender: staff.gender || "",
      phone: staff.phone || "",
      position: staff.position || "",
      status: staff.status || "active",
    });

    setShowForm(true);
    clearErrors();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingStaff(null);
    setForm(initialForm);
    clearErrors();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    clearErrors();

    try {
      const payload = {
        branch_id: form.branch_id,
        staff_code: form.staff_code,
        full_name: form.full_name,
        email: form.email,
        gender: form.gender || null,
        phone: form.phone,
        position: form.position,
        status: form.status,
      };

      if (!editingStaff || form.password.trim() !== "") {
        payload.password = form.password;
      }

      if (editingStaff) {
        await api.put(`/staff/${editingStaff.id}`, payload);
      } else {
        await api.post("/staff", payload);
      }

      await fetchStaff(page, search);

      setForm(initialForm);
      setEditingStaff(null);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save staff");
      setValidationErrors(getValidationErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const handleStaffAction = async (staff) => {
    const isActive = staff.status === "active";

    const confirmed = window.confirm(
      isActive
        ? `Are you sure you want to disable ${staff.full_name}?`
        : `Are you sure you want to permanently delete ${staff.full_name}?`,
    );

    if (!confirmed) return;

    try {
      clearErrors();
      setFetching(true);

      await api.delete(`/staff/${staff.id}`);
      await fetchStaff(page, search);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isActive ? "Failed to disable staff" : "Failed to delete staff"),
      );
      setValidationErrors(getValidationErrors(err));
      setFetching(false);
    }
  };

  const handleSearch = () => {
    clearErrors();
    setFetching(true);
    fetchStaff(1, search);
  };

  const handleResetSearch = () => {
    clearErrors();
    setSearch("");
    setFetching(true);
    fetchStaff(1, "");
  };

  const handlePreviousPage = () => {
    if (pagination.current_page <= 1) return;

    clearErrors();
    setFetching(true);
    fetchStaff(pagination.current_page - 1, search);
  };

  const handleNextPage = () => {
    if (pagination.current_page >= pagination.last_page) return;

    clearErrors();
    setFetching(true);
    fetchStaff(pagination.current_page + 1, search);
  };

  return (
    <DashboardLayout title="Staff Management">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Staff Management
          </h2>
          <p className="text-slate-500">
            Create and manage staff accounts for each branch.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="px-4 py-2 text-white bg-blue-700 rounded-lg hover:bg-blue-800"
        >
          Create Staff
        </button>
      </div>

      {(error || validationErrors.length > 0) && (
        <div className="px-4 py-3 mb-4 text-sm text-red-600 rounded-lg bg-red-50">
          {error && <p className="font-medium">{error}</p>}

          {validationErrors.length > 0 && (
            <ul className="pl-5 mt-2 space-y-1 list-disc">
              {validationErrors.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showForm && (
        <div className="p-6 mb-6 bg-white border rounded-xl">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            {editingStaff ? "Edit Staff" : "Create Staff"}
          </h3>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Sokha Dara"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
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
                placeholder="sokha@minibank.com"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder={
                  editingStaff
                    ? "Leave blank to keep old password"
                    : "Enter password"
                }
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required={!editingStaff}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Staff Code
              </label>
              <input
                name="staff_code"
                value={form.staff_code}
                onChange={handleChange}
                placeholder="STF-0001"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Branch
              </label>
              <select
                name="branch_id"
                value={form.branch_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_code} - {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Position
              </label>
              <select
                name="position"
                value={form.position}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Position</option>
                <option value="Teller">Teller</option>
                <option value="Customer Service">Customer Service</option>
                <option value="KYC Officer">KYC Officer</option>
                <option value="Branch Manager">Branch Manager</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
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
                <option value="blocked">Blocked</option>
              </select>
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
                {loading ? "Saving..." : "Save Staff"}
              </button>
            </div>
          </form>
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
          placeholder="Search by code, name, email, branch, phone, or position..."
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
                Staff Code
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Full Name
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Email
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Branch
              </th>
              <th className="px-4 py-3 font-semibold text-left text-slate-700">
                Position
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
                  colSpan="8"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Loading staff...
                </td>
              </tr>
            )}

            {!fetching &&
              staffList.map((staff) => (
                <tr key={staff.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 text-slate-700">
                    {staff.staff_code}
                  </td>

                  <td className="px-4 py-3 font-medium text-slate-900">
                    {staff.full_name}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {staff.user?.email || "-"}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {staff.branch
                      ? `${staff.branch.branch_code} - ${staff.branch.branch_name}`
                      : "-"}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {staff.position || "-"}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {staff.phone || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs capitalize ${
                        staff.status === "active"
                          ? "bg-green-100 text-green-700"
                          : staff.status === "blocked"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>

                  <td className="flex justify-between px-4 py-3 space-x-2.5 text-right max-w-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(staff)}
                      className="font-medium text-blue-700 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStaffAction(staff)}
                      className="font-medium text-red-600 hover:underline"
                    >
                      {staff.status === "active" ? "Disable" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            {!fetching && staffList.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No staff found.
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
