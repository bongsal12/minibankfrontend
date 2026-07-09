import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ConfirmModal from "../../components/common/ConfirmModal";

const initialTransactionForm = {
  amount: "",
  description: "",
};

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [depositForm, setDepositForm] = useState(initialTransactionForm);
  const [withdrawForm, setWithdrawForm] = useState(initialTransactionForm);

  const [fetching, setFetching] = useState(true);
  const [depositing, setDepositing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: "",
    title: "",
    message: "",
    danger: false,
  });

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

  const fetchAccount = async () => {
    try {
      const res = await api.get(`/accounts/${id}`);
      setAccount(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch account");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, [id]);

  const handleDepositChange = (e) => {
    setDepositForm({
      ...depositForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleWithdrawChange = (e) => {
    setWithdrawForm({
      ...withdrawForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleDeposit = async (e) => {
    e.preventDefault();

    setConfirmModal({
      open: true,
      type: "deposit",
      title: "Confirm Deposit",
      message: `Deposit ${account.currency} ${depositForm.amount} to account ${account.account_number}?`,
      danger: false,
    });

    if (!confirmed) return;

    setDepositing(true);
    clearMessages();

    try {
      await api.post(`/accounts/${id}/deposit`, {
        amount: depositForm.amount,
        description: depositForm.description,
      });

      setSuccess("Deposit completed successfully.");
      setDepositForm(initialTransactionForm);
      await fetchAccount();
    } catch (err) {
      setError(err.response?.data?.message || "Deposit failed");
      setValidationErrors(getValidationErrors(err));
    } finally {
      setDepositing(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();

    setConfirmModal({
      open: true,
      type: "withdraw",
      title: "Confirm Withdraw",
      message: `Withdraw ${account.currency} ${withdrawForm.amount} from account ${account.account_number}?`,
      danger: true,
    });

    if (!confirmed) return;

    setWithdrawing(true);
    clearMessages();

    try {
      await api.post(`/accounts/${id}/withdraw`, {
        amount: withdrawForm.amount,
        description: withdrawForm.description,
      });

      setSuccess("Withdraw completed successfully.");
      setWithdrawForm(initialTransactionForm);
      await fetchAccount();
    } catch (err) {
      setError(err.response?.data?.message || "Withdraw failed");
      setValidationErrors(getValidationErrors(err));
    } finally {
      setWithdrawing(false);
    }
  };

  const formatMoney = (amount, currency) => {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const formatTransactionAmount = (transaction) => {
    const isPositive = ["deposit", "transfer_in"].includes(transaction.type);
    const sign = isPositive ? "+" : "-";

    return `${sign}${transaction.currency} ${Number(
      transaction.amount || 0,
    ).toFixed(2)}`;
  };

  if (fetching) {
    return (
      <DashboardLayout title="Account Detail">
        <div className="p-8 text-center bg-white border rounded-xl text-slate-500">
          Loading account detail...
        </div>
      </DashboardLayout>
    );
  }

  if (!account) {
    return (
      <DashboardLayout title="Account Detail">
        <div className="p-8 text-center bg-white border rounded-xl text-slate-500">
          Account not found.
        </div>
      </DashboardLayout>
    );
  }
  const handleConfirmAction = async () => {
    if (confirmModal.type === "deposit") {
      setDepositing(true);
      clearMessages();

      try {
        await api.post(`/accounts/${id}/deposit`, {
          amount: depositForm.amount,
          description: depositForm.description,
        });

        setSuccess("Deposit completed successfully.");
        setDepositForm(initialTransactionForm);
        setConfirmModal({
          open: false,
          type: "",
          title: "",
          message: "",
          danger: false,
        });
        await fetchAccount();
      } catch (err) {
        setError(err.response?.data?.message || "Deposit failed");
        setValidationErrors(getValidationErrors(err));
      } finally {
        setDepositing(false);
      }
    }

    if (confirmModal.type === "withdraw") {
      setWithdrawing(true);
      clearMessages();

      try {
        await api.post(`/accounts/${id}/withdraw`, {
          amount: withdrawForm.amount,
          description: withdrawForm.description,
        });

        setSuccess("Withdraw completed successfully.");
        setWithdrawForm(initialTransactionForm);
        setConfirmModal({
          open: false,
          type: "",
          title: "",
          message: "",
          danger: false,
        });
        await fetchAccount();
      } catch (err) {
        setError(err.response?.data?.message || "Withdraw failed");
        setValidationErrors(getValidationErrors(err));
      } finally {
        setWithdrawing(false);
      }
    }
  };
  return (
    <DashboardLayout title="Account Detail">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Account Detail</h2>
          <p className="text-slate-500">
            View account information, deposit, withdraw, and recent
            transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/staff/accounts")}
          className="px-4 py-2 border rounded-lg cursor-pointer text-slate-700 hover:bg-slate-50"
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

      {success && (
        <div className="px-4 py-3 mb-4 text-sm text-green-700 rounded-lg bg-green-50">
          {success}
        </div>
      )}

      <div className="grid gap-4 mb-6 md:grid-cols-4">
        <div className="p-6 bg-white border rounded-xl">
          <p className="text-sm text-slate-500">Account Number</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">
            {account.account_number}
          </h3>
        </div>

        <div className="p-6 bg-white border rounded-xl">
          <p className="text-sm text-slate-500">Balance</p>
          <h3 className="mt-2 text-xl font-bold text-green-700">
            {formatMoney(account.balance, account.currency)}
          </h3>
        </div>

        <div className="p-6 bg-white border rounded-xl">
          <p className="text-sm text-slate-500">Currency</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">
            {account.currency}
          </h3>
        </div>

        <div className="p-6 bg-white border rounded-xl">
          <p className="text-sm text-slate-500">Status</p>
          <h3 className="mt-2 text-xl font-bold capitalize text-slate-900">
            {account.status}
          </h3>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="p-6 bg-white border rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Customer Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Info
                label="Customer Code"
                value={account.customer?.customer_code || "-"}
              />
              <Info
                label="Full Name"
                value={account.customer?.full_name || "-"}
              />
              <Info label="Email" value={account.customer?.email || "-"} />
              <Info label="Phone" value={account.customer?.phone || "-"} />
              <Info label="City" value={account.customer?.city || "-"} />
              <Info
                label="Branch"
                value={
                  account.branch
                    ? `${account.branch.branch_code} - ${account.branch.branch_name}`
                    : "-"
                }
              />
            </div>
          </div>

          <div className="p-6 bg-white border rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Recent Transactions
            </h3>

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
                  </tr>
                </thead>

                <tbody>
                  {(account.transactions || []).map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-t last:border-b-0"
                    >
                      <td className="px-4 py-3 text-slate-700">
                        {formatDate(transaction.transaction_date)}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {transaction.transaction_reference}
                      </td>

                      <td className="px-4 py-3 capitalize text-slate-700">
                        {transaction.type.replace("_", " ")}
                      </td>

                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          ["deposit", "transfer_in"].includes(transaction.type)
                            ? "text-green-700"
                            : "text-red-600"
                        }`}
                      >
                        {formatTransactionAmount(transaction)}
                      </td>

                      <td className="px-4 py-3 text-right text-slate-700">
                        {formatMoney(
                          transaction.balance_after,
                          transaction.currency,
                        )}
                      </td>
                    </tr>
                  ))}

                  {(account.transactions || []).length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <form
            onSubmit={handleDeposit}
            className="p-6 bg-white border rounded-xl"
          >
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Deposit
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">
                  Amount
                </label>
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={depositForm.amount}
                  onChange={handleDepositChange}
                  placeholder="100.00"
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={depositForm.description}
                  onChange={handleDepositChange}
                  placeholder="Cash deposit"
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                type="submit"
                disabled={depositing || account.status !== "active"}
                className="w-full px-4 py-2 text-white bg-green-700 rounded-lg cursor-pointer hover:bg-green-800 disabled:opacity-60"
              >
                {depositing ? "Depositing..." : "Deposit"}
              </button>
            </div>
          </form>

          <form
            onSubmit={handleWithdraw}
            className="p-6 bg-white border rounded-xl"
          >
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Withdraw
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">
                  Amount
                </label>
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={withdrawForm.amount}
                  onChange={handleWithdrawChange}
                  placeholder="50.00"
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={withdrawForm.description}
                  onChange={handleWithdrawChange}
                  placeholder="Cash withdrawal"
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={withdrawing || account.status !== "active"}
                className="w-full px-4 py-2 text-white bg-red-600 rounded-lg cursor-pointer hover:bg-red-700 disabled:opacity-60"
              >
                {withdrawing ? "Withdrawing..." : "Withdraw"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.type === "withdraw" ? "Withdraw" : "Deposit"}
        danger={confirmModal.danger}
        loading={depositing || withdrawing}
        onConfirm={handleConfirmAction}
        onCancel={() =>
          setConfirmModal({
            open: false,
            type: "",
            title: "",
            message: "",
            danger: false,
          })
        }
      />
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
