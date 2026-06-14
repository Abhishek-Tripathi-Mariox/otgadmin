import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Lock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import {
  resetPassword,
  clearError,
  clearMessage,
} from "../../store/slices/authSlice";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.auth);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Handle success message
  useEffect(() => {
    if (message && message.includes("reset")) {
      toast.success(message);
      setSuccess(true);
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

    // Validation
    if (!password) {
      setValidationError("Password is required");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    setValidationError("");

    dispatch(resetPassword({ token, newPassword: password }));
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md p-8 text-center bg-white border border-gray-200 shadow-xl rounded-2xl">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Password Updated!
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            Your password has been successfully reset. You can now login with
            your new password.
          </p>
          <Link
            to="/login"
            className="inline-block w-full py-3 font-semibold text-white transition-all duration-300 rounded-lg shadow-lg bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 hover:shadow-xl"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 shadow-xl rounded-2xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full">
            <Lock size={32} className="text-orange-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Reset Password
          </h2>
          <p className="text-sm text-gray-500">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setValidationError("");
              }}
              className="w-full px-4 py-3 transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
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

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-orange-500 hover:text-orange-600"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
