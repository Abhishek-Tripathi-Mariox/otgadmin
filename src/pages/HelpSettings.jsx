import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Save,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getHelpSettings,
  saveHelpSettings,
  clearError,
  clearMessage,
} from "../store/slices/helpSettingsSlice";

const normalizeMobile = (m) =>
  String(m || "").replace(/^\+91/, "").replace(/\s+/g, "").trim();

export default function HelpSettings() {
  const dispatch = useDispatch();
  const { settings, loading, saving, error, message } = useSelector(
    (s) => s.helpSettings,
  );

  const [form, setForm] = useState({
    address: "",
    mobile: "",
    email: "",
    whatsappNumber: "",
  });

  useEffect(() => {
    dispatch(getHelpSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setForm({
        address: settings.address || "",
        mobile: settings.mobile || "",
        email: settings.email || "",
        whatsappNumber: settings.whatsappNumber || "",
      });
    }
  }, [settings]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [message, error, dispatch]);

  const handleSave = async () => {
    if (form.mobile) {
      const m = normalizeMobile(form.mobile);
      if (!/^[6-9]\d{9}$/.test(m)) {
        toast.error("Mobile must be a valid 10-digit number");
        return;
      }
    }
    if (form.whatsappNumber) {
      const w = normalizeMobile(form.whatsappNumber);
      if (!/^[6-9]\d{9}$/.test(w)) {
        toast.error("WhatsApp must be a valid 10-digit number");
        return;
      }
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("Enter a valid email");
      return;
    }
    await dispatch(saveHelpSettings(form));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help & Contact</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the contact information shown on the customer app's Help
          screen. <strong>Leave a field blank to hide it</strong> in the
          customer app.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
        <p className="text-xs text-blue-900">
          Customers see only the fields you fill in here. Empty fields are
          hidden — so if you don't want to publish an email, just leave it
          blank.
        </p>
      </div>

      {loading && !settings ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="bg-white border rounded-xl p-6 space-y-5">
          <FieldBlock
            icon={<MapPin size={18} className="text-orange-600" />}
            label="Address"
            hint="Office or business address shown to customers."
          >
            <textarea
              rows={3}
              className="input-field"
              placeholder="e.g. 4th Floor, Tower B, Sector 62, Noida, UP 201309"
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />
          </FieldBlock>

          <FieldBlock
            icon={<Phone size={18} className="text-orange-600" />}
            label="Contact Number"
            hint="10-digit mobile shown on the Help screen."
          >
            <input
              className="input-field"
              maxLength={10}
              placeholder="9XXXXXXXXX"
              value={form.mobile}
              onChange={(e) =>
                setForm({
                  ...form,
                  mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
            />
          </FieldBlock>

          <FieldBlock
            icon={<Mail size={18} className="text-orange-600" />}
            label="Email"
            hint="Support email visible to customers."
          >
            <input
              type="email"
              className="input-field"
              placeholder="support@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FieldBlock>

          <FieldBlock
            icon={<MessageCircle size={18} className="text-orange-600" />}
            label="WhatsApp Number"
            hint="Used by the 'Need Help? WhatsApp' button."
          >
            <input
              className="input-field"
              maxLength={10}
              placeholder="9XXXXXXXXX"
              value={form.whatsappNumber}
              onChange={(e) =>
                setForm({
                  ...form,
                  whatsappNumber: e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10),
                })
              }
            />
          </FieldBlock>

          <div className="flex justify-end pt-2 border-t">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldBlock({ icon, label, hint, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-400">(optional)</span>
      </div>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
      {children}
    </div>
  );
}
