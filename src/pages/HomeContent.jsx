import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Megaphone, Type, AlignLeft, MousePointerClick, Save, Info, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  getAppSettings,
  saveAppSettings,
  clearError,
  clearMessage,
} from "../store/slices/appSettingsSlice";

const DEFAULTS = {
  title: "Save Up to ₹15000 on Bulk Orders",
  subtitle: "Buy More, Save More on Your Projects",
  buttonText: "Get Bulk Quote",
};

const COMPANY_DEFAULTS = {
  name: "",
  gstin: "",
  pan: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  bankAccountNumber: "",
  bankIfsc: "",
  bankName: "",
};

export default function HomeContent() {
  const dispatch = useDispatch();
  const { settings, loading, saving, error, message } = useSelector(
    (s) => s.appSettings,
  );

  const [form, setForm] = useState(DEFAULTS);
  const [companyForm, setCompanyForm] = useState(COMPANY_DEFAULTS);

  useEffect(() => {
    dispatch(getAppSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings?.bulkBanner) {
      setForm({
        title: settings.bulkBanner.title ?? DEFAULTS.title,
        subtitle: settings.bulkBanner.subtitle ?? DEFAULTS.subtitle,
        buttonText: settings.bulkBanner.buttonText ?? DEFAULTS.buttonText,
      });
    }
    if (settings?.companyProfile) {
      setCompanyForm({ ...COMPANY_DEFAULTS, ...settings.companyProfile });
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
    if (!form.title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }
    if (!form.buttonText.trim()) {
      toast.error("Button text cannot be empty");
      return;
    }
    await dispatch(saveAppSettings({ bulkBanner: form }));
  };

  const handleSaveCompany = async () => {
    if (!companyForm.name.trim()) {
      toast.error("Company name cannot be empty");
      return;
    }
    await dispatch(saveAppSettings({ companyProfile: companyForm }));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Home Content</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage editable text shown on the customer app home screen.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
        <p className="text-xs text-blue-900">
          These texts control the <strong>"Get Bulk Quote" promo banner</strong>{" "}
          on the customer home screen. Changes appear in the app the next time it
          loads the home screen.
        </p>
      </div>

      {loading && !settings ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="bg-white border rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 text-gray-900 font-semibold">
            <Megaphone size={18} className="text-orange-600" />
            Bulk Quote Banner
          </div>

          {/* Live preview */}
          <div
            className="rounded-xl p-5 text-white"
            style={{
              background:
                "linear-gradient(90deg, rgba(64,64,64,0.92), rgba(64,64,64,0.6))",
            }}
          >
            <p className="text-sm font-semibold whitespace-pre-line">
              {form.title || DEFAULTS.title}
              {"\n"}
              {form.subtitle}
            </p>
            <span className="inline-block mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-800 bg-[#FDE200]">
              {form.buttonText || DEFAULTS.buttonText}
            </span>
          </div>

          <FieldBlock
            icon={<Type size={18} className="text-orange-600" />}
            label="Title (line 1)"
          >
            <input
              className="input-field"
              placeholder={DEFAULTS.title}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </FieldBlock>

          <FieldBlock
            icon={<AlignLeft size={18} className="text-orange-600" />}
            label="Subtitle (line 2)"
          >
            <input
              className="input-field"
              placeholder={DEFAULTS.subtitle}
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            />
          </FieldBlock>

          <FieldBlock
            icon={<MousePointerClick size={18} className="text-orange-600" />}
            label="Button Text"
          >
            <input
              className="input-field"
              placeholder={DEFAULTS.buttonText}
              value={form.buttonText}
              onChange={(e) =>
                setForm({ ...form, buttonText: e.target.value })
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

      {!loading && (
        <div className="bg-white border rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 text-gray-900 font-semibold">
            <Building2 size={18} className="text-orange-600" />
            Company Profile
          </div>
          <p className="text-xs text-gray-500 -mt-3">
            OTG's own legal-entity details — used as the "buyer" on the
            vendor-to-OTG back-to-back invoice generated for every delivered,
            paid order.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <CompanyField label="Company Name">
              <input
                className="input-field"
                value={companyForm.name}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, name: e.target.value })
                }
              />
            </CompanyField>
            <CompanyField label="GSTIN">
              <input
                className="input-field"
                value={companyForm.gstin}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, gstin: e.target.value })
                }
              />
            </CompanyField>
            <CompanyField label="PAN">
              <input
                className="input-field"
                value={companyForm.pan}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, pan: e.target.value })
                }
              />
            </CompanyField>
            <CompanyField label="Address">
              <input
                className="input-field"
                value={companyForm.address}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, address: e.target.value })
                }
              />
            </CompanyField>
            <CompanyField label="City">
              <input
                className="input-field"
                value={companyForm.city}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, city: e.target.value })
                }
              />
            </CompanyField>
            <CompanyField label="State">
              <input
                className="input-field"
                value={companyForm.state}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, state: e.target.value })
                }
              />
            </CompanyField>
            <CompanyField label="Pincode">
              <input
                className="input-field"
                value={companyForm.pincode}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, pincode: e.target.value })
                }
              />
            </CompanyField>
            <CompanyField label="Bank Name">
              <input
                className="input-field"
                value={companyForm.bankName}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, bankName: e.target.value })
                }
              />
            </CompanyField>
            <CompanyField label="Bank A/c Number">
              <input
                className="input-field"
                value={companyForm.bankAccountNumber}
                onChange={(e) =>
                  setCompanyForm({
                    ...companyForm,
                    bankAccountNumber: e.target.value,
                  })
                }
              />
            </CompanyField>
            <CompanyField label="IFSC Code">
              <input
                className="input-field"
                value={companyForm.bankIfsc}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, bankIfsc: e.target.value })
                }
              />
            </CompanyField>
          </div>

          <div className="flex justify-end pt-2 border-t">
            <button
              onClick={handleSaveCompany}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Company Profile"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CompanyField({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-700 mb-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}

function FieldBlock({ icon, label, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <label className="text-sm font-medium text-gray-700">{label}</label>
      </div>
      {children}
    </div>
  );
}
