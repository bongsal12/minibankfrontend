import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const initialForm = {
  full_name: "",
  gender: "",
  date_of_birth: "",
  email: "",
  password: "",
  password_confirmation: "",
  phone: "",
  national_id: "",
  address: "",
  city: "",
  occupation: "",
  monthly_income: "",
  document_type: "national_id",
  document_number: "",
  front_image: null,
  back_image: null,
  selfie_image: null,
};
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

const maxImageSize = 2 * 1024 * 1024;

const validateImageFile = (file, label) => {
  if (!file) {
    return `${label} is required.`;
  }

  if (!allowedImageTypes.includes(file.type)) {
    return `${label} must be JPG, PNG, or WEBP.`;
  }

  if (file.size > maxImageSize) {
    return `${label} must be less than 2MB.`;
  }

  return null;
};

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

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

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setForm({
        ...form,
        [name]: files[0] || null,
      });
      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    clearErrors();

    const imageErrors = [
      validateImageFile(form.front_image, "Front image"),
      validateImageFile(form.back_image, "Back image"),
      validateImageFile(form.selfie_image, "Selfie image"),
    ].filter(Boolean);

    if (imageErrors.length > 0) {
      setError("Please upload valid KYC images");
      setValidationErrors(imageErrors);
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      await api.post("/customer/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/customer/pending", {
        state: {
          email: form.email,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setValidationErrors(getValidationErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            MiniBank Customer Registration
          </h1>
          <p className="mt-2 text-slate-500">
            Submit your information and wait for KYC approval.
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

        <form
          onSubmit={handleSubmit}
          className="p-6 bg-white border shadow-sm rounded-2xl"
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Personal Information
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Dara Customer"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
                Date of Birth
              </label>
              <input
                name="date_of_birth"
                type="date"
                value={form.date_of_birth}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
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
                placeholder="customer@gmail.com"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                National ID
              </label>
              <input
                name="national_id"
                value={form.national_id}
                onChange={handleChange}
                placeholder="123456789"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
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
                placeholder="Enter password"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <input
                name="password_confirmation"
                type="password"
                value={form.password_confirmation}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
                rows="3"
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
                Occupation
              </label>
              <input
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                placeholder="Student"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Monthly Income
              </label>
              <input
                name="monthly_income"
                type="number"
                value={form.monthly_income}
                onChange={handleChange}
                placeholder="500"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="my-6 border-t"></div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              KYC Document
            </h2>
            <p className="text-sm text-slate-500">
              Upload document information for verification.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Document Type
              </label>
              <select
                name="document_type"
                value={form.document_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="national_id">National ID</option>
                <option value="passport">Passport</option>
                <option value="driver_license">Driver License</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Document Number
              </label>
              <input
                name="document_number"
                value={form.document_number}
                onChange={handleChange}
                placeholder="123456789"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Front Image
              </label>
              <input
                name="front_image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Back Image
              </label>
              <input
                name="back_image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Selfie Image
              </label>
              <input
                name="selfie_image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="px-5 py-2 border rounded-lg cursor-pointer text-slate-700 hover:bg-slate-50 "
            >
              Back to Login
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-white bg-blue-700 rounded-lg cursor-pointer hover:bg-blue-800 disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
