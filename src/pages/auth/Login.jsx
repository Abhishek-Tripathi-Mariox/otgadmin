import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, LogIn } from "lucide-react";
import logo from "../../assessts/logo.png";
import toast from "react-hot-toast";
import Input from "../../components/ui/Input";
import { login, clearError, clearMessage } from "../../store/slices/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, message, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  // Handle auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      toast.success(message || "Login successful!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    }
  }, [isAuthenticated, message, navigate]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    dispatch(login({ email: formData.email, password: formData.password }));
  };

  return (
    <div className="flex flex-col min-h-screen lg:flex-row">
      {/* LEFT SECTION */}
      <div className="flex items-center justify-center order-2 w-full p-8 lg:w-3/5 bg-gradient-to-br from-orange-400 to-orange-500 lg:order-1">
        <div className="max-w-2xl text-center text-white">
          <div className="inline-block mb-8">
            <div className="flex items-center justify-center w-24 h-24 overflow-hidden border rounded-full bg-white/20 backdrop-blur-md border-white/30">
              <img
                src={logo}
                alt="OTG Logo"
                className="object-contain w-16 h-16"
              />
            </div>
          </div>

          <h1 className="mb-4 text-4xl font-bold lg:text-5xl">
            OTG Admin Panel
          </h1>

          <p className="text-lg text-white/90">
            Manage vendors, materials, bookings and transactions efficiently
          </p>

          <div className="w-24 h-1 mx-auto mt-8 rounded-full bg-white/40" />
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center justify-center order-1 w-full p-6 lg:w-2/5 bg-gray-50 lg:p-12 lg:order-2">
        <div className="w-full max-w-sm">
          <div className="p-8 bg-white border border-gray-200 shadow-xl rounded-2xl">
            {/* Header */}
            <div className="mb-8">
              <h2 className="mb-2 text-3xl font-bold text-gray-900">
                Admin Login
              </h2>
              <p className="text-sm text-gray-500">
                Sign in to continue to your account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="admin@otg.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={<Mail size={18} />}
              />

              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                icon={<Lock size={18} />}
              />

              {/* Options */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border-gray-300 rounded accent-orange-400"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Remember me
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-orange-400 hover:text-orange-500"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-6 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                <LogIn size={20} />
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

          </div>

          {/* Footer */}
          <p className="mt-6 text-xs text-center text-gray-500">
            © 2024 OTG. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
