import { Link, useLocation } from "react-router-dom";

export default function PendingApproval() {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-100">
      <div className="w-full max-w-lg p-8 text-center bg-white border shadow-sm rounded-2xl">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-3xl bg-yellow-100 rounded-full">
          ⏳
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Registration Submitted
        </h1>

        <p className="mt-3 text-slate-500">
          Your MiniBank account registration has been submitted successfully.
          Please wait for staff or admin to review your KYC information.
        </p>

        {email && (
          <div className="px-4 py-3 mt-4 text-sm rounded-lg bg-slate-50 text-slate-600">
            Registered email:{" "}
            <span className="font-medium text-slate-900">{email}</span>
          </div>
        )}

        <div className="px-4 py-3 mt-6 text-sm text-left text-blue-700 rounded-lg bg-blue-50">
          <p className="mt-1">
            After your KYC is approved, you can login and view your account
            number and balance.
          </p>
        </div>

        <div className="flex justify-center gap-3 mt-8">
          <Link
            to="/login"
            className="px-5 py-2 text-white bg-blue-700 rounded-lg hover:bg-blue-800"
          >
            Go to Login
          </Link>

          <Link
            to="/customer/register"
            className="px-5 py-2 border rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Register Another
          </Link>
        </div>
      </div>
    </div>
  );
}