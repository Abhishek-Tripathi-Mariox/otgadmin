import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  UserPlus,
  Search,
  Check,
  X,
  Trash2,
  Mail,
  Phone,
  Store,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Edit2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getSellerRequests,
  getSellerRequestCounts,
  approveSellerRequest,
  rejectSellerRequest,
  updateSellerRequest,
  deleteSellerRequest,
  clearError,
  clearMessage,
} from "../store/slices/sellerRequestSlice";

const STATUS_TABS = [
  { key: "pending", label: "Pending", icon: Clock, color: "text-yellow-600" },
  {
    key: "approved",
    label: "Approved",
    icon: CheckCircle2,
    color: "text-green-600",
  },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "text-red-600" },
];

export default function NewSellerRequests() {
  const dispatch = useDispatch();
  const { requests, counts, loading, error, message } = useSelector(
    (s) => s.sellerRequests,
  );

  const [statusTab, setStatusTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [rejectModal, setRejectModal] = useState(null); // { id }
  const [rejectReason, setRejectReason] = useState("");
  const [detailRequest, setDetailRequest] = useState(null);
  const [editRequest, setEditRequest] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    dispatch(getSellerRequestCounts());
  }, [dispatch]);

  useEffect(() => {
    const params = { status: statusTab, page: 1, limit: 50 };
    if (search) params.search = search;
    dispatch(getSellerRequests(params));
  }, [dispatch, statusTab, search]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
      dispatch(getSellerRequestCounts());
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [message, error, dispatch]);

  const handleApprove = async (id) => {
    if (!confirm("Approve this seller request?")) return;
    await dispatch(approveSellerRequest(id));
  };

  const openReject = (id) => {
    setRejectReason("");
    setRejectModal({ id });
  };

  const submitReject = async () => {
    if (!rejectModal) return;
    await dispatch(
      rejectSellerRequest({ id: rejectModal.id, reason: rejectReason }),
    );
    setRejectModal(null);
    setRejectReason("");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this seller request permanently?")) return;
    await dispatch(deleteSellerRequest(id));
  };

  const openEdit = (req) => {
    setEditRequest(req);
    setEditForm({
      name: req.name || "",
      mobile: req.mobile || "",
      email: req.email || "",
      message: req.message || "",
      business: {
        name: req.business?.name || "",
        gstNumber: req.business?.gstNumber || "",
        panNumber: req.business?.panNumber || "",
        address: req.business?.address || "",
        city: req.business?.city || "",
        state: req.business?.state || "",
        pincode: req.business?.pincode || "",
      },
    });
  };

  const closeEdit = () => {
    setEditRequest(null);
    setEditForm(null);
  };

  const submitEdit = async () => {
    if (!editRequest || !editForm) return;
    if (!editForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(editForm.mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    if (!editForm.business.name.trim()) {
      toast.error("Business name is required");
      return;
    }
    try {
      setSavingEdit(true);
      await dispatch(
        updateSellerRequest({ id: editRequest._id, data: editForm }),
      ).unwrap();
      closeEdit();
    } catch {
      // error toast handled by effect
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Sellers Requests
          </h1>
          <p className="text-sm text-gray-500">
            Customer requests to become a vendor
          </p>
        </div>
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
            placeholder="Search by name, mobile, business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* LIST */}
      {loading && requests.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">
                  Applicant
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Contact
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Business
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
              {requests.map((req) => (
                <tr
                  key={req._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <UserPlus size={18} className="text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {req.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {req.business?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone size={14} />
                      {req.mobile}
                    </div>
                    {req.email && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Mail size={12} />
                        {req.email}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Store size={14} />
                      {req.business?.name}
                    </div>
                    {(req.business?.city || req.business?.state) && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin size={12} />
                        {[req.business?.city, req.business?.state]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        req.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : req.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <button
                        onClick={() => setDetailRequest(req)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                        title="View Details"
                      >
                        <Eye size={16} /> Details
                      </button>
                      <button
                        onClick={() => openEdit(req)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm"
                        title="Edit"
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                      {req.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(req._id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                            title="Approve"
                          >
                            <Check size={16} /> Approve
                          </button>
                          <button
                            onClick={() => openReject(req._id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                            title="Reject"
                          >
                            <X size={16} /> Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(req._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && requests.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-gray-500 py-20"
                  >
                    No {statusTab} seller requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Reject Seller Request</h2>
              <button
                onClick={() => setRejectModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (optional)
            </label>
            <textarea
              className="input-field"
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Why is this request being rejected?"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setRejectModal(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={submitReject} className="btn-primary">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editRequest && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Seller Request</h2>
              <button
                onClick={closeEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Applicant */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Applicant
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="input-field"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="input-field"
                      maxLength={10}
                      value={editForm.mobile}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Business */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Business
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="input-field"
                      value={editForm.business.name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          business: {
                            ...editForm.business,
                            name: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GST Number
                    </label>
                    <input
                      className="input-field uppercase"
                      maxLength={15}
                      value={editForm.business.gstNumber}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          business: {
                            ...editForm.business,
                            gstNumber: e.target.value.toUpperCase().slice(0, 15),
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Number
                    </label>
                    <input
                      className="input-field uppercase"
                      maxLength={10}
                      value={editForm.business.panNumber}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          business: {
                            ...editForm.business,
                            panNumber: e.target.value.toUpperCase().slice(0, 10),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      className="input-field"
                      value={editForm.business.address}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          business: {
                            ...editForm.business,
                            address: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      className="input-field"
                      value={editForm.business.city}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          business: {
                            ...editForm.business,
                            city: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      className="input-field"
                      value={editForm.business.state}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          business: {
                            ...editForm.business,
                            state: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      className="input-field"
                      maxLength={6}
                      value={editForm.business.pincode}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          business: {
                            ...editForm.business,
                            pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={3}
                  className="input-field"
                  value={editForm.message}
                  onChange={(e) =>
                    setEditForm({ ...editForm, message: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="btn-secondary"
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitEdit}
                  className="btn-primary"
                  disabled={savingEdit}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Seller Request Details</h2>
              <button
                onClick={() => setDetailRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <Section title="Applicant">
                <Row label="Name" value={detailRequest.name} />
                <Row label="Mobile" value={detailRequest.mobile} />
                <Row label="Email" value={detailRequest.email || "—"} />
                <Row
                  label="Linked User"
                  value={
                    detailRequest.user?.name
                      ? `${detailRequest.user.name} (${detailRequest.user.mobile || ""})`
                      : "Guest"
                  }
                />
              </Section>

              <Section title="Business">
                <Row label="Business Name" value={detailRequest.business?.name} />
                <Row
                  label="GST"
                  value={detailRequest.business?.gstNumber || "—"}
                />
                <Row
                  label="PAN"
                  value={detailRequest.business?.panNumber || "—"}
                />
                <Row
                  label="Address"
                  value={detailRequest.business?.address || "—"}
                />
                <Row label="City" value={detailRequest.business?.city || "—"} />
                <Row
                  label="State"
                  value={detailRequest.business?.state || "—"}
                />
                <Row
                  label="Pincode"
                  value={detailRequest.business?.pincode || "—"}
                />
              </Section>

              {detailRequest.message && (
                <Section title="Message">
                  <p className="text-sm text-gray-600">
                    {detailRequest.message}
                  </p>
                </Section>
              )}

              <Section title="Status">
                <Row label="Status" value={detailRequest.status} />
                {detailRequest.rejectionReason && (
                  <Row
                    label="Rejection Reason"
                    value={detailRequest.rejectionReason}
                  />
                )}
                {detailRequest.reviewedBy?.name && (
                  <Row
                    label="Reviewed By"
                    value={detailRequest.reviewedBy.name}
                  />
                )}
                {detailRequest.reviewedAt && (
                  <Row
                    label="Reviewed At"
                    value={new Date(detailRequest.reviewedAt).toLocaleString()}
                  />
                )}
                <Row
                  label="Submitted"
                  value={new Date(detailRequest.createdAt).toLocaleString()}
                />
              </Section>
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
