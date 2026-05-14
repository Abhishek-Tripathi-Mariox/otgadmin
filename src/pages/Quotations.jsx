import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileText,
  Search,
  Eye,
  Send,
  Trash2,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Hourglass,
  X,
  IndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getQuotations,
  getQuotationCounts,
  respondToQuotation,
  updateQuotationStatus,
  assignVendorToQuotation,
  deleteQuotation,
  clearError,
  clearMessage,
} from "../store/slices/quotationSlice";
import { getVendors } from "../store/slices/vendorSlice";

const STATUS_TABS = [
  { key: "new", label: "New", icon: Clock, color: "text-blue-600" },
  { key: "quoted", label: "Quoted", icon: Send, color: "text-orange-600" },
  {
    key: "accepted",
    label: "Accepted",
    icon: CheckCircle2,
    color: "text-green-600",
  },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "text-red-600" },
  { key: "expired", label: "Expired", icon: Hourglass, color: "text-gray-500" },
];

const statusPillClass = (status) => {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-700";
    case "quoted":
      return "bg-orange-100 text-orange-700";
    case "accepted":
      return "bg-green-100 text-green-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "expired":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function Quotations() {
  const dispatch = useDispatch();
  const { quotations, counts, loading, error, message } = useSelector(
    (s) => s.quotations,
  );
  const { vendors } = useSelector((s) => s.vendors);

  const [statusTab, setStatusTab] = useState("new");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [respondModal, setRespondModal] = useState(null); // quotation
  const [respondForm, setRespondForm] = useState({
    quotedPrice: "",
    quotedValidTill: "",
    adminNotes: "",
  });
  const [savingResponse, setSavingResponse] = useState(false);
  const [vendorPick, setVendorPick] = useState("");
  const [assigningVendor, setAssigningVendor] = useState(false);

  // Load vendors once for the assignment picker
  useEffect(() => {
    dispatch(getVendors({ page: 1, limit: 200 }));
  }, [dispatch]);

  // Sync local vendor pick when the detail modal opens / changes
  useEffect(() => {
    setVendorPick(detail?.assignedVendor?._id || "");
  }, [detail?._id]);

  const handleAssignVendor = async () => {
    if (!detail?._id) return;
    try {
      setAssigningVendor(true);
      const res = await dispatch(
        assignVendorToQuotation({
          id: detail._id,
          vendorId: vendorPick || null,
        }),
      ).unwrap();
      if (res?.data) setDetail(res.data);
    } catch {
      // toast via redux error
    } finally {
      setAssigningVendor(false);
    }
  };

  useEffect(() => {
    dispatch(getQuotationCounts());
  }, [dispatch]);

  useEffect(() => {
    const params = { status: statusTab, page: 1, limit: 50 };
    if (search) params.search = search;
    dispatch(getQuotations(params));
  }, [dispatch, statusTab, search]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
      dispatch(getQuotationCounts());
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [message, error, dispatch]);

  const openRespond = (q) => {
    setRespondModal(q);
    setRespondForm({
      quotedPrice: q.quotedPrice != null ? String(q.quotedPrice) : "",
      quotedValidTill: q.quotedValidTill
        ? new Date(q.quotedValidTill).toISOString().slice(0, 10)
        : "",
      adminNotes: q.adminNotes || "",
    });
  };

  const submitRespond = async () => {
    if (!respondModal) return;
    if (
      respondForm.quotedPrice !== "" &&
      Number.isNaN(Number(respondForm.quotedPrice))
    ) {
      toast.error("Quoted price must be a number");
      return;
    }
    try {
      setSavingResponse(true);
      await dispatch(
        respondToQuotation({
          id: respondModal._id,
          data: {
            quotedPrice:
              respondForm.quotedPrice === ""
                ? undefined
                : Number(respondForm.quotedPrice),
            quotedValidTill: respondForm.quotedValidTill || undefined,
            adminNotes: respondForm.adminNotes || undefined,
          },
        }),
      ).unwrap();
      setRespondModal(null);
    } catch {
      // toast handled by effect
    } finally {
      setSavingResponse(false);
    }
  };

  const setStatus = (id, status) => {
    if (!confirm(`Mark this quotation as "${status}"?`)) return;
    dispatch(updateQuotationStatus({ id, status }));
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this quotation permanently?")) return;
    await dispatch(deleteQuotation(id));
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
        <p className="text-sm text-gray-500 mt-1">
          Customer quotation requests from the mobile app. Send back prices,
          notes and track status.
        </p>
      </div>

      {/* TABS */}
      <div className="bg-white border rounded-xl p-2 flex gap-2 flex-wrap">
        {STATUS_TABS.map((t) => {
          const Icon = t.icon;
          const active = statusTab === t.key;
          const count = counts?.[t.key] ?? 0;
          return (
            <button
              key={t.key}
              onClick={() => setStatusTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                active
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={16} className={active ? "text-white" : t.color} />
              {t.label}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SEARCH */}
      <div className="bg-white border rounded-xl p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by code, name, mobile, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* TABLE */}
      {loading && quotations.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">
                  Code / Customer
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Contact
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Requirement
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Submitted
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-right p-4 font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr key={q._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <FileText size={18} className="text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {q.quotationCode || "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {q.name}
                          {q.company ? ` · ${q.company}` : ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone size={14} />
                      {q.mobile}
                    </div>
                    {q.email && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Mail size={12} />
                        {q.email}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {Array.isArray(q.items) && q.items.length > 0 ? (
                      <div className="space-y-1">
                        {q.items.slice(0, 2).map((it, idx) => (
                          <div key={idx} className="text-sm text-gray-700">
                            <span className="font-medium">
                              {it.materialName ||
                                it.subCategoryName ||
                                it.categoryName ||
                                "Item"}
                            </span>
                            {it.quantity || it.unit ? (
                              <span className="text-xs text-gray-500 ml-1">
                                · {it.quantity || "?"} {it.unit || ""}
                              </span>
                            ) : null}
                          </div>
                        ))}
                        {q.items.length > 2 && (
                          <div className="text-xs text-gray-400">
                            +{q.items.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700">
                          {q.category || "—"}
                        </div>
                        {(q.quantity || q.unit) && (
                          <div className="text-xs text-gray-500 mt-1">
                            Qty: {q.quantity || "?"} {q.unit || ""}
                          </div>
                        )}
                      </>
                    )}
                    {q.quotedPrice != null && (
                      <div className="text-xs text-orange-600 font-medium mt-1 flex items-center gap-0.5">
                        <IndianRupee size={11} />
                        {q.quotedPrice.toLocaleString("en-IN")}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${statusPillClass(
                        q.status,
                      )}`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <button
                        onClick={() => setDetail(q)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                        title="View"
                      >
                        <Eye size={16} /> Details
                      </button>
                      {q.status !== "accepted" && q.status !== "rejected" && (
                        <button
                          onClick={() => openRespond(q)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm"
                          title="Send Quote"
                        >
                          <Send size={16} />{" "}
                          {q.status === "quoted" ? "Update" : "Send Quote"}
                        </button>
                      )}
                      {q.status === "quoted" && (
                        <>
                          <button
                            onClick={() => setStatus(q._id, "accepted")}
                            className="px-2 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                          >
                            Accepted
                          </button>
                          <button
                            onClick={() => setStatus(q._id, "rejected")}
                            className="px-2 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                          >
                            Rejected
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(q._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && quotations.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-20">
                    No {statusTab} quotations
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Quotation {detail.quotationCode}
              </h2>
              <button
                onClick={() => setDetail(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <Section title="Customer">
                <Row label="Type" value={detail.customerType} />
                <Row label="Name" value={detail.name} />
                <Row label="Mobile" value={detail.mobile} />
                <Row label="Email" value={detail.email || "—"} />
                <Row label="Company" value={detail.company || "—"} />
                <Row label="Address" value={detail.address || "—"} />
                <Row label="Landmark" value={detail.landmark || "—"} />
                <Row
                  label="Linked User"
                  value={
                    detail.user?.name
                      ? `${detail.user.name} (${detail.user.mobile || ""})`
                      : "Guest"
                  }
                />
              </Section>

              <Section title="Requirement">
                {Array.isArray(detail.items) && detail.items.length > 0 ? (
                  <div className="space-y-3">
                    {detail.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-3 bg-gray-50"
                      >
                        <div className="text-xs text-gray-500 mb-1">
                          Item #{idx + 1}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {it.materialName ||
                            it.subCategoryName ||
                            it.categoryName ||
                            "—"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {it.categoryName}
                          {it.subCategoryName ? ` › ${it.subCategoryName}` : ""}
                          {it.materialName ? ` › ${it.materialName}` : ""}
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          Qty:{" "}
                          <span className="font-medium">
                            {it.quantity || "?"} {it.unit || ""}
                          </span>
                        </div>
                        {it.note && (
                          <div className="text-xs text-gray-600 mt-1">
                            Note: {it.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <Row label="Category" value={detail.category || "—"} />
                    <Row label="Quantity" value={detail.quantity || "—"} />
                    <Row label="Unit" value={detail.unit || "—"} />
                  </>
                )}
                {detail.materialRequirement && (
                  <Row
                    label="Material Notes"
                    value={detail.materialRequirement}
                  />
                )}
              </Section>

              <Section title="Quotation">
                <Row label="Status" value={detail.status} />
                <Row
                  label="Quoted Price"
                  value={
                    detail.quotedPrice != null
                      ? `₹ ${Number(detail.quotedPrice).toLocaleString("en-IN")}`
                      : "—"
                  }
                />
                <Row
                  label="Valid Till"
                  value={
                    detail.quotedValidTill
                      ? new Date(detail.quotedValidTill).toLocaleDateString()
                      : "—"
                  }
                />
                <Row label="Admin Notes" value={detail.adminNotes || "—"} />
                {detail.respondedBy?.name && (
                  <Row
                    label="Responded By"
                    value={detail.respondedBy.name}
                  />
                )}
                {detail.respondedAt && (
                  <Row
                    label="Responded At"
                    value={new Date(detail.respondedAt).toLocaleString()}
                  />
                )}
                <Row
                  label="Submitted"
                  value={new Date(detail.createdAt).toLocaleString()}
                />
              </Section>

              {/* Assigned Vendor */}
              <Section title="Vendor Assignment">
                <Row
                  label="Currently Assigned"
                  value={
                    detail.assignedVendor?.name
                      ? `${detail.assignedVendor.name}${
                          detail.assignedVendor.mobile
                            ? ` (${detail.assignedVendor.mobile})`
                            : ""
                        }`
                      : "Not assigned"
                  }
                />
                {detail.assignedVendor?.business?.city && (
                  <Row
                    label="Vendor City"
                    value={detail.assignedVendor.business.city}
                  />
                )}
                {detail.assignedAt && (
                  <Row
                    label="Assigned At"
                    value={new Date(detail.assignedAt).toLocaleString()}
                  />
                )}

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <label className="block text-xs text-gray-500 mb-1">
                    {detail.assignedVendor ? "Change vendor" : "Assign vendor"}
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="input-field flex-1 text-sm"
                      value={vendorPick}
                      onChange={(e) => setVendorPick(e.target.value)}
                    >
                      <option value="">-- Unassigned --</option>
                      {vendors.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.name}
                          {v.business?.city ? ` · ${v.business.city}` : ""}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignVendor}
                      disabled={
                        assigningVendor ||
                        vendorPick === (detail.assignedVendor?._id || "")
                      }
                      className="btn-primary text-sm"
                    >
                      {assigningVendor ? "Saving..." : "Save"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    The assigned vendor will see this quotation in their app.
                  </p>
                </div>
              </Section>
            </div>
          </div>
        </div>
      )}

      {/* RESPOND MODAL */}
      {respondModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                Send Quote · {respondModal.quotationCode}
              </h2>
              <button
                onClick={() => setRespondModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
            </div>

            <div className="text-xs text-gray-500 mb-3">
              {respondModal.name} · {respondModal.mobile}
              {respondModal.category ? ` · ${respondModal.category}` : ""}
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quoted price (₹)
            </label>
            <input
              type="number"
              className="input-field mb-3"
              value={respondForm.quotedPrice}
              onChange={(e) =>
                setRespondForm({ ...respondForm, quotedPrice: e.target.value })
              }
              placeholder="e.g. 45000"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valid till
            </label>
            <input
              type="date"
              className="input-field mb-3"
              value={respondForm.quotedValidTill}
              onChange={(e) =>
                setRespondForm({
                  ...respondForm,
                  quotedValidTill: e.target.value,
                })
              }
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes for the customer
            </label>
            <textarea
              rows={4}
              className="input-field"
              value={respondForm.adminNotes}
              onChange={(e) =>
                setRespondForm({ ...respondForm, adminNotes: e.target.value })
              }
              placeholder="Delivery time, terms, anything the customer should know."
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setRespondModal(null)}
                className="btn-secondary"
                disabled={savingResponse}
              >
                Cancel
              </button>
              <button
                onClick={submitRespond}
                className="btn-primary"
                disabled={savingResponse}
              >
                {savingResponse ? "Sending..." : "Send Quote"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex text-sm">
      <span className="text-gray-500 w-40 flex-shrink-0">{label}</span>
      <span className="text-gray-900 break-all">{value}</span>
    </div>
  );
}
