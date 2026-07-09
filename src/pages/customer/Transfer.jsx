import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ConfirmModal from "../../components/common/ConfirmModal";

const initialForm = {
  from_account_id: "",
  receiver_account_number: "",
  amount: "",
  description: "",
};

export default function Transfer() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [receiver, setReceiver] = useState(null);

  const [fetching, setFetching] = useState(true);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const clearMessages = () => {
    setError("");
    setSuccess("");
    setValidationErrors([]);
  };

  const getValidationErrors = (err) => {
    if (err.response?.data?.errors) {
      return Object.values(err.response.data.errors).flat();
    }

    return [err.response?.data?.message || "Something went wrong"];
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      const user = res.data.data;

      setProfile(user);

      const accounts = user.customer?.accounts || [];

      if (accounts.length > 0) {
        setForm((prev) => ({
          ...prev,
          from_account_id: accounts[0].id,
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch profile");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === "receiver_account_number") {
      setReceiver(null);
    }
  };

  const handleLookupReceiver = async () => {
    if (!form.receiver_account_number.trim()) {
      setError("Please enter receiver account number.");
      return;
    }

    setChecking(true);
    clearMessages();
    setReceiver(null);

    try {
      const res = await api.get("/accounts/lookup", {
        params: {
          account_number: form.receiver_account_number,
        },
      });

      setReceiver(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Receiver account not found");
      setValidationErrors(getValidationErrors(err));
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setConfirmOpen(true);

    if (!confirmed) return;

    setLoading(true);
    clearMessages();

    try {
      await api.post("/transfers", {
        from_account_id: form.from_account_id,
        receiver_account_number: form.receiver_account_number,
        amount: form.amount,
        description: form.description,
      });

      setSuccess("Transfer completed successfully.");
      setReceiver(null);
      setForm((prev) => ({
        ...prev,
        receiver_account_number: "",
        amount: "",
        description: "",
      }));

      await fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Transfer failed");
      setValidationErrors(getValidationErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const accounts = profile?.customer?.accounts || [];
  const selectedAccount = accounts.find(
    (account) => String(account.id) === String(form.from_account_id),
  );

  const formatMoney = (amount, currency) => {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  };
  const handleConfirmTransfer = async () => {
    setLoading(true);
    clearMessages();

    try {
      await api.post("/transfers", {
        from_account_id: form.from_account_id,
        receiver_account_number: form.receiver_account_number,
        amount: form.amount,
        description: form.description,
      });

      setSuccess("Transfer completed successfully.");
      setReceiver(null);
      setConfirmOpen(false);

      setForm((prev) => ({
        ...prev,
        receiver_account_number: "",
        amount: "",
        description: "",
      }));

      await fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Transfer failed");
      setValidationErrors(getValidationErrors(err));
    } finally {
      setLoading(false);
    }
  };
  if (fetching) {
    return (
      <DashboardLayout title="Transfer Money">
        <div className="p-8 text-center bg-white border rounded-xl text-slate-500">
          Loading transfer page...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Transfer Money">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Transfer Money</h2>
        <p className="text-slate-500">
          Transfer money from your MiniBank account to another account.
        </p>
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

      {success && (
        <div className="px-4 py-3 mb-4 text-sm text-green-700 rounded-lg bg-green-50">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="p-6 bg-white border rounded-xl"
          >
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Transfer Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">
                  From Account
                </label>
                <select
                  name="from_account_id"
                  value={form.from_account_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.account_number} - {account.currency}{" "}
                      {Number(account.balance || 0).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">
                  Receiver Account Number
                </label>
                <div className="flex gap-2">
                  <input
                    name="receiver_account_number"
                    value={form.receiver_account_number}
                    onChange={handleChange}
                    placeholder="001-000002"
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={handleLookupReceiver}
                    disabled={checking}
                    className="px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {checking ? "Checking..." : "Check"}
                  </button>
                </div>
              </div>

              {receiver && (
                <div className="px-4 py-3 text-sm text-blue-700 rounded-lg bg-blue-50">
                  <p className="font-medium">Receiver Found</p>
                  <p className="mt-1">
                    {receiver.customer_name} — {receiver.account_number} —{" "}
                    {receiver.currency}
                  </p>
                </div>
              )}

              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">
                  Amount
                </label>
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="20.00"
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Transfer description"
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !selectedAccount}
                className="w-full px-4 py-2 text-white bg-blue-700 rounded-lg cursor-pointer hover:bg-blue-800 disabled:opacity-60"
              >
                {loading ? "Transferring..." : "Submit Transfer"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="p-6 bg-white border rounded-xl">
            <p className="text-sm text-slate-500">Available Balance</p>
            <h3 className="mt-2 text-2xl font-bold text-green-700">
              {selectedAccount
                ? formatMoney(selectedAccount.balance, selectedAccount.currency)
                : "-"}
            </h3>
          </div>

          <div className="p-6 bg-white border rounded-xl">
            <p className="text-sm text-slate-500">Selected Account</p>
            <h3 className="mt-2 text-lg font-bold text-slate-900">
              {selectedAccount?.account_number || "-"}
            </h3>
            <p className="mt-1 text-sm capitalize text-slate-500">
              {selectedAccount?.account_type || "-"} account
            </p>
          </div>
        </div>
      </div>
      <ConfirmModal
        open={confirmOpen}
        title="Confirm Transfer"
        message={`Transfer ${selectedAccount?.currency || ""} ${form.amount} to account ${form.receiver_account_number}?`}
        confirmText="Transfer"
        loading={loading}
        onConfirm={handleConfirmTransfer}
        onCancel={() => setConfirmOpen(false)}
      />
    </DashboardLayout>
  );
}
