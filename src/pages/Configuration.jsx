import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, EyeOff, Loader2, MessageSquare, Send, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../services/api";

// Only MSG91 is actually wired up as a send path today (see
// otpService.ts) — a dropdown keeps the admin from typing a provider name
// that isn't really supported.
const SMS_PROVIDERS = ["MSG91"];

export default function ConfigurationPage() {
  const { service } = useParams();
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [fields, setFields] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visibleFields, setVisibleFields] = useState({});

  // SMS-only: real send/verify test flow
  const [testMobile, setTestMobile] = useState("");
  const [testOtp, setTestOtp] = useState("");
  const [testSent, setTestSent] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [verifyingTest, setVerifyingTest] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [service]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/config/${service}`);
      const data = res.data.data;
      setConfig(data);
      setFields(data.fields || []);
      setIsActive(data.isActive);
    } catch (error) {
      toast.error("Failed to load configuration");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (key, value) => {
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, value } : f))
    );
  };

  const toggleVisibility = (key) => {
    setVisibleFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.put(`/config/${service}`, { fields, isActive });
      toast.success(res.data.message || "Configuration saved");
      fetchConfig();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(testMobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    try {
      setSendingTest(true);
      const res = await api.post("/config/sms/test/send", { mobile: testMobile });
      toast.success(res.data.message || "Test OTP sent");
      setTestSent(true);
      setTestOtp("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send test OTP");
    } finally {
      setSendingTest(false);
    }
  };

  const handleVerifyTestOtp = async () => {
    if (!testOtp.trim()) {
      toast.error("Enter the OTP you received");
      return;
    }
    try {
      setVerifyingTest(true);
      const res = await api.post("/config/sms/test/verify", {
        mobile: testMobile,
        otp: testOtp.trim(),
      });
      toast.success(res.data.message || "Verified");
      setTestSent(false);
      setTestOtp("");
      setTestMobile("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setVerifyingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{config.label}</h1>
          <p className="text-sm text-gray-500">
            Manage your {config.label} configuration
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        {/* Active Toggle */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-700">Enable Service</p>
            <p className="text-xs text-gray-400">
              Toggle to activate or deactivate this integration
            </p>
          </div>
          <button
            onClick={() => setIsActive(!isActive)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isActive ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                isActive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Fields */}
        <div className="p-6 space-y-4">
          <div className="flex gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
            <ShieldCheck size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800">
              Credentials are encrypted with AES-256 before storing in the
              database.
              {service === "sms" &&
                " Enter the approved MSG91 auth key, OTP template ID, and sender ID to update the configuration."}
              {service === "firebase" &&
                " Paste the full service account JSON (Firebase Console → Project Settings → Service Accounts → Generate New Private Key) to enable push notifications."}
            </p>
          </div>

          {fields.map((field) =>
            service === "sms" && field.key === "provider" ? (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <select
                  value={field.value || SMS_PROVIDERS[0]}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  {SMS_PROVIDERS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            ) : field.key === "serviceAccountJson" ? (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <textarea
                  value={field.value}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder='Paste the full JSON — { "type": "service_account", "project_id": ..., "private_key": ..., "client_email": ... }'
                  rows={8}
                  spellCheck={false}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            ) : (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type={visibleFields[field.key] ? "text" : "password"}
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder={
                      field.key === "senderId" && service === "sms"
                        ? "Enter 6-letter Sender ID (e.g., SWRNAZ)"
                        : `Enter ${field.label}`
                    }
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility(field.key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {visibleFields[field.key] ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>
            ),
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Test SMS — send a real OTP to a number and confirm it arrives */}
      {service === "sms" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mt-6">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
            <MessageSquare size={18} className="text-orange-500" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Test SMS Delivery
              </p>
              <p className="text-xs text-gray-400">
                Save your configuration above, then send a real OTP to your
                own number to confirm it works end-to-end.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                maxLength={10}
                value={testMobile}
                onChange={(e) =>
                  setTestMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                disabled={testSent}
                placeholder="Enter 10-digit mobile number"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {!testSent ? (
              <button
                onClick={handleSendTestOtp}
                disabled={sendingTest}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition"
              >
                {sendingTest ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Send Test OTP
              </button>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP Received
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={testOtp}
                    onChange={(e) =>
                      setTestOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="6-digit OTP"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleVerifyTestOtp}
                    disabled={verifyingTest}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                  >
                    {verifyingTest ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ShieldCheck size={16} />
                    )}
                    Verify OTP
                  </button>
                  <button
                    onClick={() => {
                      setTestSent(false);
                      setTestOtp("");
                    }}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Resend / Change Number
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Last Updated Info */}
      {config.updatedAt && (
        <p className="mt-4 text-xs text-gray-400 text-right">
          Last updated: {new Date(config.updatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
