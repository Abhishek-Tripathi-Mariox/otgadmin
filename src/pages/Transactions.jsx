import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CreditCard,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getTransactions,
  getTransactionStats,
  createTransaction,
  deleteTransaction,
  updateTransactionStatus,
  clearError,
  clearMessage,
} from "../store/slices/transactionSlice";

const STATUS_CONFIG = {
  settled: {
    label: "Settled",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-700",
    icon: RefreshCw,
  },
  failed: {
    label: "Failed",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

const MODE_LABELS = {
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  neft: "NEFT",
  rtgs: "RTGS",
  cash: "Cash",
  card: "Card",
  wallet: "Wallet",
  other: "Other",
};

const formatCurrency = (amt) =>
  `₹${Number(amt || 0).toLocaleString("en-IN")}`;
const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const userLabel = (t) =>
  t.user?.name || t.user?.mobile || (t.user ? "Customer" : "—");
const vendorLabel = (t) =>
  t.vendor?.business?.name || t.vendor?.name || "—";
const materialLabel = (t) => t.material?.name || "—";
const bookingLabel = (t) => t.booking?.bookingId || "—";

export default function Transactions() {
  const dispatch = useDispatch();
  const {
    transactions,
    stats,
    loading,
    saving,
    error,
    message,
    pagination,
  } = useSelector((s) => s.transactions);

  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    bookingId: "",
    amount: "",
    mode: "upi",
    type: "payment",
    status: "settled",
    reference: "",
    description: "",
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    mode: "",
    type: "",
    fromDate: "",
    toDate: "",
  });

  const buildParams = () => {
    const params = { page: 1, limit: 50 };
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.mode) params.mode = filters.mode;
    if (filters.type) params.type = filters.type;
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    return params;
  };

  useEffect(() => {
    const params = buildParams();
    dispatch(getTransactions(params));
    dispatch(getTransactionStats(params));
  }, [dispatch, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
      const params = buildParams();
      dispatch(getTransactionStats(params));
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [message, error, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearFilters = () =>
    setFilters({
      search: "",
      status: "",
      mode: "",
      type: "",
      fromDate: "",
      toDate: "",
    });

  const submitCreate = async () => {
    if (!createForm.amount || Number.isNaN(Number(createForm.amount))) {
      toast.error("Enter a valid amount");
      return;
    }
    await dispatch(createTransaction(createForm));
    setShowCreate(false);
    setCreateForm({
      bookingId: "",
      amount: "",
      mode: "upi",
      type: "payment",
      status: "settled",
      reference: "",
      description: "",
    });
  };

  const handleStatus = async (id, status) => {
    if (!confirm(`Mark this transaction as "${status}"?`)) return;
    await dispatch(updateTransactionStatus({ id, status }));
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this transaction permanently?")) return;
    await dispatch(deleteTransaction(id));
    if (selectedTxn?._id === id) setSelectedTxn(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500">
            Payments, refunds and vendor settlements
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Record Transaction
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Settled"
          value={formatCurrency(stats.settled)}
          icon={<ArrowUpRight size={20} />}
          color="green"
        />
        <StatCard
          label="Pending / Processing"
          value={formatCurrency(stats.pending)}
          icon={<Clock size={20} />}
          color="yellow"
        />
        <StatCard
          label="Refunds"
          value={formatCurrency(stats.refunds)}
          icon={<ArrowDownRight size={20} />}
          color="blue"
        />
        <StatCard
          label="Failed"
          value={formatCurrency(stats.failed)}
          icon={<XCircle size={20} />}
          color="red"
        />
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded-xl p-4">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 text-gray-700 font-medium"
        >
          <Filter size={18} /> Filters
          {isFilterOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {isFilterOpen && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative lg:col-span-2">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by code, reference, description..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="input-field pl-10"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="settled">Settled</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={filters.mode}
              onChange={(e) =>
                setFilters({ ...filters, mode: e.target.value })
              }
              className="input-field"
            >
              <option value="">All Modes</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="neft">NEFT</option>
              <option value="rtgs">RTGS</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="wallet">Wallet</option>
              <option value="other">Other</option>
            </select>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value })
              }
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="payment">Payment</option>
              <option value="refund">Refund</option>
              <option value="settlement">Settlement</option>
            </select>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters({ ...filters, fromDate: e.target.value })
              }
              className="input-field"
            />
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
              className="input-field"
            />
            <button
              onClick={clearFilters}
              className="btn-secondary flex items-center gap-2"
            >
              <X size={16} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        {loading && transactions.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-4 text-left">Transaction</th>
                  <th className="p-4 text-left">User / Vendor</th>
                  <th className="p-4 text-left">Material</th>
                  <th className="p-4 text-left">Mode</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Type</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-8 text-center text-gray-500"
                    >
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => {
                    const sc =
                      STATUS_CONFIG[t.status] || STATUS_CONFIG.pending;
                    const StatusIcon = sc.icon;
                    return (
                      <tr key={t._id} className="border-t hover:bg-gray-50">
                        <td className="p-4">
                          <p className="font-medium text-gray-900">
                            {t.transactionCode}
                          </p>
                          {t.booking?.bookingId && (
                            <p className="text-xs text-gray-500">
                              Booking: {t.booking.bookingId}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            {formatDate(t.createdAt)}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-medium text-gray-900">
                            {userLabel(t)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {vendorLabel(t)}
                          </p>
                        </td>
                        <td className="p-4 text-sm text-gray-700">
                          {materialLabel(t)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <CreditCard size={14} />
                            {MODE_LABELS[t.mode] || t.mode}
                          </div>
                        </td>
                        <td className="p-4 text-right font-semibold text-gray-900">
                          {formatCurrency(t.amount)}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              t.type === "refund"
                                ? "bg-purple-100 text-purple-700"
                                : t.type === "settlement"
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {t.type === "refund"
                              ? "Refund"
                              : t.type === "settlement"
                                ? "Settlement"
                                : "Payment"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${sc.color}`}
                          >
                            <StatusIcon size={12} /> {sc.label}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedTxn(t)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(t._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4 border-t text-sm text-gray-500">
          Showing {transactions.length} of {pagination?.total ?? 0}{" "}
          transactions
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">Record Transaction</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking ID{" "}
                  <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. BK-10021"
                  value={createForm.bookingId}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, bookingId: e.target.value })
                  }
                />
                <p className="text-xs text-gray-400 mt-1">
                  If provided, user / vendor / material are inferred from the
                  booking.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={createForm.amount}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, amount: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    className="input-field"
                    value={createForm.type}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, type: e.target.value })
                    }
                  >
                    <option value="payment">Payment</option>
                    <option value="refund">Refund</option>
                    <option value="settlement">Settlement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="input-field"
                    value={createForm.status}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, status: e.target.value })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="settled">Settled</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mode
                  </label>
                  <select
                    className="input-field"
                    value={createForm.mode}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, mode: e.target.value })
                    }
                  >
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="neft">NEFT</option>
                    <option value="rtgs">RTGS</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="wallet">Wallet</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference
                  </label>
                  <input
                    className="input-field"
                    placeholder="UPI/NEFT/RTGS ref"
                    value={createForm.reference}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        reference: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  className="input-field"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t">
                <button
                  onClick={() => setShowCreate(false)}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={submitCreate}
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Transaction Details</h2>
              <button
                onClick={() => setSelectedTxn(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(selectedTxn.amount)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedTxn.type === "refund"
                      ? "Refund"
                      : selectedTxn.type === "settlement"
                        ? "Settlement"
                        : "Payment"}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                    STATUS_CONFIG[selectedTxn.status]?.color
                  }`}
                >
                  {STATUS_CONFIG[selectedTxn.status]?.label}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <InfoRow
                  label="Transaction Code"
                  value={selectedTxn.transactionCode}
                />
                <InfoRow
                  label="Reference"
                  value={selectedTxn.reference || "—"}
                />
                <InfoRow label="Booking" value={bookingLabel(selectedTxn)} />
                <InfoRow
                  label="Date & Time"
                  value={formatDateTime(selectedTxn.createdAt)}
                />
                <InfoRow
                  label="Payment Mode"
                  value={MODE_LABELS[selectedTxn.mode] || selectedTxn.mode}
                />
                {selectedTxn.failureReason && (
                  <InfoRow
                    label="Failure Reason"
                    value={selectedTxn.failureReason}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Customer</p>
                  <p className="text-sm font-medium">
                    {userLabel(selectedTxn)}
                  </p>
                  {selectedTxn.user?.mobile && (
                    <p className="text-xs text-gray-500">
                      {selectedTxn.user.mobile}
                    </p>
                  )}
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Vendor</p>
                  <p className="text-sm font-medium">
                    {vendorLabel(selectedTxn)}
                  </p>
                </div>
              </div>

              <div className="border rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Material</p>
                <p className="text-sm font-medium">
                  {materialLabel(selectedTxn)}
                </p>
              </div>

              {selectedTxn.description && (
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm">{selectedTxn.description}</p>
                </div>
              )}

              {/* Quick status actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {["pending", "processing", "settled", "failed"]
                  .filter((s) => s !== selectedTxn.status)
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatus(selectedTxn._id, s)}
                      className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      Mark {STATUS_CONFIG[s]?.label || s}
                    </button>
                  ))}
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="btn-secondary ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 break-all text-right ml-3">
        {value}
      </span>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorClasses = {
    green: "bg-green-50 text-green-600 border-green-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-3">
        <div className="opacity-80">{icon}</div>
        <div>
          <p className="text-xs font-medium opacity-80">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
