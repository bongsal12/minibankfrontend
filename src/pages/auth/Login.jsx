import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "admin@minibank.com",
    password: "12345678",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (res.data.user.role === "staff") {
        navigate("/staff/dashboard");
      } else {
        navigate("/customer/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-7xl h-[90vh] lg:h-[85vh] bg-white shadow-2xl rounded-3xl overflow-hidden">
        <div className="relative items-center justify-center hidden lg:flex bg-slate-900">
          <div className="w-full h-full overflow-hidden">
            <img
              src="/auth/login.webp"
              alt="Login Illustration"
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        <div className="flex items-center justify-center p-6 bg-blue-100">
          <form onSubmit={handleLogin} className="w-full max-w-md">
            <h2 className="mb-2 text-3xl font-bold text-center text-blue-900">
              Welcome Back
            </h2>
            <p className="mb-8 font-bold text-center text-blue-900">
              Login to access MiniBank dashboard.
            </p>

            {error && (
              <div className="px-4 py-3 mb-6 text-sm text-red-600 rounded-lg bg-red-50">
                {error}
              </div>
            )}

            <div className="mb-5">
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border outline-none border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="admin@minibank.com"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border outline-none border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute -translate-y-1/2 cursor-pointer right-4 top-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-xl py-3.5 font-semibold disabled:opacity-70 transition cursor-pointer"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <div className="mt-4 text-sm text-center text-slate-500">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/customer/register")}
                className="font-medium text-blue-700 cursor-pointer hover:underline"
              >
                Register now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
