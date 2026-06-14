import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Send,
  Search,
  X,
  Trash2,
  Users,
  Store,
  Truck,
  Globe,
  UserCheck,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../services/api";

const TARGET_OPTIONS = [
  { value: "all", label: "All (Users + Vendors + Drivers)", icon: Globe },
  { value: "users", label: "All Users", icon: Users },
  { value: "vendors", label: "All Vendors", icon: Store },
  { value: "drivers", label: "All Drivers", icon: Truck },
  { value: "specific", label: "Specific Recipients", icon: UserCheck },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [form, setForm] = useState({
    title: "",
    message: "",
    targetType: "all",
  });

  // Specific recipients
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientType, setRecipientType] = useState("all");
  const [searchResults, setSearchResults] = useState({ users: [], vendors: [] });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [searchingRecipients, setSearchingRecipients] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications", {
        params: { page, limit: 10, search: searchQuery },
      });
      setNotifications(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchNotifications();
  };

  const searchRecipients = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults({ users: [], vendors: [] });
      return;
    }
    try {
      setSearchingRecipients(true);
      const res = await api.get("/notifications/recipients/search", {
        params: { search: query, type: recipientType },
      });
      setSearchResults(res.data.data);
    } catch {
      // silent
    } finally {
      setSearchingRecipients(false);
    }
  }, [recipientType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.targetType === "specific") {
        searchRecipients(recipientSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [recipientSearch, form.targetType, searchRecipients]);

  const toggleUser = (user) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  };

  const toggleVendor = (vendor) => {
    setSelectedVendors((prev) =>
      prev.find((v) => v._id === vendor._id)
        ? prev.filter((v) => v._id !== vendor._id)
        : [...prev, vendor]
    );
  };

  const handleSend = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.message.trim()) return toast.error("Message is required");

    if (
      form.targetType === "specific" &&
      selectedUsers.length === 0 &&
      selectedVendors.length === 0
    ) {
      return toast.error("Please select at least one recipient");
    }

    try {
      setSending(true);
      const payload = {
        title: form.title,
        message: form.message,
        targetType: form.targetType,
        ...(form.targetType === "specific" && {
          userIds: selectedUsers.map((u) => u._id),
          vendorIds: selectedVendors.map((v) => v._id),
        }),
      };
      const res = await api.post("/notifications/send", payload);
      toast.success(res.data.message || "Notification sent!");
      resetForm();
      setShowModal(false);
      fetchNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification record?")) return;
    try {
      await api.delete(`/notifications/${id}`);
      toast.success("Deleted");
      fetchNotifications();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const resetForm = () => {
    setForm({ title: "", message: "", targetType: "all" });
    setSelectedUsers([]);
    setSelectedVendors([]);
    setRecipientSearch("");
    setSearchResults({ users: [], vendors: [] });
  };

  const getTargetBadge = (type) => {
    const map = {
      all: { bg: "bg-blue-100", text: "text-blue-700", label: "All" },
      users: { bg: "bg-green-100", text: "text-green-700", label: "Users" },
      vendors: { bg: "bg-purple-100", text: "text-purple-700", label: "Vendors" },
      drivers: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Drivers" },
      specific: { bg: "bg-orange-100", text: "text-orange-700", label: "Specific" },
    };
    const s = map[type] || map.all;
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Send and manage push notifications
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition"
        >
          <Send size={16} />
          Send Notification
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          Search
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Bell size={32} className="mb-2" />
            <p className="text-sm">No notifications sent yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Sent At
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Sent By
                  </th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {notifications.map((n) => (
                  <tr key={n._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                        {n.message}
                      </p>
                    </td>
                    <td className="p-4">{getTargetBadge(n.targetType)}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {(n.sentTo?.userCount || 0) + (n.sentTo?.vendorCount || 0)}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {n.sentAt
                        ? new Date(n.sentAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {n.createdBy?.name || "-"}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(n._id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Send Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Send Notification
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Notification title"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  maxLength={200}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  placeholder="Write your notification message..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {form.message.length}/1000
                </p>
              </div>

              {/* Target Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send To *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {TARGET_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const selected = form.targetType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setForm((f) => ({ ...f, targetType: opt.value }))
                        }
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm text-left transition ${
                          selected
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <Icon size={16} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specific Recipient Picker */}
              {form.targetType === "specific" && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={recipientType}
                      onChange={(e) => setRecipientType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="all">All Types</option>
                      <option value="users">Users</option>
                      <option value="vendors">Vendors</option>
                    </select>
                    <div className="relative flex-1">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={recipientSearch}
                        onChange={(e) => setRecipientSearch(e.target.value)}
                        placeholder="Search by name, mobile, email..."
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* Selected chips */}
                  {(selectedUsers.length > 0 || selectedVendors.length > 0) && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedUsers.map((u) => (
                        <span
                          key={u._id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs"
                        >
                          <Users size={10} />
                          {u.name || u.mobile}
                          <button onClick={() => toggleUser(u)}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      {selectedVendors.map((v) => (
                        <span
                          key={v._id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs"
                        >
                          <Store size={10} />
                          {v.name || v.business?.name || v.mobile}
                          <button onClick={() => toggleVendor(v)}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Search results */}
                  {searchingRecipients && (
                    <div className="flex justify-center py-3">
                      <Loader2 size={16} className="animate-spin text-gray-400" />
                    </div>
                  )}

                  {(searchResults.users.length > 0 ||
                    searchResults.vendors.length > 0) && (
                    <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                      {searchResults.users.map((u) => {
                        const isSelected = selectedUsers.some(
                          (s) => s._id === u._id,
                        );
                        return (
                          <button
                            key={u._id}
                            onClick={() => toggleUser(u)}
                            className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition ${
                              isSelected ? "bg-green-50" : ""
                            }`}
                          >
                            <Users size={14} className="text-green-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium text-gray-700">
                                {u.name || "Unnamed User"}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {u.mobile} {u.email ? `· ${u.email}` : ""}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="text-green-600 text-xs font-medium">
                                Selected
                              </span>
                            )}
                          </button>
                        );
                      })}
                      {searchResults.vendors.map((v) => {
                        const isSelected = selectedVendors.some(
                          (s) => s._id === v._id,
                        );
                        return (
                          <button
                            key={v._id}
                            onClick={() => toggleVendor(v)}
                            className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition ${
                              isSelected ? "bg-purple-50" : ""
                            }`}
                          >
                            <Store
                              size={14}
                              className="text-purple-500 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium text-gray-700">
                                {v.name || v.business?.name || "Unnamed Vendor"}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {v.mobile} {v.email ? `· ${v.email}` : ""}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="text-purple-600 text-xs font-medium">
                                Selected
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition"
              >
                {sending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
