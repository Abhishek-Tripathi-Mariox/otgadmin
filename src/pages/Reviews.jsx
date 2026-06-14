import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Star,
  Trash2,
  Send,
  X,
  MessageSquare,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const RATING_FILTERS = [
  { key: "", label: "All" },
  { key: "5", label: "5 ★" },
  { key: "4", label: "4 ★" },
  { key: "3", label: "3 ★" },
  { key: "2", label: "2 ★" },
  { key: "1", label: "1 ★" },
];

const Stars = ({ value = 0, size = 14 }) => (
  <div className="flex">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={size}
        className={
          s <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }
      />
    ))}
  </div>
);

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState("");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [reply, setReply] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: 1, limit: 50 };
      if (rating) params.rating = rating;
      if (search) params.search = search;
      const res = await api.get("/reviews", { params });
      setReviews(res.data?.data || []);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load reviews",
      );
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [rating, search]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const openDetail = (r) => {
    setDetail(r);
    setReply(r.reply?.text || "");
  };

  const sendReply = async () => {
    if (!detail) return;
    if (!reply.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
    try {
      setSaving(true);
      const res = await api.patch(`/reviews/${detail._id}/reply`, {
        text: reply.trim(),
      });
      toast.success("Reply posted");
      setReviews((prev) =>
        prev.map((r) => (r._id === detail._id ? res.data.data : r)),
      );
      setDetail(res.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to post reply");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this review permanently?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success("Review deleted");
      setReviews((prev) => prev.filter((r) => r._id !== id));
      if (detail?._id === id) setDetail(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete review");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Star size={22} className="text-yellow-500" />
          Product Reviews
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Ratings &amp; feedback customers left on materials.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-3 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-wrap">
          {RATING_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setRating(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                rating === f.key
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search in comments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {loading && reviews.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">
                  Product
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Customer
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Rating
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Comment
                </th>
                <th className="text-left p-4 font-medium text-gray-600">Date</th>
                <th className="text-right p-4 font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">
                      {r.material?.name || "—"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-700">
                      {r.user?.name || "Anonymous"}
                    </div>
                    {r.user?.mobile && (
                      <div className="text-xs text-gray-400">
                        {r.user.mobile}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <Stars value={r.rating} />
                  </td>
                  <td className="p-4 max-w-[280px]">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {r.comment || (
                        <span className="text-gray-400">No comment</span>
                      )}
                    </p>
                    {r.reply?.text && (
                      <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                        <MessageSquare size={12} /> Replied
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <button
                        onClick={() => openDetail(r)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                      >
                        <MessageSquare size={16} /> Reply
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && reviews.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-20">
                    No reviews found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Reply modal */}
      {detail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b">
              <div>
                <h2 className="text-lg font-bold">
                  {detail.material?.name || "Review"}
                </h2>
                <p className="text-xs text-gray-500">
                  {detail.user?.name || "Anonymous"}
                  {detail.user?.mobile ? ` · ${detail.user.mobile}` : ""}
                </p>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <Stars value={detail.rating} size={18} />
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {detail.comment || (
                  <span className="text-gray-400">No comment</span>
                )}
              </p>
              {detail.reply?.text && (
                <div className="bg-orange-50 border-l-2 border-orange-400 rounded px-3 py-2">
                  <div className="text-[10px] font-semibold text-orange-600 mb-1">
                    OTG reply
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {detail.reply.text}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t p-4 space-y-3">
              <textarea
                rows={3}
                className="input-field"
                placeholder="Write a reply to this review…"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  onClick={sendReply}
                  disabled={saving || !reply.trim()}
                  className="btn-primary flex items-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {detail.reply?.text ? "Update Reply" : "Send Reply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
