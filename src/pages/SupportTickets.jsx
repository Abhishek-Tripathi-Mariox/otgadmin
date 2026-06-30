import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Mail,
  Phone,
  Trash2,
  X,
  Eye,
  Send,
  CheckCircle2,
  XCircle,
  Inbox,
  Loader2,
  LifeBuoy,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getSupportTickets,
  getSupportTicketCounts,
  replyToSupportTicket,
  updateSupportTicketStatus,
  deleteSupportTicket,
  clearError,
  clearMessage,
} from "../store/slices/supportTicketSlice";

const STATUS_TABS = [
  { key: "open", label: "Open", icon: Inbox, color: "text-blue-600" },
  {
    key: "in_progress",
    label: "In Progress",
    icon: Loader2,
    color: "text-orange-600",
  },
  {
    key: "resolved",
    label: "Resolved",
    icon: CheckCircle2,
    color: "text-green-600",
  },
  { key: "closed", label: "Closed", icon: XCircle, color: "text-gray-500" },
];

const statusPillClass = (status) => {
  switch (status) {
    case "open":
      return "bg-blue-100 text-blue-700";
    case "in_progress":
      return "bg-orange-100 text-orange-700";
    case "resolved":
      return "bg-green-100 text-green-700";
    case "closed":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function SupportTickets() {
  const dispatch = useDispatch();
  const { tickets, counts, loading, error, message, saving } = useSelector(
    (s) => s.supportTickets,
  );

  const [statusTab, setStatusTab] = useState("open");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [reply, setReply] = useState("");
  const [replyStatus, setReplyStatus] = useState("in_progress");

  useEffect(() => {
    dispatch(getSupportTicketCounts());
  }, [dispatch]);

  useEffect(() => {
    const params = { status: statusTab, page: 1, limit: 50 };
    if (search) params.search = search;
    dispatch(getSupportTickets(params));
  }, [dispatch, statusTab, search]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
      dispatch(getSupportTicketCounts());
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [message, error, dispatch]);

  // When the detail modal opens for a new ticket, refresh from tickets list
  useEffect(() => {
    if (!detail) return;
    const fresh = tickets.find((t) => t._id === detail._id);
    if (fresh && fresh !== detail) setDetail(fresh);
  }, [tickets]); // eslint-disable-line react-hooks/exhaustive-deps

  const openDetail = (t) => {
    setDetail(t);
    setReply("");
    setReplyStatus(t.status === "open" ? "in_progress" : t.status);
  };

  const sendReply = async () => {
    if (!detail) return;
    if (!reply.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
    await dispatch(
      replyToSupportTicket({
        id: detail._id,
        data: { message: reply.trim(), status: replyStatus },
      }),
    );
    setReply("");
  };

  const changeStatus = (id, status) => {
    if (!confirm(`Mark this ticket as "${status.replace("_", " ")}"?`)) return;
    dispatch(updateSupportTicketStatus({ id, status }));
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this ticket permanently?")) return;
    await dispatch(deleteSupportTicket(id));
    if (detail?._id === id) setDetail(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <LifeBuoy size={22} className="text-orange-600" />
          Support Tickets
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Messages sent by customers from the Help screen.
        </p>
      </div>

      {/* Tabs */}
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

      {/* Search */}
      <div className="bg-white border rounded-xl p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by code, name, mobile, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {loading && tickets.length === 0 ? (
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
                  Message
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
              {tickets.map((t) => (
                <tr key={t._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">
                      {t.ticketCode}
                    </div>
                    <div className="text-xs text-gray-500">{t.name}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone size={14} />
                      {t.mobile}
                    </div>
                    {t.email && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Mail size={12} />
                        {t.email}
                      </div>
                    )}
                  </td>
                  <td className="p-4 max-w-[280px]">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {t.message}
                    </p>
                    {t.replies?.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {t.replies.length}{" "}
                        {t.replies.length === 1 ? "reply" : "replies"}
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${statusPillClass(
                        t.status,
                      )}`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <button
                        onClick={() => openDetail(t)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                      >
                        <Eye size={16} /> Open
                      </button>
                      {t.status !== "resolved" && t.status !== "closed" && (
                        <button
                          onClick={() => changeStatus(t._id, "resolved")}
                          className="px-2 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                          Resolve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && tickets.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-20">
                    No {statusTab.replace("_", " ")} tickets
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail / Reply modal */}
      {detail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b">
              <div>
                <h2 className="text-lg font-bold">
                  Ticket {detail.ticketCode}
                </h2>
                <p className="text-xs text-gray-500">
                  {detail.name} · {detail.mobile}
                  {detail.email ? ` · ${detail.email}` : ""}
                </p>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-3 min-h-[120px] max-h-[55vh]">
              {/* Original message */}
              <ChatBubble
                from="customer"
                authorName={detail.name}
                text={detail.message}
                createdAt={detail.createdAt}
              />
              {(detail.replies || []).map((r, idx) => (
                <ChatBubble
                  key={idx}
                  from={r.by}
                  authorName={r.by === "admin" ? "Support" : detail.name}
                  text={r.message}
                  createdAt={r.createdAt}
                />
              ))}
            </div>

            <div className="border-t p-4 space-y-3">
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-500">Set status to:</span>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value)}
                  className="input-field h-8 text-sm w-auto"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <textarea
                rows={3}
                className="input-field"
                placeholder="Type your reply…"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />

              <div className="flex justify-end">
                <button
                  onClick={sendReply}
                  disabled={saving || !reply.trim()}
                  className="btn-primary flex items-center gap-2"
                >
                  <Send size={16} />
                  {saving ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatBubble({ from, authorName, text, createdAt }) {
  const isAdmin = from === "admin";
  return (
    <div
      className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
          isAdmin
            ? "bg-orange-500 text-white rounded-tr-sm"
            : "bg-gray-100 text-gray-900 rounded-tl-sm"
        }`}
      >
        <div
          className={`text-[10px] font-semibold mb-1 ${
            isAdmin ? "text-white/80" : "text-gray-500"
          }`}
        >
          {authorName}
        </div>
        <p className="text-sm whitespace-pre-wrap">{text}</p>
        <div
          className={`text-[10px] mt-1 ${
            isAdmin ? "text-white/70" : "text-gray-400"
          }`}
        >
          {new Date(createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
