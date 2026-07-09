import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../components/layout/DashboardLayout";

const initialApprovalForm = {
  branch_id: "",
  account_type: "saving",
  currency: "USD",
};

export default function KycReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [branches, setBranches] = useState([]);
  const [approvalForm, setApprovalForm] = useState(initialApprovalForm);
  const [rejectionReason, setRejectionReason] = useState("");

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  const storageUrl = (path) => {
    if (!path) return null;
    return `http://localhost:8000/storage/${path}`;
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

  const fetchCustomer = async () => {
    try {
      const res = await api.get(`/customers/${id}`);
      setCustomer(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch customer");
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

      if (res.data.data.length > 0) {
        setApprovalForm((prev) => ({
          ...prev,
          branch_id: res.data.data[0].id,
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch branches");
    }
  };

  useEffect(() => {
    fetchCustomer();
    fetchBranches();
  }, [id]);

  const handleApprovalChange = (e) => {
    setApprovalForm({
      ...approvalForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleApprove = async () => {
    const confirmed = window.confirm(
      `Approve KYC for ${customer?.full_name}? This will create a bank account.`
    );

    if (!confirmed) return;

    setLoading(true);
    clearErrors();

    try {
      await api.post(`/kyc/${id}/approve`, approvalForm);

      alert("KYC approved successfully. Account created.");
      navigate("/kyc/pending");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve KYC");
      setValidationErrors(getValidationErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const confirmed = window.confirm(
      `Reject KYC for ${customer?.full_name}?`
    );

    if (!confirmed) return;

    setRejecting(true);
    clearErrors();

    try {
      await api.post(`/kyc/${id}/reject`, {
        rejection_reason: rejectionReason,
      });

      alert("KYC rejected successfully.");
      navigate("/kyc/pending");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject KYC");
      setValidationErrors(getValidationErrors(err));
    } finally {
      setRejecting(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout title="KYC Review">
        <div className="p-8 text-center bg-white border rounded-xl text-slate-500">
          Loading customer KYC...
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout title="KYC Review">
        <div className="p-8 text-center bg-white border rounded-xl text-slate-500">
          Customer not found.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="KYC Review">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">KYC Review</h2>
          <p className="text-slate-500">
            Review customer information and approve or reject KYC.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/kyc/pending")}
          className="px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-50"
        >
          Back
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="p-6 bg-white border rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Customer Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Customer Code" value={customer.customer_code} />
              <Info label="Full Name" value={customer.full_name} />
              <Info label="Email" value={customer.email} />
              <Info label="Phone" value={customer.phone || "-"} />
              <Info label="Gender" value={customer.gender || "-"} />
              <Info label="Date of Birth" value={customer.date_of_birth || "-"} />
              <Info label="National ID" value={customer.national_id || "-"} />
              <Info label="City" value={customer.city || "-"} />
              <Info label="Occupation" value={customer.occupation || "-"} />
              <Info
                label="Monthly Income"
                value={`$${customer.monthly_income || "0.00"}`}
              />
              <Info label="Status" value={customer.status} />
              <Info label="KYC Status" value={customer.kyc_status} />

              <div className="md:col-span-2">
                <Info label="Address" value={customer.address || "-"} />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Document Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Info
                label="Document Type"
                value={
                  customer.document?.document_type?.replace("_", " ") || "-"
                }
              />
              <Info
                label="Document Number"
                value={customer.document?.document_number || "-"}
              />
              <Info
                label="Document Status"
                value={customer.document?.status || "-"}
              />
            </div>
          </div>

          <div className="p-6 bg-white border rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              KYC Images
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              <ImagePreview
                label="Front Image"
                src={storageUrl(customer.document?.front_image)}
              />
              <ImagePreview
                label="Back Image"
                src={storageUrl(customer.document?.back_image)}
              />
              <ImagePreview
                label="Selfie Image"
                src={storageUrl(customer.document?.selfie_image)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white border rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Approval
            </h3>

            {customer.kyc_status === "approved" ? (
              <div className="px-4 py-3 text-sm text-green-700 rounded-lg bg-green-50">
                This customer is already approved.
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-700">
                      Branch
                    </label>
                    <select
                      name="branch_id"
                      value={approvalForm.branch_id}
                      onChange={handleApprovalChange}
                      className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.branch_code} - {branch.branch_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-700">
                      Account Type
                    </label>
                    <select
                      name="account_type"
                      value={approvalForm.account_type}
                      onChange={handleApprovalChange}
                      className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="saving">Saving</option>
                      <option value="current">Current</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-700">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={approvalForm.currency}
                      onChange={handleApprovalChange}
                      className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="KHR">KHR</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={loading || !approvalForm.branch_id}
                    className="w-full px-4 py-2 text-white bg-green-700 rounded-lg cursor-pointer hover:bg-green-800 disabled:opacity-60"
                  >
                    {loading ? "Approving..." : "Approve KYC"}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="p-6 bg-white border rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Rejection
            </h3>

            {customer.kyc_status === "approved" ? (
              <div className="px-4 py-3 text-sm rounded-lg bg-slate-50 text-slate-600">
                Approved customer cannot be rejected.
              </div>
            ) : (
              <>
                <label className="block mb-1 text-sm font-medium cursor-pointer text-slate-700">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows="4"
                  placeholder="Example: National ID image is not clear."
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                />

                <button
                  type="button"
                  onClick={handleReject}
                  disabled={rejecting || rejectionReason.trim() === ""}
                  className="w-full px-4 py-2 mt-4 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60"
                >
                  {rejecting ? "Rejecting..." : "Reject KYC"}
                </button>
              </>
            )}
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

function ImagePreview({ label, src }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">{label}</p>

      {src ? (
        <a href={src} target="_blank" rel="noreferrer">
          <img
            src={src}
            alt={label}
            className="object-cover w-full h-40 border rounded-lg"
          />
        </a>
      ) : (
        <div className="flex items-center justify-center h-40 text-sm border rounded-lg bg-slate-50 text-slate-400">
          No image
        </div>
      )}
    </div>
  );
}