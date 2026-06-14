import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../services/api";

export default function ConfigurationPage() {
  const { service } = useParams();
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [fields, setFields] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visibleFields, setVisibleFields] = useState({});

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
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <div className="relative">
                <input
                  type={visibleFields[field.key] ? "text" : "password"}
                  value={field.value}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={`Enter ${field.label}`}
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
          ))}
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

      {/* Last Updated Info */}
      {config.updatedAt && (
        <p className="mt-4 text-xs text-gray-400 text-right">
          Last updated: {new Date(config.updatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
