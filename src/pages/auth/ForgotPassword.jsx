import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import {
  forgotPassword,
  clearError,
  clearMessage,
} from "../../store/slices/authSlice";

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle success message
  useEffect(() => {
    if (message) {
      setSuccessMessage(message);
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [message, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!email) {
      setValidationError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError("Enter a valid email");
      return;
    }

    setValidationError("");
    setSuccessMessage("");

    dispatch(forgotPassword(email));
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 shadow-xl rounded-2xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full">
            <Mail size={32} className="text-orange-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Forgot Password
          </h2>
          <p className="text-sm text-gray-500">
            Enter your registered email address and we'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setValidationError("");
              }}
              className="w-full px-4 py-3 transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>

          {validationError && (
            <div className="p-3 border border-red-200 rounded-lg bg-red-50">
              <p className="text-sm text-red-600">{validationError}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3 border border-green-200 rounded-lg bg-green-50">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-orange-500 hover:text-orange-600"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
